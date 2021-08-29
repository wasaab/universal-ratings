/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateWatchlistItem = /* GraphQL */ `
  subscription OnCreateWatchlistItem {
    onCreateWatchlistItem {
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
export const onUpdateWatchlistItem = /* GraphQL */ `
  subscription OnUpdateWatchlistItem {
    onUpdateWatchlistItem {
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
export const onDeleteWatchlistItem = /* GraphQL */ `
  subscription OnDeleteWatchlistItem {
    onDeleteWatchlistItem {
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
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
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
export const onCreateReview = /* GraphQL */ `
  subscription OnCreateReview {
    onCreateReview {
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
export const onUpdateReview = /* GraphQL */ `
  subscription OnUpdateReview {
    onUpdateReview {
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
export const onDeleteReview = /* GraphQL */ `
  subscription OnDeleteReview {
    onDeleteReview {
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
