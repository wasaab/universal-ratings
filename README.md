<div align="center">

# universal-ratings

![Version](https://img.shields.io/github/package-json/v/wasaab/universal-ratings?logo=master%20version)
![GitHub](https://img.shields.io/github/license/wasaab/universal-ratings?logo=apache)

![React Version](https://img.shields.io/github/package-json/dependency-version/wasaab/universal-ratings/react?logo=react)
![Next.js Version](https://img.shields.io/github/package-json/dependency-version/wasaab/universal-ratings/next?logo=next.js)
![Amplify Version](https://img.shields.io/github/package-json/dependency-version/wasaab/universal-ratings/aws-amplify?logo=aws-amplify)
![ECMAScript Version](https://img.shields.io/badge/ES-2021-blue?logo=javascript)


A site for rating TV shows and movies.

[Tech Stack](#tech-stack) •
[Features](#features) •
[Installation](#installation) •
[Configuration](#configuration) •
[Usage](#usage)

</div>

## Tech Stack

+ [React](https://reactjs.org/)
+ [Next.js](https://nextjs.org/)
+ [GraphQL](https://graphql.org/)
+ [Aloglia Search](https://www.algolia.com/products/search-and-discovery/hosted-search-api/)
+ [Material-UI](https://material-ui.com/)
+ [Webpack](https://webpack.js.org/)
+ [Node.js](https://nodejs.org/)
+ [AWS](https://aws.amazon.com/)
  <details>
  <summary>📃</summary>

  + Amplify
  + Cognito
  + Lambda
  + DynamoDB
  + AppSync
  + S3
  + Cloudfront
  </details>

## Features

### Searching
+ Federated, live, search for rated/unrated shows with fuzzy matching and result grouping
  + Rated/watchlisted shows retrieved from [Algolia](https://www.algolia.com/products/search-and-discovery/hosted-search-api/)
+ Client and server side caching of search results
  + Unrated shows retrieved from [TMDB API](https://developers.themoviedb.org/3/)
+ Debouncing and request cancellation to ensure the user is presented with search results for their current query

### Shows
+ 3rd party ratings from [OMDB API](https://www.omdbapi.com/)
  + IMDB
  + Rotten Tomatoes
+ Users can rate shows and view other users' ratings
+ Users can view the schedule of a specific TV show or all TV shows they've rated/watchlisted
+ Users can add rated/unrated shows to their watchlist and favorite them
+ Show card grid for basic details
  + Title, type, and poster
  + Overall/user rating
  + Streaming availability
+ Show modal for extended details
  + 3rd party and user ratings
  + Year, title, type, plot summary, and poster
  + Streaming providers
  + Watchlisted/favorited by user
+ Views for trending shows, recently rated, recently released, TV, movies, watchlist, watched, favorites, and schedule
+ Updates dynamic metadata of stored shows, such as streaming providers, via CRON job
+ Posts to a Discord webhook when a show is first rated
+ Infinite Scroll
  + Fetches paginated shows from GraphQL when user scrolls to end of page

### Users
+ AWS Cognito user auth
  + Signup, login, and logout
  + GraphQL read/write auth
+ User profile with customizable avatar and display name
+ User selectable custom Material-UI themes and theme preference

## Installation

<details>
<summary>yarn</summary>

```sh
yarn install
```
</details>

<details>
<summary>npm</summary>

```sh
npm install
```
</details>

## Configuration

Create a `.env` file in the project's root directory with the required API keys.

```
OMDB_API_KEY=<YOUR_OMDB_API_KEY>
TMDB_API_KEY=<YOUR_TMDB_API_KEY>
```

## Usage

+ To serve the app at http://localhost:3000, run one of the following commands in the project's root directory.
+ Both commands will mock the GraphQL API and DynamoDB before serving the app.

### Starting the Development Server

> Uses HMR to update the served version on code changes

<details>
<summary>yarn</summary>

```sh
yarn dev
```
</details>

<details>
<summary>npm</summary>

```sh
npm run dev
```
</details>

### Starting the Production Server

> Serves the optimized build

<details>
<summary>yarn</summary>

```sh
yarn prod
```
</details>

<details>
<summary>npm</summary>

```sh
npm run prod
```
</details>