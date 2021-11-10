import { OmdbApiClient, TmdbApiClient } from '../../src/client';

const omdbApi = new OmdbApiClient(process.env.OMDB_API_KEY);
const tmdbApi = new TmdbApiClient(process.env.TMDB_API_KEY);

async function fetchExternalRatingsAndDesc(tmdbId, type, imdbId) {
  if (!imdbId) {
    imdbId = await tmdbApi.getImdbId(tmdbId, type);
  }

  return omdbApi.fetchExternalRatingsAndDesc(imdbId);
}

async function queryByIdAndType(tmdbId, type, imdbId) {
  const [ratingsAndDesc, providerIds] = await Promise.all([
    fetchExternalRatingsAndDesc(tmdbId, type, imdbId),
    tmdbApi.getProviderIds(tmdbId, type)
  ]);

  return {
    tmdbId,
    providerIds,
    ...ratingsAndDesc
  };
}

function fetchShows({ id, imdbId, title, type }) {
  if (title) { return tmdbApi.queryAllByTitle(title); }
  if (id) { return queryByIdAndType(id, type, imdbId); }

  return tmdbApi.getTrendingShows();
}

export default async function handler({ query }, res) {
  try {
    const shows = await fetchShows(query);

    res.status(200).json(shows);
  } catch (err) {
    const message = 'Cannot find matching show(s)';

    console.error(message, err);
    res.status(500).send(message);
  }
}