import OmdbApiClient from '../../src/OmdbApiClient';

const omdbApi = new OmdbApiClient(process.env.OMDB_API_KEY);

export default async function handler({ query }, res) {
  const shows = await omdbApi.queryAllByTitle(query.title);

  res.status(200).json(shows);
}