# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2021-08-21
### Added
- amplify backend config
- aws congnito auth
- graphql schema, config, queries, mutations, etc
- dynamodb schema and config
- rating interactions for unrated and previously rated shows
- ratings added via graphql and stored in dynamodb
- shows fetched with graphql; paginated and sorted by date
- next page of shows fetched when user scrolls to end of page
- limit of 2 lines for card title
- show details modal
- duplicates removed from OMDB API resp
- single search for rated and unrated shows with autosuggest grouping
- algolia search api used for finding rated shows
- drawer styled and interactions implemented
- run scripts
- image optimization
- readme tech stack and features

### Changed
- **BREAKING**: graphql schema refactored to support rating and sort operations
- rating star buttons styling
- MovieCard renamed to ShowCard
- readme usage docs
- readme description
- svgs imported from files instead of inlined
- svg viewports adjusted to remove padding

### Removed
- reference to IMDB in search loading text
- ShowCard no longer displays streaming sites

## [0.2.0] - 2021-07-31
### Added
- title search bar
- LRU cache for search results
- OMDB API client
- /search api route
- readme usage docs

### Changed
- styling and theme
- readme description

## [0.1.0] - 2017-06-28
### Added
- movie cards
- rating star buttons
- side menu
- toolbar
- lazy loading when element enters viewport
- MatUI with SSR