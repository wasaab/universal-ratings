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
            rating
            user {
              name
            }
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

export const createShow = /* GraphQL */ `
  mutation CreateShow(
    $input: CreateShowInput!
    $condition: ModelShowConditionInput
  ) {
    createShow(input: $input, condition: $condition) {
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