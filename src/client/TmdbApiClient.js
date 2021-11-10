/* eslint-disable camelcase */
import axios from 'axios';
import providerIdToInfo from '../../resources/data/providers';

const imgBasePath = 'https://image.tmdb.org/t/p';

class Show {
  constructor({ id, title, name, overview, media_type, release_date, first_air_date, poster_path, backdrop_path }) {
    this.id = `${id}`;
    this.title = title ?? name;
    this.type = media_type;
    this.description = overview;
    this.img = poster_path ? `${imgBasePath}/w342${poster_path}` : null;
    this.backgroundImg = backdrop_path ? `${imgBasePath}/w1280${backdrop_path}` : null;
    this.releaseDate = new Date(release_date ?? first_air_date).toISOString();
  }
}

export default class TmdbApiClient {
  constructor(apiKey) {
    this.baseUrl = `https://api.themoviedb.org/3`;
    this.apiKey = apiKey;
  }

  isReleasedShow({ media_type, release_date, first_air_date }) {
    return media_type !== 'person' && (release_date || first_air_date);
  }

  async requestAll(path) {
    const { data: { results } } = await axios.get(`${this.baseUrl}${path}`);

    return results
      .filter(this.isReleasedShow)
      .map((show) => new Show(show));
  }

  /**
   * Queries TMDB for all matches of provided title.
   *
   * @param {string} title the title to find matches for
   * @returns {Promise<Show[]>} matching shows
   */
  queryAllByTitle(title) {
    return this.requestAll(`/search/multi?query=${title}&api_key=${this.apiKey}`);
  }

  /**
   * Sets the show's IMDB & TMDB IDs after retreiving the IMDB ID.
   *
   * @param {Show} show - show to append imdbId to
   */
  async appendImdbId(show) {
    const imdbId = await this.getImdbId(show.id, show.type);

    show.tmdbId = show.id;
    show.id = imdbId;
  }

  /**
   * Gets trending shows for the week.
   *
   * @returns {Promise<Show[]>} trending shows
   */
  async getTrendingShows() {
    const shows = await this.requestAll(`/trending/all/week?api_key=${this.apiKey}`);

    await Promise.all(shows.map((show) => this.appendImdbId(show)));

    return shows;
  }

  async getImdbId(tmdbId, type) {
    const path = `/${type}/${tmdbId}/external_ids?api_key=${this.apiKey}`;
    const { data: { imdb_id } } = await axios.get(`${this.baseUrl}${path}`);

    return imdb_id;
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