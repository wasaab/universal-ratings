/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateWatchlistItem = /* GraphQL */ `
  subscription OnCreateWatchlistItem($userId: String!) {
    onCreateWatchlistItem(userId: $userId) {
      userId
      showId
      show {
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
          nextToken
        }
        providerIds
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
export const onUpdateWatchlistItem = /* GraphQL */ `
  subscription OnUpdateWatchlistItem($userId: String!) {
    onUpdateWatchlistItem(userId: $userId) {
      userId
      showId
      show {
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
          nextToken
        }
        providerIds
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
export const onDeleteWatchlistItem = /* GraphQL */ `
  subscription OnDeleteWatchlistItem($userId: String!) {
    onDeleteWatchlistItem(userId: $userId) {
      userId
      showId
      show {
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
          nextToken
        }
        providerIds
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
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
      id
      name
      color
      themePref
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
      color
      themePref
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
      color
      themePref
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
        color
        themePref
        watchlist {
          nextToken
        }
        createdAt
        updatedAt
      }
      show {
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
          nextToken
        }
        providerIds
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
        color
        themePref
        watchlist {
          nextToken
        }
        createdAt
        updatedAt
      }
      show {
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
          nextToken
        }
        providerIds
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
        color
        themePref
        watchlist {
          nextToken
        }
        createdAt
        updatedAt
      }
      show {
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
          nextToken
        }
        providerIds
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
export const onCreateShow = /* GraphQL */ `
  subscription OnCreateShow {
    onCreateShow {
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
          userId
          rating
          isFavorite
          updatedAt
          createdAt
        }
        nextToken
      }
      providerIds
      createdAt
      source
      updatedAt
      owner
    }
  }
`;
export const onUpdateShow = /* GraphQL */ `
  subscription OnUpdateShow {
    onUpdateShow {
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
          userId
          rating
          isFavorite
          updatedAt
          createdAt
        }
        nextToken
      }
      providerIds
      createdAt
      source
      updatedAt
      owner
    }
  }
`;
export const onDeleteShow = /* GraphQL */ `
  subscription OnDeleteShow {
    onDeleteShow {
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
          userId
          rating
          isFavorite
          updatedAt
          createdAt
        }
        nextToken
      }
      providerIds
      createdAt
      source
      updatedAt
      owner
    }
  }
`;
