const aws = require('aws-sdk');
const dynamoDb = new aws.DynamoDB();
const colors = [
  '#e57373', '#f06292', '#ba68c8', '#9575cd',
  '#7986cb', '#64b5f6', '#4fc3f7', '#4dd0e1',
  '#4db6ac', '#81c784', '#aed581', '#dce775',
  '#fff176', '#ffd54f', '#ffb74d', '#ff8a65',
  '#a1887f', '#e0e0e0', '#90a4ae'
];

function getRandColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

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

  const params = {
    Item: {
      'id': { S: id },
      'name': { S: event.userName },
      'color': { S: getRandColor() },
      '__typename': { S: 'User' },
      'createdAt': { S: creationTime },
      'updatedAt': { S: creationTime }
    },
    TableName: process.env.USER_TABLE
  };

  try {
    await dynamoDb.putItem(params).promise();
    console.log('user added: ', id);
  } catch (err) {
    console.error(`failed to add user "${id}": `, err);
  }
}