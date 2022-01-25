import React, { useEffect, useMemo, useRef, useState } from 'react';
import API, { graphqlOperation } from '@aws-amplify/api';
import {
  createReview,
  createShow,
  createWatchlistItem,
  deleteReview,
  deleteShow,
  deleteWatchlistItem,
  updateReview,
  updateShow
} from '../src/graphql/mutations.js';
import * as gqlQuery from '../src/graphql/custom-queries';
import { makeStyles } from '@material-ui/core/styles';
import {
  Backdrop,
  Box,
  CircularProgress,
  Grid,
  LinearProgress,
  Typography
} from '@material-ui/core';
import ShowCard from './ShowCard';
import ShowDetailsModal from './ShowDetailsModal';
import UserProfileModal from './UserProfileModal';
import useOnScreen from './useOnScreen';
import Toolbar from './Toolbar';
import Drawer from './Drawer';
import View from '../src/model/View';
import clsx from 'clsx';
import { searchClient } from '../src/client';

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
  },
  progressRoot: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.27)',
    borderRadius: 4
  },
  progressBar: {
    borderRadius: 4
  },
  loadingBackdrop: {
    zIndex: 1
  },
  sectionHeader: {
    margin: '70px 0px 10px 0px',
    fontWeight: 500,
    '&:first-of-type': {
      marginTop: 0
    }
  }
}));

class Loading {
  static VIEW = 'view';
  static PAGE = 'page';

  static determineType(currView, targetView) {
    return targetView === currView ? Loading.PAGE : Loading.VIEW;
  }
}

const updateOnShowAddedViews = [View.HOME, View.WATCHED, View.RECENTLY_RATED];

async function maybeAddShowMetadata(show) {
  if (show.providerIds) { return; } // metadata already populated

  const { data } = await searchClient.fetchShowByIdAndType(show.tmdbId, show.type, show.id);

  Object.assign(show, data);
}

function buildReviews(rating, name, color) {
  return {
    items: [{
      rating,
      user: {
        name,
        color
      }
    }]
  };
};

function updateAvgRating(show) {
  const reviews = show.reviews.items;

  show.rating = reviews.reduce((sum, { rating }) => sum + rating, 0) / reviews.length;
}

function unwrapShowsAndUpdateAvgRatings(shows) {
  return shows.map(({ show }) => {
    if (show.rating) {
      updateAvgRating(show);
    }

    return show;
  });
}

function buildWatchlist(shows) {
  const existingShows = shows.filter(({ show }) => show);

  return unwrapShowsAndUpdateAvgRatings(existingShows);
}

