/* eslint-disable camelcase */
import axios from 'axios';

const providerIdToInfo = {
  8: {
    name: 'netflix',
    networkId: 213,
  },
  15: {
    name: 'hulu',
    networkId: 453,
  },
  9: {
    name: 'amazon',
    networkId: 1024,
  },
  384: {
    name: 'hbo',
    networkId: 3186,
  },
  337: {
    name: 'disney',
    networkId: 2739,
  },
  350: {
    name: 'apple',
    networkId: 2552,
  },
  386: {
    name: 'peacock',
    networkId: 3353,
  }
};

export default class TmdbApiClient {
  constructor(apiKey) {
    this.baseUrl = `https://api.themoviedb.org/3`;
    this.apiKey = apiKey;
  }

  /**
   * Gets the IDs of streaming providers that offer the show.
   *
   * @param {string} tmdbId the show's TMDB ID
   * @param {string} type type of the show (tv or movie)
   * @returns {string[]} the provider IDs
   */
  async getProviderIds(tmdbId, type) {
    const path = `/${type}/${tmdbId}/watch/providers?api_key=${this.apiKey}`;
    const { data: { results } } = await axios.get(`${this.baseUrl}${path}`);
    const subProviders = results.US?.flatrate ?? [];
    const adProviders = results.US?.ads ?? [];

    return subProviders.concat(adProviders)
      .flatMap(({ provider_id }) => (providerIdToInfo[provider_id] ? [provider_id] : []));
  }
}