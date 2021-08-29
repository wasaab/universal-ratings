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
          items {
            showId
            rating
            isFavorite
            user {
              name
            }
          }
          nextToken
        }
        source
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
          items {
            showId
            rating
            isFavorite
            user {
              name
            }
          }
          nextToken
        }
        createdAt
        source
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
      releaseDate
      description
      imdbRating
      rtRating
      reviews {
        items {
          showId
          rating
          isFavorite
          user {
            name
          }
        }
        nextToken
      }
      createdAt
      updatedAt
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
            items {
              showId
              rating
              isFavorite
              user {
                name
              }
            }
            nextToken
          }
        }
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
      watchlist {
        items {
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
              items {
                showId
                rating
                isFavorite
                user {
                  name
                }
              }
              nextToken
            }
          }
        }
        nextToken
      }
    }
  }
`;