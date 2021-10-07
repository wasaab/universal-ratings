import { OmdbApiClient, TmdbApiClient } from '../../src/client';

const omdbApi = new OmdbApiClient(process.env.OMDB_API_KEY);
const tmdbApi = new TmdbApiClient(process.env.TMDB_API_KEY);

function fetchExternalRatingsAndDesc(tmdbId, type) {
  return tmdbApi.getImdbId(tmdbId, type)
    .then((imdbId) => omdbApi.fetchExternalRatingsAndDesc(imdbId));
}

async function queryByIdAndType(tmdbId, type) {
  const [ratingsAndDesc, providerIds] = await Promise.all([
    fetchExternalRatingsAndDesc(tmdbId, type),
    tmdbApi.getProviderIds(tmdbId, type)
  ]);

  return {
    tmdbId,
    providerIds,
    ...ratingsAndDesc
  };
}

export default async function handler({ query: { id, title, type } }, res) {
  try {
    const shows = title ? await tmdbApi.queryAllByTitle(title) : await queryByIdAndType(id, type);

    res.status(200).json(shows);
  } catch (err) {
    const message = 'Cannot find matching show(s)';

    console.error(message, err);
    res.status(500).send(message);
  }
}