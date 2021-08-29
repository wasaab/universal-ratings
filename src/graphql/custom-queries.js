export const showsByDate = /* GraphQL */ `
  query ShowsByDate(
    $source: String
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelShowFilterInput
    $limit: Int
    $nextToken: String
  ) {
    showsByDate(
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
        year
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
        year
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
      year
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