import axios from 'axios';
import LruCache from 'lru-cache';
import AlgoliaApiClient from './AlgoliaApiClient';

export default class SearchClient {
  constructor() {
    this.request = null;
    this.query = null;
    this.algolia = new AlgoliaApiClient('QVUO52LVSK', 'ae8c0c082adf1cd9dace13ea68322713');
    this.cache = new LruCache({
      max: 500,
      length: ({ length }) => length
    });
  }

  /**
   * Updates cache if the provided title is not already cached.
   *
   * @param {string} title - title query
   * @param {Object[]} shows - shows to cache
   */
  maybeUpdateCache(title, shows) {
    if (!title || this.cache.has(title)) { return; }

    this.cache.set(title, shows);
  }

  /**
   * Fetches rated (Algolia) and unrated (TMDB) show matches for the provided title.
   *
   * @param {string} title - the title to search for
   * @returns {Promise<Object[]>} matching shows
   */
  async fetchRatedAndUnratedShows(title) {
    const [ratedShowsResp, unratedShowsResp] = await Promise.all([
      this.algolia.searchByTitle(title, this.cancelToken),
      axios.get(`/api/search?title=${title}`, { cancelToken: this.request.token })
    ]);
    const uniqueUnratedShows = unratedShowsResp.data.filter(({ id }) => {   // eslint-disable-line arrow-body-style
      return -1 === ratedShowsResp.hits.findIndex(({ tmdbId }) => tmdbId === id);
    });
    const shows = ratedShowsResp.hits.concat(uniqueUnratedShows);

    this.maybeUpdateCache(title, shows);

    return shows;
  }

  /**
   * Fetches show matches for the provided title.
   * On each request, the previous request is cancelled, via axios CancelToken.
   * This prevents the user from seeing stale results when a race condition occurs.
   *
   * @param {string} title - the title to search for
   * @returns {Promise<Object[]>} matching shows
   */
  fetchShows(title) {
    this.request?.cancel(); // cancel previous request

    this.request = axios.CancelToken.source();

    return this.fetchRatedAndUnratedShows(title);
  }

  /**
   * Cancels in progress show request via axios CancelToken.
   */
  cancelShowsRequest() {
    this.request?.cancel();
  }

  /**
   * Checks if the query is stale by comparing the provided title
   * to the most recently queried title.
   *
   * Handles input change race condition caused by debounced fetch,
   * followed by cache hit or input clear prior to fetch resolving.
   *
   * @param {string} title - title query to check for staleness
   * @returns {boolean} wether or not the query is stale
   */
  isStaleQuery(title) {
    return title !== this.query;
  }
}