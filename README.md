# universal-ratings

> A site for rating TV shows and movies.

## Tech Stack

+ [React](https://reactjs.org/)
+ [Next.js](https://nextjs.org/)
+ [GraphQL](https://graphql.org/)
+ [Aloglia Search](https://www.algolia.com/products/search-and-discovery/hosted-search-api/)
+ [Material-UI](https://material-ui.com/)
+ [Webpack](https://webpack.js.org/)
+ [AWS](https://aws.amazon.com/)
  + Amplify
  + Cognito
  + Lambda
  + DynamoDB
  + AppSync
  + S3
  + etc

## Features

+ Single search for rated and unrated shows with autosuggest
  + Rated shows retreived from [Algolia](https://www.algolia.com/products/search-and-discovery/hosted-search-api/)
  + Unrated shows retreived from [OMDB API](https://www.omdbapi.com/)
+ Users can rate shows and view other users' ratings
+ 3rd party ratings
  + IMDB
  + Rotten Tomatoes
+ Show card grid for basic details
+ Show modal for extended details
+ Infinite Scroll
  + Fetches paginated shows from GraphQL when user scrolls to end of page
+ Client and server side caching of search results
+ AWS Cognito user auth

## Installation

```sh
yarn install
```

## Usage

+ To serve the app at http://localhost:3000, run one of the following commands in the project's root directory.
+ Both commands will mock the GraphQL API and DynamoDB before serving the app.

### Starting the Development Server

```bash
yarn dev
```

+ Uses HMR to update the served version on code changes.

### Starting the Production Server

```bash
yarn prod
```

+ Serves the optimized build