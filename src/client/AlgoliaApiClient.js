import axios from 'axios';

export default class AlgoliaApiClient {
  constructor(appId, searchApiKey) {
    this.appId = appId;
    this.reqConfig = {
      headers: {
        'X-Algolia-Application-Id': appId,
        'X-Algolia-API-Key': searchApiKey
      }
    };
    this.fallbacks = this.randomizeFallbacks();
  }

  /**
   * Randomize the algolia fallback hosts 1-4, to distribute the load
   * between clients when requests fail.
   * Based on Fisher–Yates Shuffle.
   *
   * @returns {number[]} the randomized fallback host postfixes
   */
  randomizeFallbacks() {
    const fallbacks = [1, 2, 3, 4];

    for (let i = fallbacks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [fallbacks[i], fallbacks[j]] = [fallbacks[j], fallbacks[i]];
    }

    return fallbacks;
  }

  /**
   * Gets the next fallback host if retrying a failed request.
   *
   * @param {number} retriesRemaining - the number of request retries remaining
   * @returns {string|number} the fallback host postfix
   */
  getFallback(retriesRemaining) {
    return retriesRemaining === this.fallbacks.length ? '' : this.fallbacks[retriesRemaining];
  }

  /**
   * Builds the request url for algolia search with the provided fallback host postfix.
   *
   * @param {number} retriesRemaining - the number of req retries remaining
   * @returns {string} the request url
   */
  buildUrl(retriesRemaining) {
    const fallback = this.getFallback(retriesRemaining);

    return `https://${this.appId}${fallback}-dsn.algolia.net/1/indexes/show/query`;
  }

  /**
   * Searches for shows matching the provided query.
   * Retries on failure, using a different fallback host each time.
   *
   * @param {string} query - the query to search for
   * @param {number} retriesRemaining - the number of req retries remaining
   * @returns {Promise<Object[]>} matching shows
   */
  async search(query, retriesRemaining = this.fallbacks.length) {
    try {
      const { data } = await axios.post(this.buildUrl(retriesRemaining), { query }, this.reqConfig);

      return data;
    } catch (err) {
      if (!retriesRemaining || axios.isCancel(err)) { throw err; }

      return this.search(query, retriesRemaining - 1);
    }
  }

  /**
   * Searches algolia by title for matching shows.
   *
   * @param {string} title - the title to search for
   * @param {CancelToken} cancelToken - the token used to cancel the req
   * @returns {Promise<Object[]>} matching shows
   */
  searchByTitle(title, cancelToken) {
    this.reqConfig.cancelToken = cancelToken;

    return this.search(title);
  }
}