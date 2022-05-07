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
   * Builds the host of the algolia search url.
   * If retrying a failed request, the next fallback host is used.
   * 
   * @param {number} retriesRemaining - the number of request retries remaining
   * @returns {string} the host of the search url
   */
  buildHost(retriesRemaining) {
    const hostPostfix = retriesRemaining === this.fallbacks.length
      ? 'dsn.algolia.net'
      : `${this.fallbacks[retriesRemaining]}.algolianet.com`;

    return `${this.appId}-${hostPostfix}`;
  }

  /**
   * Builds the request url for algolia search with the provided fallback host postfix.
   *
   * @param {number} retriesRemaining - the number of req retries remaining
   * @returns {string} the request url
   */
  buildUrl(retriesRemaining) {
    return `https://${this.buildHost(retriesRemaining)}/1/indexes/show/query`;
  }

  /**
   * Searches for shows matching the provided query.
   * Retries on failure, using a different fallback host each time.
   *
   * @param {Object} params - the request parameters
   * @param {string} params.query - the query to search for
   * @param {number=} params.hitsPerPage - show hits per page (limit 1000)
   * @param {string[]=} params.attributesToRetrieve - the show attributes to retrieve
   * @param {number=} retriesRemaining - the number of req retries remaining
   * @returns {Promise<Object[]>} matching shows
   */
  async search(params, retriesRemaining = this.fallbacks.length) {
    try {
      const { data } = await axios.post(this.buildUrl(retriesRemaining), params, this.reqConfig);

      return data;
    } catch (err) {
      if (!retriesRemaining || axios.isCancel(err)) { throw err; }

      return this.search(params, retriesRemaining - 1);
    }
  }

  /**
   * Searches algolia by title for matching shows.
   *
   * @param {string} title - the title to search for
   * @param {CancelToken=} cancelToken - the token used to cancel the req
   * @returns {Promise<Object[]>} matching shows
   */
  searchByTitle(title, cancelToken) {
    this.reqConfig.cancelToken = cancelToken;

    return this.search({ query: title });
  }
}