const MainView = ({ authedUser }) => {
  const classes = useStyles();
  const [user, setUser] = useState(authedUser);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedShowIdx, setSelectedShowIdx] = useState(null);
  const [shows, setShows] = useState([]);
  const [trendingShows, setTrendingShows] = useState([]);
  const [nextToken, setNextToken] = useState();
  const [view, setView] = useState(View.HOME);
  const [loading, setLoading] = useState(null);
  const [watchlist, setWatchlist] = useState(() => buildWatchlist(authedUser.watchlist.items));
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

  const isTrending = ({ id }) => -1 !== trendingShows.findIndex((show) => show.id === id);

  /**
   * Fetches shows for the provided view.
   *
   * @param {View} targetView - the view to fetch shows for
   */
  const fetchShows = async (targetView = view) => {
    setLoading(Loading.determineType(view, targetView));

    try {
      const queryName = targetView.query.name;
      const queryParams = buildQueryParams(targetView);
      const { data } = await API.graphql(graphqlOperation(gqlQuery[queryName], queryParams));
      let updatedShows = data[queryName].items;

      if (View.FAVORITES.query.name === queryName) {
        updatedShows = unwrapShowsAndUpdateAvgRatings(updatedShows);
      } else {
        updatedShows.forEach(updateAvgRating);
      }

      if (queryParams.nextToken) {
        setShows([...shows, ...updatedShows]);
      } else if (targetView === View.HOME) {
        const uniqueShows = updatedShows.filter((show) => !isTrending(show));

        setShows([...trendingShows, ...uniqueShows]);
        window.scrollTo(0, 0);
      } else {
        setShows(updatedShows);
        window.scrollTo(0, 0);
      }

      setNextToken(data[queryName].nextToken);
    } catch (err) {
      console.error(`Failed to list shows for view "${targetView.label}": `, err);
    }

    setLoading(null);
  };

  /**
   * Changes view and fetches shows for that view upon drawer selection.
   *
   * @param {View} selectedView - the selected view
   */
  const handleDrawerSelection = (selectedView) => {
    if (selectedView === View.WATCHLIST) {
      setShows(watchlist);
      window.scrollTo(0, 0);
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

    if (!selectedShow.rating && !isRemoval) {
      createRatedShow(selectedShow, 0);
      selectedShow.rating = 0;
    }

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
    if (show.reviews) { // rated show
      const reviews = show.reviews.items;

      updateReviews(reviews, userRating);
      updateAvgRating(show);
    } else { // unrated show
      show.reviews = buildReviews(userRating, user.name, user.color);
      show.rating = userRating;
    }
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
   * Removes the provided show from the card grid if not trending.
   * If trending, the show's rating and reviews are reset.
   *
   * @param {Object} show - the show to remove
   * @param {number} showIdx - the index of the show
   */
  const removeOrResetShowInGrid = (show, showIdx) => {
    if (view === View.HOME && showIdx < trendingShows.length) {
      delete show.rating;
      delete show.reviews;
    } else {
      shows.splice(showIdx, 1);
    }

    setShows([...shows]);
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
        removeOrResetShowInGrid(show, showIdx);
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
   * Finds the index of the selected show.
   *
   * @returns {number|null} the selected show's index if found
   */
  const findSelectedShowIdx = () => {
    const showIdx = shows.findIndex(({ id }) => id === selectedShow.id);

    if (showIdx === -1) { return null; }

    setSelectedShowIdx(showIdx);

    return showIdx;
  };

  /**
   * Handles show rating change.
   *
   * @param {Object} show - the show that had a rating change
   * @param {number} currUserRating - the user's current rating of the show
   * @param {number} prevUserRating - the user's previous rating of the show
   * @param {number} showIdx - the index of the show
   */
  const handleRatingChange = (show, currUserRating, prevUserRating, showIdx = selectedShowIdx) => {
    if (showIdx === null) {
      showIdx = findSelectedShowIdx();
    }

    const isShowInGrid = showIdx !== null;

    if (isShowInGrid) {
      show = shows[showIdx];
    }

    if (currUserRating === prevUserRating) {
      removeReview(show, showIdx);
      return;
    }

    createShowReview(show, currUserRating, !prevUserRating);
    updateShows(show, isShowInGrid, currUserRating);
  };

  /**
   * Selects a rated show with data from graphql.
   *
   * @param {Object} show - the show to select
   */
  const selectRatedShow = async (show) => {
    try {
      const { data } = await API.graphql(graphqlOperation(gqlQuery.getShow, { id: show.objectID }));

      if (show.rating) {
        updateAvgRating(data.getShow);
      }

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
      const { data: { description, ...ratings } } = await searchClient.fetchShowByIdAndType(show.id, show.type);

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

    if (view === View.HOME) {
      setSelectedShowIdx(trendingShows.length);
      shows.splice(trendingShows.length, 0, show);
      setShows([...shows]);
    } else if (updateOnShowAddedViews.includes(view) || view === View[show.type.toUpperCase()]) {
      setSelectedShowIdx(0);
      setShows([show, ...shows]);
    }
  };

  /**
   * Creates a rated show.
   *
   * @param {Object} show - show to create
   * @param {number} rating - user's rating of the show
   * @param {number} showIdx - index of the show
   */
  const createRatedShow = async (show, rating, showIdx = selectedShowIdx) => {
    if (showIdx === null) {
      showIdx = findSelectedShowIdx();

      if (showIdx !== null) {
        show = shows[showIdx];
      }
    }

    await maybeAddShowMetadata(show);

    const ratedShow = {
      rating,
      source: rating ? 'UR' : 'WL'
    };

    if (rating && show.rating === 0) { // unrated WL item
      API.graphql(graphqlOperation(updateShow, { input: { ...ratedShow, id: show.id } }));
    } else { // unrated show
      const { reviews, updatedAt, ...input } = { ...show, ...ratedShow };

      API.graphql(graphqlOperation(createShow, { input }))
        .catch((err) => {
          console.error('GraphQL create show failed. ', err);
        });
    }

    if (!rating) { return; } // Unrated show added to WL

    handleRatingChange(show, rating, null, showIdx);

    if (null !== showIdx) { return; }

    addShow(show);
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

    setUser({ ...user, name, color });
  };

  const renderShowCard = (show, showIdx) => (
    <Grid key={showIdx} item xs className={clsx({ [classes.reducedGrow]: shows.length === 2 })}>
      <ShowCard
        show={show}
        userRating={findUserReview(show.reviews?.items)?.rating}
        onRatingChange={(rating, userRating) => {
          if (show.rating) {
            handleRatingChange(show, rating, userRating, showIdx);
          } else { // unrated trending show
            createRatedShow(show, rating, showIdx);
          }
        }}
        onClick={async () => {
          if (!show.rating) { // unrated trending show
            await maybeAddShowMetadata(show);
          }

          selectShow(show, showIdx);
        }}
      />
    </Grid>
  );

  /**
   * Fetches the rated version of the provided trending show.
   *
   * @param {Object} show - the show to fetch
   * @returns {Object} the rated show if found; otherwise the provided show.
   */
  const maybeFetchRatedTrendingShow = async (show) => {
    try {
      const { data: { getShow } } = await API.graphql(graphqlOperation(gqlQuery.getShow, { id: show.id }));

      if (!getShow) { return show; }

      updateAvgRating(getShow);

      return getShow;
    } catch (err) {
      console.error(`Failed to get rated show "${show.id}": `, err);

      return show;
    }
  };

  /**
   * Fetches trending shows for the week.
   */
  const fetchTrendingShows = async () => {
    const { data: unratedTrendingShows } = await searchClient.fetchTrendingShows();
    const ratedTrendingShows = await Promise.all(unratedTrendingShows.map(maybeFetchRatedTrendingShow));

    setTrendingShows(ratedTrendingShows);
    setShows(ratedTrendingShows);
  };

  useEffect(() => {
    fetchTrendingShows();
  }, []);

  useEffect(() => {
    if (trendingShows.length === 0) { return; }

    fetchShows();
  }, [trendingShows]);

  const infiniteScroll = () => {
    if (!isEndOfPageVisisble || !nextToken) { return; }

    fetchShows();
  };

  useEffect(infiniteScroll, [isEndOfPageVisisble]);

  return (
    <div className={classes.root}>
      <Toolbar
        user={user}
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
            user={user}
            userReview={findUserReview(selectedShow.reviews?.items)}
            isInWatchlist={watchlistIdx !== -1}
            onRatingChange={handleRatingChange}
            onShowAdded={createRatedShow}
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

        {view === View.HOME && trendingShows.length !== 0 && (
          <>
            <Typography variant="h5" className={classes.sectionHeader}>Trending</Typography>
            <Grid container spacing={3} wrap="wrap">
              {shows.slice(0, trendingShows.length).map(renderShowCard)}
            </Grid>
            <Typography variant="h5" className={classes.sectionHeader}>Recently Rated</Typography>
          </>
        )}

        <Grid container spacing={3} wrap="wrap">
          {
            shows.slice(view === View.HOME ? trendingShows.length : 0)
              .map((show, i) => renderShowCard(show, view === View.HOME ? trendingShows.length + i : i))
          }
        </Grid>

        {loading === Loading.PAGE && isEndOfPageVisisble && (
          <Box display="flex" justifyContent="center" mt="24px" width="100%">
            <LinearProgress classes={{ root: classes.progressRoot, bar: classes.progressBar}} />
          </Box>
        )}

        <Backdrop
          style={{ left: drawerOpen ? drawerWidth + 1 : 57 }}
          className={classes.loadingBackdrop}
          transitionDuration={{ exit: 500 }}
          open={loading === Loading.VIEW}
        >
          <CircularProgress disableShrink size={50} />
        </Backdrop>

        <div ref={endOfPageRef} style={{ position: 'relative', bottom: 500 }} />
      </main>
    </div>
  );
};

export default MainView;