const source = 'UR';
const recentlyRatedArgs = ['recentlyRated', { source }, true];

function buildRecentlyReleasedQueryParams() {
  const newReleaseThreshold = new Date();

  newReleaseThreshold.setMonth(newReleaseThreshold.getMonth() - 3);

  return {
    source,
    filter: {
      releaseDate: { gt: newReleaseThreshold.toISOString() }
    }
  };
}

export default class View {
  static HOME = new View('Home', ...recentlyRatedArgs);
  static TV = new View('TV Shows', 'showsByType', { type: 'tv', filter: { source: { eq: source } } });
  static MOVIES = new View('Movies', 'showsByType', { type: 'movie', filter: { source: { eq: source } } });
  static FAVORITES = new View('Favorites', 'reviewsByUser', { filter: { isFavorite: { eq: true } } });
  static WATCHLIST = new View('Watchlist');
  static WATCHED = new View('Watched', 'reviewsByUser', {}, true);
  static RECENTLY_RATED = new View('Recently Rated', ...recentlyRatedArgs);
  static RECENTLY_RELEASED = new View('Recently Released', recentlyRatedArgs[0], buildRecentlyReleasedQueryParams());

  constructor(label, queryName, queryParams = {}, includeAdded) {
    this.label = label;
    this.query = {
      name: queryName,
      params: queryParams
    };
    this.includeAdded = includeAdded;
  }

  static fromShowType(showType) {
    return showType === 'tv' ? this.TV : this.MOVIES;
  }
}