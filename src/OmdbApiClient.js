import axios from 'axios';

class OmdbShowType {
    static TV = 'series';
    static MOVIE = 'movie';
}

function parseOptional(optionalVal) {
    return optionalVal === 'N/A' ? null : optionalVal;
}

function findRtRating(ratings) {
    const rtRating = ratings?.find(({ Source }) => Source === 'Rotten Tomatoes');

    return rtRating ? Number(rtRating.Value.slice(0, -1)) : null;
}

class Show {
    constructor({ imdbID, Title, Type, Poster, Year, Plot, imdbRating, Ratings }) {
        this.id = imdbID;
        this.title = Title;
        this.type = Type.replace(OmdbShowType.TV, 'tv'),
        this.img = parseOptional(Poster);
        this.year = Number(Year.replace(/–.*/, ''));
        this.description = parseOptional(Plot);
        this.imdbRating = imdbRating === 'N/A' ? null : Number(imdbRating)
        this.rtRating = findRtRating(Ratings);
    }
}

// Todo: Remove after OMDB closes their issue regarding duplicates: https://github.com/Omertron/api-omdb/issues/16
function isUnique(shows, currShow, currShowIdx) {
    return shows.findIndex(({ id }) => id === currShow.id) === currShowIdx;
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
            .filter((show, i, self) => show.type !== 'game' && isUnique(self, show, i));
    }

    /**
     * Queries omdb for all matches of provided title.
     *
     * @param {string} title the title to find matches for
     * @param {OmdbShowType} type the show type to find matches for
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