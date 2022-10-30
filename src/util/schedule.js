import moment from 'moment';
import API, { graphqlOperation } from '@aws-amplify/api';
import { reviewsByUser } from '../graphql/custom-queries';
import { ShowType } from '../model';
import { searchClient } from '../client';
import { unwrapShowsAndUpdateAvgRatings } from './rating';

/**
 * Determines if the episode air date is within 2 weeks of today.
 *
 * @param {string} airDate - the air date of the episode
 * @returns {boolean} whether the episode is recently aired
 */
function isRecentlyAired(airDate) {
  if (!airDate) { return false; }

  const dayDiff = moment()
    .startOf('day')
    .diff(moment(airDate), 'days');

  return Math.abs(dayDiff) <= 14;
}

/**
 * Builds the mapping of date to episodes that air on that day
 * for the season of a show.
 *
 * @param {string} showId - ID of the show to build date to episode mapping for
 * @param {Object[]} episodes - the episodes in the season
 * @param {number} seasonNum - the season number
 * @returns {Object} the date to episode mapping
 */
function buildSeasonDateToEpisodes(showId, episodes, seasonNum) {
  const dateToEpisodes = {};

  episodes.forEach(({ airDate, title, episodeNum, description }) => {
    const episode = { showId, title, seasonNum, episodeNum };

    if (description) {
      episode.description = description;
    }

    if (episodeNum === episodes.length) {
      episode.isFinale = true;
    }

    if (dateToEpisodes[airDate]) {
      dateToEpisodes[airDate].push(episode);
    } else {
      dateToEpisodes[airDate] = [episode];
    }
  });

  return dateToEpisodes;
}

/**
 * Populates the episode schedule for the provided show's latest season.
 *
 * @param {Object} show - the show to fetch episodes of
 * @param {boolean=} unlimitedTimeframe - whether the air date timeframe should be unlimited
 * @returns {Object} the updated show
 */
export async function getEpisodesOfLatestSeason(show, unlimitedTimeframe) {
  try {
    const { data: { lastAirDate, nextAirDate, seasonNum } } = await searchClient.fetchScheduleMetadata(show.tmdbId);

    if (!unlimitedTimeframe && !isRecentlyAired(lastAirDate) && !isRecentlyAired(nextAirDate)) { return; }

    const { data: episodes } = await searchClient.fetchEpisodesOfSeason(show.tmdbId, seasonNum);

    show.seasonNum = seasonNum;
    show.dateToEpisodes = buildSeasonDateToEpisodes(show.id, episodes, seasonNum);
  } catch (err) {
    console.error(`Failed to fetch schedule for show "${show.id}"`, err);

    return;
  }

  return show;
}

/**
 * Builds or updates the overall mapping of date to episodes
 * that air on that day for all of the provided shows.
 *
 * @param {Object[]} shows - the shows to include in the schedule
 * @param {Object=} overallDateToEpisodes - the existing mapping of date to episodes
 * @param {number=} priorDaysCount - the included number of days prior to today
 * @param {number=} followingDaysCount - the included number of days after today
 * @returns {Object} the updated mapping of date to episodes
 */
export function buildOrUpdateOverallDateToEpisodes(shows, overallDateToEpisodes = {}, priorDaysCount = 14, followingDaysCount = priorDaysCount) {
  const date = moment().subtract(priorDaysCount + 1, 'days');
  let daysCount = priorDaysCount + followingDaysCount + 1;  // account for today

  do {
    const day = date.add(1, 'days').format('YYYY-MM-DD'); // date addition is cumulative
    const epsOnDay = shows
      .flatMap((show) => show.dateToEpisodes[day])
      .filter((ep) => ep);

    if (epsOnDay.length === 0) { continue; }

    if (overallDateToEpisodes[day]) {
      overallDateToEpisodes[day].push(...epsOnDay);
    } else {
      overallDateToEpisodes[day] = epsOnDay;
    }
  } while (--daysCount);

  return overallDateToEpisodes;
}

/**
 * Populates the episode schedule for the latest season of the provided show.
 *
 * @param {Object} show - the show to fetch schedule of
 * @returns {Object} the updated show
 */
export async function fetchShowSchedule(show) {
  const updatedShow = await getEpisodesOfLatestSeason(show, true);

  if (!updatedShow?.dateToEpisodes) {
    return { ...show, dateToEpisodes: {} };
  }

  return updatedShow;
}

/**
 * Fetches the TV shows reviewed by the user and combines
 * them with the TV shows the user has added to their watchlist.
 *
 * @param {Object[]} watchlist - the user's watchlist
 * @param {string} userId - the ID of the user
 * @returns {Object[]} the shows the user has reviewed or added to their watchlist
 */
async function buildReviewedAndWatchlistedTvShows(watchlist, userId) {
  const findWatchlistShowIdx = ({ id }) => watchlist.findIndex((show) => show.id === id);
  const isWatchlisted = (show) => -1 !== findWatchlistShowIdx(show);
  let reviewedShows = [];

  try {
    const { data } = await API.graphql(graphqlOperation(reviewsByUser, { userId, limit: 1000 }));

    reviewedShows = unwrapShowsAndUpdateAvgRatings(data.reviewsByUser.items)
      .filter((show) => !isWatchlisted(show));
  } catch (err) {
    console.error('Failed to get shows reviewed by user:', err);
  }

  return reviewedShows.concat(watchlist)
    .filter(({ type }) => type === ShowType.TV);
}

/**
 * Fetches the overall schedule for shows the user
 * has rated or added to their watchlist.
 *
 * @param {string} userId - the ID of the user
 * @param {Object[]} watchlist - the user's watchlist
 * @returns {{ recentShows: Object[], overallDateToEpisodes: Object }} the overall schedule
 */
export async function fetchOverallShowSchedule(userId, watchlist) {
  const tvShows = await buildReviewedAndWatchlistedTvShows(watchlist, userId);
  const airingShows = await Promise.all(tvShows.map((show) => getEpisodesOfLatestSeason(show)));
  const recentShows = airingShows.filter((show) => show); // filter out shows that had no recent eps

  return {
    recentShows,
    overallDateToEpisodes: buildOrUpdateOverallDateToEpisodes(recentShows)
  };
}

/**
 * Removes the provided show from the schedule.
 *
 * @param {Object} show - the show to remove from the schedule
 * @param {Object} dateToEpisodes - the overall mapping of date to episodes for all shows
 */
export function removeShowFromSchedule(show, dateToEpisodes) {
  Object.keys(show.dateToEpisodes).forEach((day) => {
    const epsOnDay = dateToEpisodes[day]?.filter(({ showId }) => showId !== show.id);

    if (epsOnDay?.length === 0) {
      delete dateToEpisodes[day];
    } else if (epsOnDay) {
      dateToEpisodes[day] = epsOnDay;
    }
  });
}