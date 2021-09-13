/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getWatchlistItem = /* GraphQL */ `
  query GetWatchlistItem($userId: ID!, $showId: ID!) {
    getWatchlistItem(userId: $userId, showId: $showId) {
      userId
      showId
      show {
        id
        title
        type
        rating
        img
        releaseDate
        description
        imdbRating
        rtRating
        reviews {
          nextToken
        }
        createdAt
        source
        updatedAt
        owner
      }
      createdAt
      updatedAt
    }
  }
`;
export const listWatchlistItems = /* GraphQL */ `
  query ListWatchlistItems(
    $userId: ID
    $showId: ModelIDKeyConditionInput
    $filter: ModelWatchlistItemFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listWatchlistItems(
      userId: $userId
      showId: $showId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        userId
        showId
        show {
          id
          title
          type
          rating
          img
          releaseDate
          description
          imdbRating
          rtRating
          createdAt
          source
          updatedAt
          owner
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      name
      color
      watchlist {
        items {
          userId
          showId
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $id: ID
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listUsers(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        name
        color
        watchlist {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getReview = /* GraphQL */ `
  query GetReview($showId: ID!, $userId: ID!) {
    getReview(showId: $showId, userId: $userId) {
      showId
      userId
      rating
      isFavorite
      user {
        id
        name
        color
        watchlist {
          nextToken
        }
        createdAt
        updatedAt
      }
      show {
        id
        title
        type
        rating
        img
        releaseDate
        description
        imdbRating
        rtRating
        reviews {
          nextToken
        }
        createdAt
        source
        updatedAt
        owner
      }
      updatedAt
      createdAt
    }
  }
`;
export const listReviews = /* GraphQL */ `
  query ListReviews(
    $showId: ID
    $userId: ModelIDKeyConditionInput
    $filter: ModelReviewFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listReviews(
      showId: $showId
      userId: $userId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        showId
        userId
        rating
        isFavorite
        user {
          id
          name
          color
          createdAt
          updatedAt
        }
        show {
          id
          title
          type
          rating
          img
          releaseDate
          description
          imdbRating
          rtRating
          createdAt
          source
          updatedAt
          owner
        }
        updatedAt
        createdAt
      }
      nextToken
    }
  }
`;
export const getShow = /* GraphQL */ `
  query GetShow($id: ID!) {
    getShow(id: $id) {
      id
      title
      type
      rating
      img
      releaseDate
      description
      imdbRating
      rtRating
      reviews {
        items {
          showId
          userId
          rating
          isFavorite
          updatedAt
          createdAt
        }
        nextToken
      }
      createdAt
      source
      updatedAt
      owner
    }
  }
`;
export const listShows = /* GraphQL */ `
  query ListShows(
    $id: ID
    $filter: ModelShowFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listShows(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        title
        type
        rating
        img
        releaseDate
        description
        imdbRating
        rtRating
        reviews {
          nextToken
        }
        createdAt
        source
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const reviewsByUser = /* GraphQL */ `
  query ReviewsByUser(
    $userId: ID
    $updatedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelReviewFilterInput
    $limit: Int
    $nextToken: String
  ) {
    reviewsByUser(
      userId: $userId
      updatedAt: $updatedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        showId
        userId
        rating
        isFavorite
        user {
          id
          name
          color
          createdAt
          updatedAt
        }
        show {
          id
          title
          type
          rating
          img
          releaseDate
          description
          imdbRating
          rtRating
          createdAt
          source
          updatedAt
          owner
        }
        updatedAt
        createdAt
      }
      nextToken
    }
  }
`;
export const recentlyRated = /* GraphQL */ `
  query RecentlyRated(
    $source: String
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelShowFilterInput
    $limit: Int
    $nextToken: String
  ) {
    recentlyRated(
      source: $source
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        title
        type
        rating
        img
        releaseDate
        description
        imdbRating
        rtRating
        reviews {
          nextToken
        }
        createdAt
        source
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const showsByType = /* GraphQL */ `
  query ShowsByType(
    $type: ShowType
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelShowFilterInput
    $limit: Int
    $nextToken: String
  ) {
    showsByType(
      type: $type
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        title
        type
        rating
        img
        releaseDate
        description
        imdbRating
        rtRating
        reviews {
          nextToken
        }
        createdAt
        source
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
