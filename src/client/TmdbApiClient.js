/* eslint-disable camelcase */
import axios from 'axios';

const imgBasePath = 'https://image.tmdb.org/t/p';

class Show {
    constructor({ id, title, name, overview, media_type, release_date, first_air_date, poster_path, backdrop_path }) {
        this.id = `${id}`;
        this.title = title ?? name;
        this.type = media_type;
        this.description = overview;
        this.img = poster_path ? `${imgBasePath}/w342/${poster_path}` : null;
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

    async getImdbId(tmdbId, type) {
        const path = `/${type}/${tmdbId}/external_ids?api_key=${this.apiKey}`;
        const { data: { imdb_id } } = await axios.get(`${this.baseUrl}${path}`);

        return imdb_id;
    }
}