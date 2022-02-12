export default class RatingTip {
  static AWFUL = 'Awful';
  static BAD = 'Bad';
  static WATCHABLE = 'Watchable';
  static ENJOYABLE = 'Enjoyable';
  static GOOD = 'Good';
  static VERY_GOOD = 'Very Good';
  static WATCHED = 'Watched';
  static DELETE_REVIEW = 'Delete Review';

  static MAX_RATING_TO_TIPS = [
    [RatingTip.WATCHED],
    [RatingTip.BAD, RatingTip.GOOD],
    [RatingTip.BAD, RatingTip.ENJOYABLE, RatingTip.VERY_GOOD],
    [RatingTip.AWFUL, RatingTip.WATCHABLE, RatingTip.ENJOYABLE, RatingTip.VERY_GOOD],
    [RatingTip.AWFUL, RatingTip.WATCHABLE, RatingTip.ENJOYABLE, RatingTip.GOOD, RatingTip.VERY_GOOD]
  ];

  /**
   * Gets the rating tips to be diplayed for star rating buttons on hover.
   * Tips are based on the rating scale of 1 to the max rating provided.
   *
   * @param {number} maxRating - the maximum rating allowed (1-5)
   * @returns {RatingTip[]} the rating tips for the provided scale
   */
  static getTipsForRatingScale(maxRating) {
    return this.MAX_RATING_TO_TIPS[maxRating - 1];
  }
}