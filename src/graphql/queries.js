/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
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
      user {
        id
        name
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
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
        user {
          id
          name
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
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
      year
      description
      imdbRating
      rtRating
      reviews {
        items {
          showId
          userId
          rating
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
export const listShows = /* GraphQL */ `
  query ListShows(
    $filter: ModelShowFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShows(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        type
        rating
        img
        year
        description
        imdbRating
        rtRating
        reviews {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const byShow = /* GraphQL */ `
  query ByShow(
    $showId: ID
    $rating: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelReviewFilterInput
    $limit: Int
    $nextToken: String
  ) {
    byShow(
      showId: $showId
      rating: $rating
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        showId
        userId
        rating
        user {
          id
          name
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const showsByTitle = /* GraphQL */ `
  query ShowsByTitle(
    $title: String
    $year: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelShowFilterInput
    $limit: Int
    $nextToken: String
  ) {
    showsByTitle(
      title: $title
      year: $year
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
        year
        description
        imdbRating
        rtRating
        reviews {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const showsByType = /* GraphQL */ `
  query ShowsByType(
    $type: ShowType
    $year: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelShowFilterInput
    $limit: Int
    $nextToken: String
  ) {
    showsByType(
      type: $type
      year: $year
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
        year
        description
        imdbRating
        rtRating
        reviews {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const showsByDate = /* GraphQL */ `
  query ShowsByDate(
    $type: ShowType
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelShowFilterInput
    $limit: Int
    $nextToken: String
  ) {
    showsByDate(
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
        year
        description
        imdbRating
        rtRating
        reviews {
          items {
            showId
            userId
            rating
          }
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
