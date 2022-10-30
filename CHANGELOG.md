# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [UNRELEASED] - 2022-##-##
### Changed
- disabled ratings text selection
- fetch limit for schedule view increased (100 -> 1000)

### Fixed
- unknown air dates handled for schedule
- finale flag cleared upon selection

## [1.19.2] - 2022-06-04
### Changed
- show modal restyled for mobile
- plex icon sizing

### Fixed
- RT/IMDB rating of 0 shown

## [1.19.1] - 2022-05-18
### Added
- showtime & roku watch providers

### Changed
- svg heights using em instead of px

## [1.19.0] - 2022-05-10
### Added
- plex show search button
- plex search user pref

### Changed
- svgr config retains viewboxes
- watchlisted shows no longer removable

### Fixed
- removing/updating show upon removal of last review

## [1.18.0] - 2022-05-07
### Added
- trending shows ttl
- button aria-labels for accesibility.
- width enum
- manifest names

## Changed
- Toolbar styling for alignment
- `MainView` --> `Index`
- show and rating utils extracted from util
- Alogolia fallback logic
- amplify deps imported from sub-packages (reduced bundle)
- SSG --> Static

## [1.17.2] - 2022-05-02
### Fixed
- shows evicted from search cache on addition/removal

## [1.17.1] - 2022-05-01
### Fixed
- show addition/removal while on schedule view

## [1.17.0] - 2022-04-30
### Added
- schedule view
- EpisodeSchedule, EpisodeCard, and Alert
- episode schedule for all rated/watchlisted via Drawer
- episode schedule per show via button in ShowDetailsModal
- streamable icon on ShowCard

### Changed
- ShowImage extracted from ShowCard
- scroll to top on view change instead of after fetch
- useOnScreen also provides position
- readme usage, features, and styling

## [1.16.0] - 2022-04-17
### Added
- external ratings and streaming providers updated daily

## [1.15.1] - 2022-02-19
### Changed
- amplify config for upgraded version of CLI

### Fixed
- handling of missing theme pref

## [1.15.0] - 2022-02-19
### Added
- Dark and Blue themes
- SettingsModal for theme selection and preference saving
- themePref added to GraphQL User schema

### Changed
- app restyled to support theming

## [1.14.0] - 2022-02-11
### Added
- rating button tips

### Changed
- show type icon styling

### Fixed
- trending show updates persisted for all views
- watchlist show removal via ShowCard

## [1.13.0] - 2022-02-07
### Added
- show type icon added to ShowCard and ShowDetailsModal

### Fixed
- selected search result cleared between searches
- rating not highlighted after removing review

## [1.12.3] - 2022-02-01
### Changed
- ShowCardGrid extracted from MainView
- ScrollAwareProgress extracted from MainView
- Loading class extracted from MainView
- watchlist items sorted by createdAt date

### Fixed
- movies added while on MOVIES view shown
- prevent createShow call for unrated watchlist shows

## [1.12.2] - 2022-01-24
### Fixed
- source filter for showsByType request

## [1.12.1] - 2022-01-24
### Changed
- readme feature section updated for search and auth
- tmdbId returned from custom GraphQL queries

### Fixed
- show creation unrecognized fields
- source 'UR' for getShows request to omit WL items
- showIdx determination for all views

## [1.12.0] - 2022-01-23
### Added
- Show's source field added to algolia
- rated shows sorted before unrated watchlist shows in search results
- discord webhook posted to when a watchlisted show is first rated
- new functionality added to readme

### Changed
- search results grouped by source prop instead of id to handle watchlist items
- @aws-amplify/ui-react dep upgraded (v1.2.8 --> v1.2.26)

### Fixed
- page scrolled to top when view changed to HOME
- login/logout flow handles double event bug with AmplifyAuthenticator

## [1.11.0] - 2021-11-26
### Added
- unrated shows can be added to watchlist
- discord webhook posted when shows are added

### Changed
- Show auth updated in GraphQL schema to allow rating unrated watchlist items

### Fixed
- show index for non-trending shows while on HOME view

## [1.10.0] - 2021-11-10
### Added
- trending shows on home view

### Changed
- ShowCard supports unrated shows
- SearchClient exports singleton

