/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
export const onCreateReview = /* GraphQL */ `
  subscription OnCreateReview {
    onCreateReview {
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
export const onUpdateReview = /* GraphQL */ `
  subscription OnUpdateReview {
    onUpdateReview {
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
export const onDeleteReview = /* GraphQL */ `
  subscription OnDeleteReview {
    onDeleteReview {
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
export const onCreateShow = /* GraphQL */ `
  subscription OnCreateShow {
    onCreateShow {
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
export const onUpdateShow = /* GraphQL */ `
  subscription OnUpdateShow {
    onUpdateShow {
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
export const onDeleteShow = /* GraphQL */ `
  subscription OnDeleteShow {
    onDeleteShow {
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
