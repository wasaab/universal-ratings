/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	API_UNIVERSALRATINGS_SHOWTABLE_NAME
	API_UNIVERSALRATINGS_SHOWTABLE_ARN
	API_UNIVERSALRATINGS_GRAPHQLAPIIDOUTPUT
	TMDB_API_KEY
	OMDB_API_KEY
Amplify Params - DO NOT EDIT */

import aws from 'aws-sdk';
import { OmdbApiClient, TmdbApiClient, AlgoliaApiClient } from './client/index.mjs';
import pLimit from 'p-limit';

const awsConcurrentRequestLimit = 1024;
const dynamoDb = new aws.DynamoDB.DocumentClient({ convertEmptyValues: true });
const algoliaApi = new AlgoliaApiClient('QVUO52LVSK', 'ae8c0c082adf1cd9dace13ea68322713');
const omdbApi = new OmdbApiClient(process.env.OMDB_API_KEY);
const tmdbApi = new TmdbApiClient(process.env.TMDB_API_KEY);

function populateProviderParams({ value: providerIds }, params) {
  params.ExpressionAttributeNames = {
    '#PIDS': 'providerIds',
  };
  params.ExpressionAttributeValues = {
    ':pids': providerIds
  };
}

function populateRatingParams({ value: { imdbRating, rtRating } }, params) {
  params.ExpressionAttributeNames = {
    ...params.ExpressionAttributeNames,
    '#IMDB': 'imdbRating',
    '#RT': 'rtRating'
  };
  params.ExpressionAttributeValues = {
    ...params.ExpressionAttributeValues,
    ':imdb': imdbRating,
    ':rt': rtRating
  };
}

function buildExpression({ ExpressionAttributeNames }, isConditionExp) {
  const [startPrefix, joinPrefix, comparitor] = isConditionExp ? ['', ' OR ', '<>'] : ['SET ', ', ', '='];

  return Object.keys(ExpressionAttributeNames)
    .reduce((exp, currVal) => {
        const prefix = exp ? joinPrefix : startPrefix;
        const updatedVal = currVal.toLowerCase().replace('#', ':');

        return `${exp}${prefix}${currVal} ${comparitor} ${updatedVal}`;
    }, '');
}

function buildMetadataUpdateParams(showId, providerResp, ratingResp) {
  const params = {};

  if (providerResp.status === 'fulfilled') {
    populateProviderParams(providerResp, params);
  } else {
    console.error(`Failed to get providers of show "${showId}":`, providerResp?.reason?.message);
  }

  if (ratingResp.status === 'fulfilled') {
    populateRatingParams(ratingResp, params);
  } else {
    console.error(`Failed to get ratings of show "${showId}":`, ratingResp?.reason?.message);
  }

  if (!params.ExpressionAttributeNames) { return; }

  params.UpdateExpression = buildExpression(params);
  params.ConditionExpression = buildExpression(params, true);

  return params;
}

async function updateShow({ showId, providerResp, ratingResp }) {
  const metadataUpdateParams = buildMetadataUpdateParams(showId, providerResp, ratingResp);

  if (!metadataUpdateParams) {
    console.error(`Unable to update show "${showId}". Metadata requests failed.`);
    return;
  }

  const params = {
    TableName: process.env.API_UNIVERSALRATINGS_SHOWTABLE_NAME,
    Key: {
      id: showId
    },
    ...metadataUpdateParams
  };

  console.log('update params: ', params);

  try {
    await dynamoDb.update(params).promise();
    console.log('Succesfully updated show:', showId);
  } catch (err) {
    console.error(`Failed to update show "${showId}": ${err.statusCode} - ${err.code}: ${err.message}`);
  }
}

async function fetchShowMetadata({ objectID: showId, tmdbId, type }) {
  const [ratingResp, providerResp] = await Promise.allSettled([
    omdbApi.fetchExternalRatings(showId),
    tmdbApi.getProviderIds(tmdbId, type)
  ]);

  return {
    showId,
    providerResp,
    ratingResp
  };
}

async function fetchShows() {
  const { hits } = await algoliaApi.search({
    query: ' ',
    attributesToRetrieve: ['tmdbId', 'type'],
    attributesToHighlight: [],
    hitsPerPage: 1000
  });

  return hits;
}

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler = async () => {
  const shows = await fetchShows();
   // use half of overall limit as requests are made to both omdb and tmdb concurrently
  const limitConcurrencyToHalfOfMax = pLimit(Math.floor((awsConcurrentRequestLimit / 2) - 10));
  const metadataResponses = await Promise.all(shows.map((show) => limitConcurrencyToHalfOfMax(() => fetchShowMetadata(show))));
  const limitConcurrencyToMax = pLimit(awsConcurrentRequestLimit - 5);

  await Promise.all(metadataResponses.map((response) => limitConcurrencyToMax(() => updateShow(response)))); // todo: batch update
};