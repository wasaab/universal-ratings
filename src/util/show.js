import API, { graphqlOperation } from '@aws-amplify/api';
import { getShow, watchlistItemsByShow } from '../graphql/custom-queries';
import { searchClient } from '../client';
import { unwrapShowsAndUpdateAvgRatings, updateAvgRating } from './rating.js';

/**
 * Fetches the rated show with the provided ID.
 *
 * @param {string} showId - ID of the show to fetch
 * @returns {Object|undefined} the rated show if found
 */
export const fetchRatedShow = async (showId) => {
  try {
    const { data: { getShow: show } } = await API.graphql(graphqlOperation(getShow, { id: showId }));

    if (!show) { return; }

    if (show.rating) {
      updateAvgRating(show);
    }

    return show;
  } catch (err) {
    console.error(`Failed to get rated show "${showId}": `, err);
  }
};

/**
 * Fetches the rated version of the provided trending show.
 *
 * @param {Object} show - the show to fetch
 * @returns {Object} the rated show if found; otherwise the provided show.
 */
export const maybeFetchRatedTrendingShow = async (show) => await fetchRatedShow(show.id) ?? show;

export async function maybeAddShowMetadata(show) {
  if (show.providerIds) { return; } // metadata already populated

  const { data } = await searchClient.fetchShowByIdAndType(show.tmdbId, show.type, show.id);

  Object.assign(show, data);
}

/**
 * Determines if the show is in any user's watchlist.
 *
 * @param {string} showId - id of the show
 * @returns {boolean} whether the show is in any user's watchlist
 */
export async function isInAnyUsersWatchlist(showId) {
  try {
    const { data } = await API.graphql(graphqlOperation(watchlistItemsByShow, { showId, limit: 1 }));

    return data.watchlistItemsByShow.items.length !== 0;
  } catch (err) {
    console.error('Failed to determine if show has watchlist items.', err);

    return false;
  }
};

/**
 * Builds the user's watchlist with updated avg ratings, sorted by
 * creation date in descending order.
 *
 * @param {Object[]} shows - the shows in the user's watchlist
 * @returns {Object[]} the user's watchlist
 */
 export function buildWatchlist(shows) {
  const existingShows = shows.filter(({ show }) => show)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return unwrapShowsAndUpdateAvgRatings(existingShows);
}

export const determineShorterDesc = (tmdbDesc, omdbDesc) => {
  if (!omdbDesc) { return tmdbDesc; }

  return tmdbDesc.length < omdbDesc.length ? tmdbDesc : omdbDesc;
};