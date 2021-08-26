import OmdbApiClient from '../../src/OmdbApiClient';

const omdbApi = new OmdbApiClient(process.env.OMDB_API_KEY);

export default async function handler({ query: { title, id } }, res) {
  const shows = title ? await omdbApi.queryAllByTitle(title) : await omdbApi.queryById(id);

  res.status(200).json(shows);
}