/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	WEBHOOK_URL
Amplify Params - DO NOT EDIT */

function buildRatingDesc({ imdbRating, rtRating }) {
	let ratingsLabel = '';

	if (rtRating) {
		ratingsLabel += `🍅⠀**${rtRating}**⠀⠀⠀⠀⠀`;
	}

	if (imdbRating) {
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
    title: '⭐'.repeat(show.rating),
		description: buildRatingDesc(show),
		author: {
			icon_url: typeToIcon[show.type],
			name: show.title,
      url: 'https://ratings.kent.codes'
		},
		thumbnail: { url: show.img },
		footer: {
			icon_url: 'https://i.imgur.com/9N0ZGSD.png',
      text: "owner"
		}
	};
}

exports.handler = (event) => {
  console.log('webhook url: ', process.env.WEBHOOK_URL);
  console.log(JSON.stringify(event, null, 2));

  event.Records.forEach((record) => {
    console.log(record.eventID);
    console.log(record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);
  });
  return Promise.resolve('Successfully processed DynamoDB record');
};