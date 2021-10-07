import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import API, { graphqlOperation } from '@aws-amplify/api';
import {
  createReview,
  createWatchlistItem,
  deleteReview,
  deleteShow,
  deleteWatchlistItem,
  updateReview
} from '../src/graphql/mutations.js';
import * as gqlQuery from '../src/graphql/custom-queries';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import ShowCard from './ShowCard';
import ShowDetailsModal from './ShowDetailsModal';
import UserProfileModal from './UserProfileModal';
import useOnScreen from './useOnScreen';
import Toolbar from './Toolbar';
import Drawer from './Drawer';
import View from '../src/model/View';
import clsx from 'clsx';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  },
  toolbarSpacer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar
  },
  reducedGrow: {
    flexGrow: 0.2,
    flexBasis: 'unset'
  }
}));

const updateOnShowAddedViews = [View.HOME, View.WATCHED, View.RECENTLY_RATED];

// Todo: add logic for updating show's avg rating in db when reviews are updated, rather than calculating client-side.
function updateAvgRating(show) {
  const reviews = show.reviews.items;

  show.rating = reviews.reduce((sum, { rating }) => sum + rating, 0) / reviews.length;
}

function unwrapShowsAndUpdateAvgRatings(shows) {
  return shows.map(({ show }) => {
    updateAvgRating(show);

    return show;
  });
}

function buildWatchlist(shows) {
  const existingShows = shows.filter(({ show }) => show);

  return unwrapShowsAndUpdateAvgRatings(existingShows);
}

