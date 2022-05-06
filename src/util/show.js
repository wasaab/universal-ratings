import API, { graphqlOperation } from '@aws-amplify/api';
import { getShow as gqlGetShow } from '../graphql/custom-queries';
import { searchClient } from '../client';
import { unwrapShowsAndUpdateAvgRatings, updateAvgRating } from './rating.js';

/**
 * Fetches the rated show with the provided ID.
 *
 * @param {string} showId - ID of the show to fetch
 * @param {APIClass=} api - Amplify server/client-side API to use for GraphQL request
 * @returns {Object|undefined} the rated show if found
 */
export const fetchRatedShow = async (showId, api = API) => { // Todo: Remove api param if not getting server-side
  try {
    const { data: { getShow: show } } = await api.graphql(graphqlOperation(gqlGetShow, { id: showId }));

    if (!show) { return; }

    if (show.rating) {
      updateAvgRating(show);
    }

    return show;
  } catch (err) {
    console.error(`Failed to get rated show "${showId}": `, err);
  }
};

// Todo: Remove this if not getting client-side
/**
 * Fetches the rated version of the provided trending show.
 *
 * @param {Object} show - the show to fetch
 * @returns {Object} the rated show if found; otherwise the provided show.
 */
export const maybeFetchRatedTrendingShow = async (show) => await fetchRatedShow(show.id) ?? show;

// Todo: Remove this if not getting server-side
/**
 * Builds a fetcher to get the rated version of the provided unrated show.
 * Uses the provided api for compatibility with server-side and client-side requests.
 *
 * @param {APIClass=} api - Amplify server/client-side API to use for GraphQL request
 * @returns {(show: Object) => Object} fetcher that returns the rated show if found; otherwise provided show.
 */
export const buildRatedShowFetcher = (api) => async (show) => await fetchRatedShow(show.id, api) ?? show;

export async function maybeAddShowMetadata(show) {
  if (show.providerIds) { return; } // metadata already populated

  const { data } = await searchClient.fetchShowByIdAndType(show.tmdbId, show.type, show.id);

  Object.assign(show, data);
}

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