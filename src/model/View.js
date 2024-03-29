import ShowType from './ShowType';

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
  static HOME = new View('Home', ...recentlyRatedArgs, '');
  static TV = new View('TV Shows', 'showsByType', { type: ShowType.TV, filter: { source: { eq: source } } });
  static MOVIES = new View('Movies', 'showsByType', { type: ShowType.MOVIE, filter: { source: { eq: source } } });
  static FAVORITES = new View('Favorites', 'reviewsByUser', { filter: { isFavorite: { eq: true } } });
  static WATCHLIST = new View('Watchlist');
  static WATCHED = new View('Watched', 'reviewsByUser', {}, true);
  static RECENTLY_RATED = new View('Recently Rated', ...recentlyRatedArgs);
  static RECENTLY_RELEASED = new View('Recently Released', recentlyRatedArgs[0], buildRecentlyReleasedQueryParams());
  static SCHEDULE = new View('Schedule', null, null, true);

  constructor(label, queryName, queryParams = {}, includeAdded, path = label.toLowerCase()) {
    this.path = `/${encodeURIComponent(path)}`;
    this.label = label;
    this.query = {
      name: queryName,
      params: queryParams
    };
    this.includeAdded = includeAdded;
  }

  static fromShowType(showType) {
    return showType === ShowType.TV ? this.TV : this.MOVIES;
  }

  static fromPath(targetPath) {
    return Object.values(View).find(({ path }) => path === targetPath);
  }
}