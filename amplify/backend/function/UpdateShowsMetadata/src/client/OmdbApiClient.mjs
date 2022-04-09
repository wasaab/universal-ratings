import axios from 'axios';

export default class OmdbApiClient {
  constructor(apiKey) {
    this.baseUrl = `http://www.omdbapi.com/?apikey=${apiKey}`;
  }

  findRtRating(ratings) {
    const rtRating = ratings?.find(({ Source }) => Source === 'Rotten Tomatoes');

    return rtRating ? Number(rtRating.Value.slice(0, -1)) : null;
  }

  async fetchExternalRatings(imdbId) {
    const { data: { imdbRating, Ratings } } = await axios.get(`${this.baseUrl}&i=${imdbId}`);

    return {
      imdbRating: imdbRating === 'N/A' ? null : Number(imdbRating),
      rtRating: this.findRtRating(Ratings),
    };
  }
}