const MainView = ({ user }) => {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedShowIdx, setSelectedShowIdx] = useState(null);
  const [shows, setShows] = useState([]);
  const [nextToken, setNextToken] = useState();
  const [view, setView] = useState(View.HOME);
  const [watchlist, setWatchlist] = useState(() => buildWatchlist(user.watchlist.items));
  const findWatchlistIdx = (showId = selectedShow?.id) => watchlist.findIndex(({ id }) => id === showId);
  const watchlistIdx = useMemo(findWatchlistIdx, [selectedShow, watchlist]);
  const endOfPageRef = useRef();
  const isEndOfPageVisisble = useOnScreen(endOfPageRef);

  /**
   * Builds the query params needed to fetch shows for the provided view.
   *
   * @param {View} targetView - the view to fetch shows for
   * @returns {Object} the query params for the fetch shows request
   */
  const buildQueryParams = (targetView) => {
    const queryParams = {
      ...targetView.query.params,
      limit: 100,
      sortDirection: 'DESC',
      nextToken: targetView === view ? nextToken : null
    };

    if (targetView.query.name === View.FAVORITES.query.name) {
      queryParams.userId = user.id;
    }

    return queryParams;
  };

  /**
   * Fetches shows for the provided view.
   *
   * @param {View} targetView - the view to fetch shows for
   */
  const fetchShows = async (targetView = view) => {
    try {
      const queryName = targetView.query.name;
      const { data } = await API.graphql(graphqlOperation(gqlQuery[queryName], buildQueryParams(targetView)));
      let updatedShows = data[queryName].items;

      if (View.FAVORITES.query.name === queryName) {
        updatedShows = unwrapShowsAndUpdateAvgRatings(updatedShows);
      } else {
        updatedShows.forEach(updateAvgRating);
      }

      if (targetView === view) {
        setShows([...shows, ...updatedShows]);
      } else {
        setShows(updatedShows);
      }

      setNextToken(data[queryName].nextToken);
    } catch (err) {
      console.error(`Failed to list shows for view "${targetView.label}": `, err);
    }
  };

  /**
   * Changes view and fetches shows for that view upon drawer selection.
   *
   * @param {View} selectedView - the selected view
   */
  const handleDrawerSelection = (selectedView) => {
    if (selectedView === View.WATCHLIST) {
      setShows(watchlist);
    } else {
      fetchShows(selectedView);
    }

    setView(selectedView);
  };

  /**
   * Updates shows and watchlist when a show is favorited/unfavorited.
   *
   * @param {boolean} isFavorite - whether or not the show is favorited
   */
  const handleFavoriteChange = (isFavorite) => {
    const isShowInGrid = selectedShowIdx !== null;
    const updatedShows = isShowInGrid ? [...shows] : [selectedShow, ...shows];
    const updatedShow = updatedShows[selectedShowIdx ?? 0];

    findUserReview(updatedShow.reviews.items).isFavorite = isFavorite;
    updateWatchlist(updatedShow);

    if (view === View.FAVORITES && !isShowInGrid) {
      setSelectedShowIdx(0);
    }

    if (view === View.FAVORITES && !isFavorite) {
      updatedShows.splice(selectedShowIdx, 1);
      unselectShow();
    } else {
      setSelectedShow(updatedShow);
    }

    if (isShowInGrid || view === View.FAVORITES) {
      setShows(updatedShows);
    }
  };

  const removeFromWatchlist = (showId) => {
    const updatedWatchlist = watchlist.filter(({ id }) => id !== showId);

    setWatchlist(updatedWatchlist);

    if (view !== View.WATCHLIST) { return; }

    setShows(updatedWatchlist);
    unselectShow();
  };

  const addToWatchlist = () => {
    const updatedWatchlist = [selectedShow, ...watchlist];

    setWatchlist(updatedWatchlist);

    if (view !== View.WATCHLIST) { return; }

    setShows(updatedWatchlist);
  };


  /**
   * Handles watchlist addition and removal.
   *
   * @param {boolean} isRemoval - whether or not this is a watchlist removal
   * @param {string} showId - the id of the show being added/removed from watchlist
   */
  const handleWatchlistChange = async (isRemoval, showId = selectedShow.id) => {
    const watchlistItem = {
      userId: user.id,
      showId
    };
    const operation = isRemoval ? deleteWatchlistItem : createWatchlistItem;

    try {
      await API.graphql(graphqlOperation(operation, { input: watchlistItem }));
    } catch (err) {
      console.error('GraphQL toggle watchlist failed. ', err);
      return;
    }

    if (isRemoval) {
      removeFromWatchlist(showId);
    } else {
      addToWatchlist();
    }
  };

  const buildReview = (rating) => ({
    rating,
    user: {
      name: user.name,
      color: user.color
    }
  });

  /**
   * Updates the reviews of a show.
   *
   * @param {Object[]} reviews - the show's reviews
   * @param {number} userRating - the user's rating of the show
   */
  const updateReviews = (reviews, userRating) => {
    const oldReviewIdx = reviews.findIndex(({ user: { name } }) => name === user.name);

    if (!userRating) { // Remove
      reviews.splice(oldReviewIdx, 1);
    } else if (oldReviewIdx === -1) { // Add
      reviews.push(buildReview(userRating));
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
   */
  const createShowReview = async (show, rating, isInitialRating) => {
    const review = {
      showId: show.id,
      userId: user.id,
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
   */
  const updateReviewsAndAvgRating = (show, userRating) => {
    if (!show.reviews) { return; }

    const reviews = show.reviews.items;

    updateReviews(reviews, userRating);
    updateAvgRating(show);
  };

  /**
   * Updates the watchlist if the updated show is in the watchlist.
   *
   * @param {Object} updatedShow - the updated show
   */
  const updateWatchlist = (updatedShow) => {
    const watchlistShowIdx = selectedShow ? watchlistIdx : findWatchlistIdx(updatedShow.id);

    if (watchlistShowIdx === -1) { return; }

    watchlist[watchlistShowIdx] = updatedShow;
    setWatchlist([...watchlist]);
  };

  /**
   * Updates shows on rating change.
   *
   * @param {Object} show - the show to update
   * @param {boolean} isShowInGrid - whether or not the show is in the card grid
   * @param {number} userRating - the user's rating of the show
   */
  const updateShows = (show, isShowInGrid, userRating) => {
    updateReviewsAndAvgRating(show, userRating);
    updateWatchlist(show);

    if (isShowInGrid) {
      setShows([...shows]);
    }

    if (selectedShow) {
      setSelectedShow({ ...show });
    }
  };

  /**
   * Removes the provided show and its watchlist entry.
   *
   * @param {Object} show - the show to remove
   * @param {number} showIdx - the index of the show
   */
  const removeShow = async (show, showIdx) => {
    try {
      const input = { id: show.id };

      await API.graphql(graphqlOperation(deleteShow, { input }));

      if (watchlistIdx !== -1 || findWatchlistIdx(show.id) !== -1) {
        handleWatchlistChange(true, show.id);
      }

      if (showIdx !== -1) {
        shows.splice(showIdx, 1);
        setShows([...shows]);
      }

      if (selectedShow) {
        unselectShow();
      }
    } catch (err) {
      console.error(`Failed to remove show "${show.id}": `, err);
    }
  };

  /**
   * Removes the logged in user's review of a show and the show itself if sole reviewer.
   *
   * @param {Object} show - the show to remove review from
   * @param {number} showIdx - the index of the show
   */
  const removeReview = async (show, showIdx) => {
    try {
      const input = {
        showId: show.id,
        userId: user.id
      };

      await API.graphql(graphqlOperation(deleteReview, { input }));

      if (show.reviews.items.length === 1) {
        removeShow(show, showIdx);
      } else {
        updateShows(show, showIdx !== -1);
      }
    } catch (err) {
      console.error(`Failed to remove review "${show.id}:${user.id}": `, err);
    }
  };

  /**
   * Handles show rating change.
   *
   * @param {Object} show - the show that had a rating change
   * @param {number} currUserRating - the user's current rating of the show
   * @param {number} prevUserRating - the user's previous rating of the show
   * @param {number} showIdx - the index of the show
   */
  const handleRatingChange = async (show, currUserRating, prevUserRating, showIdx = selectedShowIdx) => {
    let isShowInGrid = true;

    if (showIdx === null) {
      showIdx = shows.findIndex(({ id }) => id === selectedShow.id);

      if (showIdx === -1) {
        isShowInGrid = false;
      } else {
        setSelectedShowIdx(showIdx);
      }
    }

    if (isShowInGrid) {
      show = shows[showIdx];
    }

    if (currUserRating === prevUserRating) {
      removeReview(show, showIdx);
      return;
    }

    updateShows(show, isShowInGrid, currUserRating);
    await createShowReview(show, currUserRating, !prevUserRating);
  };

  /**
   * Selects a rated show with data from graphql.
   *
   * @param {Object} show - the show to select
   */
  const selectRatedShow = async (show) => {
    try {
      const { data } = await API.graphql(graphqlOperation(gqlQuery.getShow, { id: show.objectID }));

      updateAvgRating(data.getShow);
      setSelectedShow(data.getShow);
    } catch (err) {
      console.error(`Failed to get rated show "${show.objectID}": `, err);
    }
  };

  const determineShorterDesc = (tmdbDesc, omdbDesc) => {
    if (!omdbDesc) { return tmdbDesc; }

    return tmdbDesc.length < omdbDesc.length ? tmdbDesc : omdbDesc;
  };

  /**
   * Selects an unrated show with data from OMDB API.
   *
   * @param {Object} show - the show to select
   */
  const selectUnratedShow = async (show) => {
    try {
      const { data: { description, ...ratings } } = await axios.get(`/api/search?id=${show.id}&type=${show.type}`);

      setSelectedShow({
        ...show,
        ...ratings,
        description: determineShorterDesc(show.description, description)
      });
    } catch (err) {
      console.error(`Failed to get unrated show "${show.id}": `, err);
    }
  };

  const handleSearch = async (show) => {
    if (show.id) {
      await selectUnratedShow(show);
    } else {
      await selectRatedShow(show);
    }
  };

  const addShow = (show) => {
    setSelectedShow(show);

    if (updateOnShowAddedViews.includes(view) || view === View[show.type.toUpperCase()]) {
      setSelectedShowIdx(0);
      setShows([show, ...shows]);
    }
  };

  const unselectShow = () => {
    setSelectedShow(null);
    setSelectedShowIdx(null);
  };

  const selectShow = (show, showIdx) => {
    setSelectedShow(show);
    setSelectedShowIdx(showIdx);
  };

  /**
   * Finds the logged in user's review in the provided reviews.
   *
   * @param {Object[]} reviews - the reviews to search
   * @returns the user's review
   */
  const findUserReview = (reviews) => reviews?.find((review) => review.user.name === user.name);

  /**
   * Updates the user's name and avatar color in all their show reviews.
   *
   * @param {Object[]} targetShows - the shows that need reviews updated
   * @param {string} name - the user's updated name
   * @param {string} color - the user's updated avatar color
   */
  const updateUserReviews = (targetShows, name, color) => {
    targetShows.forEach((show) => {
      const review = findUserReview(show.reviews.items);

      if (!review) { return; }

      review.user = { name, color };
    });
  };

  /**
   * Handles profile changes by updating the user's name
   * and avatar color in all their show reviews.
   *
   * @param {string} name - the user's updated name
   * @param {string} color - the user's updated avatar color
   */
  const handleProfileSave = (name, color) => {
    setProfileModalOpen(false);
    updateUserReviews(shows, name, color);
    updateUserReviews(watchlist, name, color);

    user.name = name;
    user.color = color;
  };

  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    if (!isEndOfPageVisisble || !nextToken) { return; }

    fetchShows();
  }, [isEndOfPageVisisble]);

  return (
    <div className={classes.root}>
      <Toolbar
        drawerWidth={drawerWidth}
        drawerOpen={drawerOpen}
        onDrawerOpen={() => setDrawerOpen(true)}
        onSearchSubmit={handleSearch}
        onEditProfile={() => setProfileModalOpen(true)}
      />

      <Drawer
        width={drawerWidth}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelect={handleDrawerSelection}
      />

      <main className={classes.content}>
        <span className={classes.toolbarSpacer} />
        {selectedShow && (
          <ShowDetailsModal
            show={selectedShow}
            userId={user.id}
            userReview={findUserReview(selectedShow.reviews?.items)}
            isInWatchlist={watchlistIdx !== -1}
            onRatingChange={handleRatingChange}
            onShowAdded={addShow}
            onFavoriteChange={handleFavoriteChange}
            onWatchlistChange={handleWatchlistChange}
            onClose={unselectShow}
          />
        )}

        {profileModalOpen && (
          <UserProfileModal
            user={user}
            onClose={() => setProfileModalOpen(false)}
            onSave={handleProfileSave}
          />
        )}

        <Grid container spacing={3} wrap="wrap">
          {shows.map((show, i) => (
            <Grid key={i} item xs className={clsx({ [classes.reducedGrow]: shows.length === 2 })}>
              <ShowCard
                show={show}
                userRating={findUserReview(show.reviews?.items)?.rating}
                onRatingChange={(rating, userRating) => handleRatingChange(show, rating, userRating, i)}
                onClick={() => selectShow(show, i)}
              />
            </Grid>
          ))}
        </Grid>
        <div ref={endOfPageRef} style={{ position: 'relative', bottom: 500 }} />
      </main>
    </div>
  );
};

export default MainView;