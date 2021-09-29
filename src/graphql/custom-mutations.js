export const createShow = /* GraphQL */ `
  mutation CreateShow(
    $input: CreateShowInput!
    $condition: ModelShowConditionInput
  ) {
    createShow(input: $input, condition: $condition) {
      id
      tmdbId
      title
      type
      rating
      img
      backgroundImg
      releaseDate
      description
      imdbRating
      rtRating
      reviews {
        items {
          showId
          rating
          user {
            name
            color
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