## [1.9.0] - 2021-11-06
### Added
- Loading symbols for infinite scroll and view change
- auto-scroll to top on view change
- UserAvatar component
- icons for user menu items
- username displayed in user menu

### Changed
- show modal restyled for better mobile support
- long show descriptions scrollable in show modal
- algolia logo size reduced in search results
- user modal save button restyled for visiblity
- ratings.json --> sampleShows.json
- new release threshold 2 months --> 3 months
- show creation time reduced

## [1.8.0] - 2021-10-06
### Added
- streaming providers

## [1.7.0] - 2021-09-29
### Added
- search client for querying Algolia, TMDB, and OMDB
- TMDB API client
- Algolia API client
- search request cancellation for stale queries
- backdrop image for show modal
- search button selects first option
- first search option autohighlighted

### Changed
- TMDB API used for unrated shows autosuggest/details
- OMDB API used for imdb/rt ratings
- remove rating button not shown for unrated show
- highlighted search option restyled to be more distinct
- search input trimmed

### Fixed
- search race conditions
- rating required tip dynamic width

## [1.6.2] - 2021-09-19
### Fixed
- Insecure dependency versions

## [1.6.1] - 2021-09-18
### Added
- eslint environments

## [1.6.0] - 2021-09-18
### Added
- unrate/delete show functionality

### Changed
- eslint configuration
- show updating refactored

### Fixed
- watchlist ratings averaged on initial load
- workaround for chrome bug related to mouse events

## [1.5.1] - 2021-09-13
### Changed
- style changes for dark reader compatibility

### Fixed
- cognito post confirmation func s3 key updated

## [1.5.0] - 2021-09-12
### Added
- user profile modal
- color added to User schema
- user assigned rand color upon confirmation
- rating bounds validation via resolver
- username tooltip for avatar
- emoji name support

### Changed
- max rating changed from 5 to 4 stars
- avatars use stored colors, not rand

## [1.4.0] - 2021-09-11
### Added
- api auth configured in graphql schema
- favicon added

### Changed
- default auth type changed from api key to cognito user pool
- mock shows updated to match new schema

### Fixed
- next page token no longer used after changing to a view with 1 page

## [1.3.2] - 2021-09-08
### Changed
- adding/removing favorites updates watchlist
- new releases changed from < 2 months to < 3 months

## [1.3.1] - 2021-08-29
### Added
- shows updated across views

## [1.3.0] - 2021-08-29
### Added
- graphql cognito user pool auth
- show descriptions from omdb api
- views
  - Movies
  - TV Shows
  - Recently Released
  - Recently Rated
  - Favorites
  - Watchlist
  - Watched
- add to watchlist / favorites modal buttons
- watchlist to User model
- WatchListItem model
- imdb and rt ratings from omdb api in modal
- rotten vs fresh icon shown dynamically for RT rating
- search bar clears and focuses input on selection
- missing images handled
- search by id added to omdb api client

### Changed
- year replaced with releaseDate in Show model for sort precision
- showsByDate --> recentlyReleased
- Review model updated to enable user based queries (favs and watched)
- primary key of Show model now explcitly id instead of implicitly
- shows added to start of grid rather than end

### Removed
- unused graphql schema keys
- filtering of shows w/o images

### Fixed
* optional values handled in OMDB API client

## [1.2.0] - 2021-08-24
### Added
- algolia index updated on db changes via transformer
- rating changes handled

### Changed
- alogolia only stores fields needed for autosuggest results
- get show by id via graphql/db for extended details
- SideMenuToolbar --> MainView
- Drawer and Toolbar components extracted from MainView

## [1.1.0] - 2021-08-22
### Added
- user added to db on cognito confirmation hook
- user menu with logout button
- app conditionally loaded based on auth

### Changed
- userId --> username

### Removed
- amplify login screen styling

## [1.0.2] - 2021-08-21
### Removed
- nextjs image optimization (not supported by amplify)

## [1.0.1] - 2021-08-21
### Removed
- algolia graphql transformer

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

## [0.1.0] - 2021-07-28
### Added
- movie cards
- rating star buttons
- side menu
- toolbar
- lazy loading when element enters viewport
- MatUI with SSR