/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createWatchlistItem = /* GraphQL */ `
  mutation CreateWatchlistItem(
    $input: CreateWatchlistItemInput!
    $condition: ModelWatchlistItemConditionInput
  ) {
    createWatchlistItem(input: $input, condition: $condition) {
      userId
      showId
      show {
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
        source
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const updateWatchlistItem = /* GraphQL */ `
  mutation UpdateWatchlistItem(
    $input: UpdateWatchlistItemInput!
    $condition: ModelWatchlistItemConditionInput
  ) {
    updateWatchlistItem(input: $input, condition: $condition) {
      userId
      showId
      show {
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
        source
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const deleteWatchlistItem = /* GraphQL */ `
  mutation DeleteWatchlistItem(
    $input: DeleteWatchlistItemInput!
    $condition: ModelWatchlistItemConditionInput
  ) {
    deleteWatchlistItem(input: $input, condition: $condition) {
      userId
      showId
      show {
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
        source
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
      id
      name
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
      id
      name
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
      id
      name
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
export const createReview = /* GraphQL */ `
  mutation CreateReview(
    $input: CreateReviewInput!
    $condition: ModelReviewConditionInput
  ) {
    createReview(input: $input, condition: $condition) {
      showId
      userId
      rating
      isFavorite
      user {
        id
        name
        watchlist {
          nextToken
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const updateReview = /* GraphQL */ `
  mutation UpdateReview(
    $input: UpdateReviewInput!
    $condition: ModelReviewConditionInput
  ) {
    updateReview(input: $input, condition: $condition) {
      showId
      userId
      rating
      isFavorite
      user {
        id
        name
        watchlist {
          nextToken
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const deleteReview = /* GraphQL */ `
  mutation DeleteReview(
    $input: DeleteReviewInput!
    $condition: ModelReviewConditionInput
  ) {
    deleteReview(input: $input, condition: $condition) {
      showId
      userId
      rating
      isFavorite
      user {
        id
        name
        watchlist {
          nextToken
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
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
          userId
          rating
          isFavorite
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      source
      updatedAt
    }
  }
`;
export const updateShow = /* GraphQL */ `
  mutation UpdateShow(
    $input: UpdateShowInput!
    $condition: ModelShowConditionInput
  ) {
    updateShow(input: $input, condition: $condition) {
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
          isFavorite
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      source
      updatedAt
    }
  }
`;
export const deleteShow = /* GraphQL */ `
  mutation DeleteShow(
    $input: DeleteShowInput!
    $condition: ModelShowConditionInput
  ) {
    deleteShow(input: $input, condition: $condition) {
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
          isFavorite
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      source
      updatedAt
    }
  }
`;
