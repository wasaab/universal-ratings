const source = 'UR';
const recentlyRatedArgs = ['recentlyRated', { source }];
const newReleaseThreshold = new Date();

newReleaseThreshold.setMonth(newReleaseThreshold.getMonth() - 3);

export default class View {
  static HOME = new View('Home', ...recentlyRatedArgs);
  static TV = new View('TV Shows', 'showsByType', { type: 'tv', filter: { source: { eq: source } } });
  static MOVIES = new View('Movies', 'showsByType', { type: 'movie', filter: { source: { eq: source } } });
  static FAVORITES = new View('Favorites', 'reviewsByUser', { filter: { isFavorite: { eq: true } } });
  static WATCHLIST = new View('Watchlist');
  static WATCHED = new View('Watched', 'reviewsByUser');
  static RECENTLY_RATED = new View('Recently Rated', ...recentlyRatedArgs);
  static RECENTLY_RELEASED = new View(
    'Recently Released',
    recentlyRatedArgs[0],
    {
      ...recentlyRatedArgs[1],
      filter: { releaseDate: { gt: newReleaseThreshold.toISOString() } }
    }
  );

  constructor(label, queryName, queryParams = {}) {
    this.label = label;
    this.query = {
      name: queryName,
      params: queryParams
    };
  }
}