import axios from 'axios';

class ShowType {
    static TV = 'series';
    static MOVIE = 'movie';
}

class Show {
    constructor({ imdbID, Title, Type, Poster, Year }) {
        this.imdbId = imdbID;
        this.title = Title;
        this.type = Type === 'series' ? 'tv' : Type,
        this.img = Poster;
        this.year = Year.replace(/–.*/, '');
    }
}
      
class OmdbApiClient {
    constructor(apiKey) {
        this.baseUrl = `http://www.omdbapi.com/?apikey=${apiKey}`;
    }

    async request(url) {
        const { data } = await axios.get(url);

        return new Show(data);
    }

    async requestAll(url) {
        const { data: { Search: shows } } = await axios.get(url);

        if (!shows) { return []; }

        return shows.map((show) => new Show(show))
            .filter(({ type }) => type !== 'game');
    }
    
    /**
     * Queries omdb for all matches of provided title.
     * 
     * @param {string} title the title to find matches for
     * @param {ShowType} type the show type to find matches for
     * @returns {Promise<Show[]>} matching shows
     */
    async queryAllByTitle(title, type = '') {
        return this.requestAll(`${this.baseUrl}&s=${title}&type=${type}`);
    }

    async queryByTitle(title, type = '') {
        return this.request(`${this.baseUrl}&t=${title}&type=${type}`);
    }

    async queryById(imdbId) {
        return this.request(`${this.baseUrl}&i=${imdbId}`);
    }
}

export default OmdbApiClient;