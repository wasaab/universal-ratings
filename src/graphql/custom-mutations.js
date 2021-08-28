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
      source
      updatedAt
    }
  }
`;