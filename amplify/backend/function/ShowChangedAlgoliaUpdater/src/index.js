/* eslint-disable no-await-in-loop */
import algoliasearch from 'algoliasearch';

const algolia = algoliasearch('QVUO52LVSK', process.env.ALGOLIA_API_KEY);
const index = algolia.initIndex('show');

/*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["ALGOLIA_API_KEY","ALGOLIA_APP_ID"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/
/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	API_UNIVERSALRATINGS_SHOWTABLE_NAME
	API_UNIVERSALRATINGS_SHOWTABLE_ARN
	API_UNIVERSALRATINGS_GRAPHQLAPIIDOUTPUT
	ALGOLIA_APP_ID
	ALGOLIA_API_KEY
Amplify Params - DO NOT EDIT */

async function handleShowChange(event) {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  for (const record of event.Records) {
    const operation = record.eventName;
    const showId = record.dynamodb.Keys.id.S;

    console.log(`${operation} for showId: ${showId}`);

    switch (operation) {
      case 'INSERT':
        const showData = record.dynamodb.NewImage;
        const algoliaObject = {
          objectID: showId,
          tmdbId: showData.tmdbId.S,
          title: showData.title.S,
          type: showData.type.S,
          releaseDate: showData.releaseDate.S,
          source: showData.source.S
        };

        await index.saveObject(algoliaObject);
        break;
      case 'REMOVE':
        await index.deleteObject(showId);
        break;
      case 'MODIFY':
        const updatedShowData = record.dynamodb.NewImage;
        const updatedAlgoliaObject = {
          objectID: showId,
          tmdbId: updatedShowData.tmdbId.S,
          title: updatedShowData.title.S,
          type: updatedShowData.type.S,
          releaseDate: updatedShowData.releaseDate.S,
          source: updatedShowData.source.S
        };

        await index.partialUpdateObject(updatedAlgoliaObject);
        break;
      default:
        break;
    }
  }

  return {
    statusCode: 200,
    body: 'Function executed successfully'
  };
}

export const handler = async (event) => {
  try {
    await handleShowChange(event);
  } catch (err) {
    console.error('Failed to handle change to show.', err);
    throw err;
  }
};