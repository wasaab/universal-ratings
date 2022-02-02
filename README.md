# universal-ratings

> A site for rating TV shows and movies.

## Tech Stack

+ [React](https://reactjs.org/)
+ [Next.js](https://nextjs.org/)
+ [GraphQL](https://graphql.org/)
+ [Aloglia Search](https://www.algolia.com/products/search-and-discovery/hosted-search-api/)
+ [Material-UI](https://material-ui.com/)
+ [Webpack](https://webpack.js.org/)
+ [Node.js](https://nodejs.org/)
+ [AWS](https://aws.amazon.com/)
  + Amplify
  + Cognito
  + Lambda
  + DynamoDB
  + AppSync
  + S3
  + etc

## Features

+ Federated, live, search for rated/unrated shows with fuzzy matching and result grouping
  + Rated shows retrieved from [Algolia](https://www.algolia.com/products/search-and-discovery/hosted-search-api/)
  + Unrated shows retrieved from [TMDB API](https://developers.themoviedb.org/3/)
+ Client and server side caching of search results
+ Debouncing and request cancellation to ensure the user is presented with search results for their current query
+ 3rd party ratings from [OMDB API](https://www.omdbapi.com/)
  + IMDB
  + Rotten Tomatoes
+ Users can rate shows and view other users' ratings
+ Users can add rated/unrated shows to their watchlist and favorite them
+ Show card grid for basic details
+ Show modal for extended details
  + 3rd party and user ratings
  + year, title, and plot summary
  + streaming providers
+ Infinite Scroll
  + Fetches paginated shows from GraphQL when user scrolls to end of page
+ AWS Cognito user auth
  + signup, login, and logout
  + GraphQL read/write auth
+ Views for trending shows, recently rated, recently released, tv, movies, watchlist, watched, and favorites.
+ User profile with customizable avatar and display name
+ Posts to a Discord webhook when a show is first rated

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