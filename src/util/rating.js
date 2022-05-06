import API, { graphqlOperation } from '@aws-amplify/api';
import { createReview, updateReview } from '../graphql/mutations.js';

function buildReview(rating, name, color) {
  return {
    rating,
    user: {
      name,
      color
    }
  };
}

export function updateAvgRating(show) {
  const reviews = show.reviews.items;

  if (reviews.length === 0) { return; }

  show.rating = reviews.reduce((sum, { rating }) => sum + rating, 0) / reviews.length;
}

/**
 * Removes the outer "show" wrapper from the GraphQL response and updates the
 * average rating of each show.
 *
 * @param {Object[]} shows - the shows to unwrap and update avg rating of
 * @returns {Object[]} the updated shows
 */
 export function unwrapShowsAndUpdateAvgRatings(shows) {
  return shows.map(({ show }) => {
    if (show.rating) {
      updateAvgRating(show);
    }

    return show;
  });
}

/**
 * Updates the reviews of a show.
 *
 * @param {Object[]} reviews - the show's reviews
 * @param {number} userRating - the user's rating of the show
 * @param {Object} user - the user to update review for
 */
 export const updateReviews = (reviews, userRating, user) => {
  const oldReviewIdx = reviews.findIndex(({ user: { name } }) => name === user.name);

  if (!userRating) { // Remove
    reviews.splice(oldReviewIdx, 1);
  } else if (oldReviewIdx === -1) { // Add
    reviews.push(buildReview(userRating, user.name, user.color));
  } else { // Update
    reviews[oldReviewIdx].rating = userRating;
  }
};

/**
 * Creates or updates the user's review of a show.
 *
 * @param {Object} show - the show to create review for
 * @param {number} rating - the user's rating of the show
 * @param {boolean} isInitialRating - whether or not it is the first time the user has rated the show
 * @param {string} userId - the ID of the user creating the review
 */
export const createShowReview = async (show, rating, isInitialRating, userId) => {
  const review = {
    showId: show.id,
    userId,
    rating
  };
  const operation = isInitialRating ? createReview : updateReview;

  try {
    await API.graphql(graphqlOperation(operation, { input: review }));
  } catch (err) {
    console.error('Failed to rate show: ', err);
  }
};

/**
 * Updates the reviews and avg rating of the provided show.
 *
 * @param {Object} show - the show to update
 * @param {number} userRating - the user's rating of the show
 * @param {Object} user - the user to update review for
 */
export const updateReviewsAndAvgRating = (show, userRating, user) => {
  if (show.reviews) { // rated show
    const reviews = show.reviews.items;

    updateReviews(reviews, userRating, user);
    updateAvgRating(show);
  } else { // unrated show
    show.reviews = { items: [buildReview(userRating, user.name, user.color)] };
    show.rating = userRating;
  }
};

/**
 * Finds the logged in user's review in the provided reviews.
 *
 * @param {Object[]} reviews - the reviews to search
 * @param {string} name - the name of the user to find review from
 * @returns {Object} the user's review
 */
 export const findUserReview = (reviews, name) => reviews?.find((review) => review.user.name === name);

 /**
  * Updates the user's name and avatar color in all of their show reviews.
  *
  * @param {Object[]} targetShows - the shows that need reviews updated
  * @param {string} prevName - the user's name prior to being updated
  * @param {string} name - the user's updated name
  * @param {string} color - the user's updated avatar color
  */
 export const updateUserReviews = (targetShows, prevName, name, color) => {
   targetShows.forEach((show) => {
     const review = findUserReview(show.reviews?.items, prevName);
 
     if (!review) { return; }
 
     review.user = { name, color };
   });
 };

 /**
 * Resets the provided trending show to an unrated state.
 *
 * @param {Object} show - the show to reset
 */
export const resetTrendingShow = (show) => {
  delete show.rating;
  delete show.reviews;
  delete show.updatedAt;
};