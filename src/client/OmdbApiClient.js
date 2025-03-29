import axios from 'axios';

export default class OmdbApiClient {
  constructor(apiKey) {
    this.baseUrl = `http://www.omdbapi.com/?apikey=${apiKey}`;
  }

  findRtRating(ratings) {
    const rtRating = ratings?.find(({ Source }) => Source === 'Rotten Tomatoes');

    return rtRating ? Number(rtRating.Value.slice(0, -1)) : null;
  }

  async fetchExternalRatingsAndDesc(imdbId) {
    const { data: { imdbRating, Ratings, Plot } } = await axios.get(`${this.baseUrl}&i=${imdbId}`);
    const parsedImdbRating = Number(imdbRating);

    return {
      id: imdbId,
      imdbRating: Number.isNaN(parsedImdbRating) ? null : parsedImdbRating,
      rtRating: this.findRtRating(Ratings),
      description: Plot === 'N/A' ? null : Plot
    };
  }
}