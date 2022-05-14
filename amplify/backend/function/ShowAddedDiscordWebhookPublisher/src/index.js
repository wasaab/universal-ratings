/* Amplify Params - DO NOT EDIT
  ENV
  REGION
  WEBHOOK_URL
Amplify Params - DO NOT EDIT */

const axios = require('axios');
const ratedShowSource = 'UR';

function buildRatingDesc(imdbRating, rtRating) {
  let ratingsLabel = '';

  if (rtRating >= 0) {
    ratingsLabel += `🍅⠀**${rtRating}**⠀⠀⠀⠀⠀`;
  }

  if (imdbRating >= 0) {
    ratingsLabel += `**\`IMDB\`⠀${imdbRating}**`;
  }

  return ratingsLabel;
}
const typeToIcon = {
  tv: 'https://i.imgur.com/5C1EG4P.png',
  movie: 'https://i.imgur.com/dpJe6cd.png'
};

function buildRatingEmbed(show) {
  return {
    title: '⭐'.repeat(show.rating.N),
    description: buildRatingDesc(show.imdbRating.N, show.rtRating.N),
    author: {
      icon_url: typeToIcon[show.type.S],
      name: show.title.S,
      url: 'https://ratings.kent.codes'
    },
    thumbnail: { url: show.img.S }
  };
}

function postToWebhook(embed, showId) {
  return axios.post(
    process.env.WEBHOOK_URL,
    { embeds: [embed] },
    { headers: { 'content-type': 'application/json' } }
  )
    .then(() => {
      const msg = `Webhook post succeeded for show: ${showId}`;

      console.log(msg);

      return msg;
    })
    .catch((error) => {
      console.error('Failed webhook post: ', error);

      return error.message;
    });
}

function isFirstRating({ OldImage, NewImage }) {
  return NewImage.source.S === ratedShowSource
    && OldImage?.source.S !== ratedShowSource;
}

exports.handler = (event) => {
  console.log('posting to webhook url: ', process.env.WEBHOOK_URL);

  const showsAdded = event.Records
    .filter((record) => record.eventName !== 'REMOVE' && isFirstRating(record.dynamodb))
    .map((record) => {
      console.log('eventId: ', record.eventID);
      console.log('show added: %j', record.dynamodb);

      const embed = buildRatingEmbed(record.dynamodb.NewImage);

      return postToWebhook(embed, record.dynamodb.Keys.id.S);
    });

  return Promise.all(showsAdded);
};