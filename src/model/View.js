export default class View {
  static HOME = new View('Home', { source: 'UR' });
  static TV = new View('TV Shows', { type: 'tv' });
  static MOVIES = new View('Movies', { type: 'movie' });
  static RECENTLY_RELEASED = new View('Recently Released');
  static RECENTLY_RATED = new View('Recently Rated');
  static FAVORITES = new View('Favorites');
  static WATCHLIST = new View('Watchlist');
  static WATCHED = new View('Watched');

  constructor(label, query) {
    this.label = label;
    this.query = query;
  }
}