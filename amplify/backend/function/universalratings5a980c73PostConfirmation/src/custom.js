var aws = require('aws-sdk');
var dynamoDb = new aws.DynamoDB();

exports.handler = async (event) => {
  const id = event.request.userAttributes.sub;

  if (id) {
      await addUser(id, event);
  } else {
      console.error('no authed user ID found');
  }
};

async function addUser(id, event) {
  const creationTime = new Date().toISOString();

  let params = {
    Item: {
      'id': { S: id },
      '__typename': { S: 'User' },
      'name': { S: event.userName },
      'createdAt': { S: creationTime }, // pretty sure these get added automatically
      'updatedAt': { S: creationTime } // pretty sure these get added automatically
    },
    TableName: process.env.USER_TABLE
  };

  try {
    await dynamoDb.putItem(params).promise();
    console.log('user added: ', id);
  } catch (err) {
    console.log('failed to add user: ', id);
  }
}