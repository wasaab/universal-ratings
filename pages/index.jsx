import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import API, { graphqlOperation } from '@aws-amplify/api';
import {
  createShow,
  createWatchlistItem,
  deleteReview,
  deleteShow,
  deleteWatchlistItem,
  updateShow
} from '../src/graphql/mutations.js';
import * as gqlQuery from '../src/graphql/custom-queries';
import * as util from '../src/util';
import {
  Drawer,
  Toolbar,
  ShowCardGrid,
  ShowDetailsModal,
  SettingsModal,
  UserProfileModal,
  ScrollAwareProgress,
  setTheme,
  useTheme
} from '../components';
import { View, Loading, ModalType, Width } from '../src/model';
import { searchClient } from '../src/client';

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
  }
}));

// Todo: Remove initialTrendingShows prop if not using SSR to fetch trending
const Index = ({ authedUser, initialTrendingShows = [] }) => {
  const classes = useStyles();
  const { dispatch } = useTheme();
  const [user, setUser] = useState(authedUser);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openedModal, setOpenedModal] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedShowIdx, setSelectedShowIdx] = useState(null);
  const [shows, setShows] = useState(initialTrendingShows);
  const [trendingShows, setTrendingShows] = useState(initialTrendingShows);
  const [nextToken, setNextToken] = useState();
  const [view, setView] = useState(View.HOME);
  const [loading, setLoading] = useState(null);
  const [watchlist, setWatchlist] = useState(() => util.buildWatchlist(authedUser.watchlist.items));
  const findWatchlistIdx = (showId = selectedShow?.id) => watchlist.findIndex(({ id }) => id === showId);
  const watchlistIdx = useMemo(findWatchlistIdx, [selectedShow, watchlist]);

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


  const findTrendingShowIdx = ({ id }) => trendingShows.findIndex((show) => show.id === id);
  const isTrending = (show) => -1 !== findTrendingShowIdx(show);

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  /**
   * Fetches shows for the provided view.
   *
   * @param {View=} targetView - the view to fetch shows for
   */
  const fetchShows = async (targetView = view) => {
    setLoading(Loading.determineType(view, targetView));

    try {
      const queryName = targetView.query.name;
      const queryParams = buildQueryParams(targetView);
      const { data } = await API.graphql(graphqlOperation(gqlQuery[queryName], queryParams));
      let updatedShows = data[queryName].items;

      if (View.FAVORITES.query.name === queryName) {
        updatedShows = util.unwrapShowsAndUpdateAvgRatings(updatedShows);
      } else {
        updatedShows.forEach(util.updateAvgRating);
      }

      if (queryParams.nextToken) {
        setShows([...shows, ...updatedShows]);
      } else if (targetView === View.HOME) {
        const uniqueShows = updatedShows.filter((show) => !isTrending(show));

        setShows([...trendingShows, ...uniqueShows]);
        scrollToTop();
      } else {
        setShows(updatedShows);
        scrollToTop();
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
      scrollToTop();
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
    const userReview = util.findUserReview(updatedShow.reviews.items, user.name);

    userReview.isFavorite = isFavorite;
    updateWatchlist(updatedShow);
    maybeUpdateTrending(updatedShow);

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
   * @param {string=} showId - the id of the show being added/removed from watchlist
   * @param {Object=} show - the show being added/removed from watchlist
   */
  const handleWatchlistChange = async (isRemoval, showId = selectedShow.id, show = selectedShow) => {
    const watchlistItem = {
      userId: user.id,
      showId
    };
    const operation = isRemoval ? deleteWatchlistItem : createWatchlistItem;

    if (isNaN(show.rating) && !isRemoval) {
      createRatedShow(selectedShow, 0);
      show.rating = 0;
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
   * Updates the trending shows if the updated show is trending.
   *
   * @param {Object} updatedShow - the updated show
   * @param {boolean=} isReset - whether the trending show is being reset to unrated
   */
  const maybeUpdateTrending = (updatedShow, isReset) => {
    if (view === View.HOME) { return; }

    const trendingShowIdx = findTrendingShowIdx(updatedShow);

    if (trendingShowIdx === -1) { return; }

    if (isReset) {
      util.resetTrendingShow(updatedShow);
    }

    trendingShows[trendingShowIdx] = updatedShow;
    setTrendingShows([...trendingShows]);
  };

  /**
   * Updates shows on rating change.
   *
   * @param {Object} show - the show to update
   * @param {boolean} isShowInGrid - whether or not the show is in the card grid
   * @param {number} userRating - the user's rating of the show
   */
  const updateShows = (show, isShowInGrid, userRating) => {
    util.updateReviewsAndAvgRating(show, userRating, user);
    updateWatchlist(show);
    maybeUpdateTrending(show);

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
      util.resetTrendingShow(show);
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

      if (watchlistIdx !== -1 || (!selectedShow && findWatchlistIdx(show.id) !== -1)) {
        handleWatchlistChange(true, show.id, show);
      }

      maybeUpdateTrending(show, true);

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
   * @param {number=} showIdx - the index of the show
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
    } else {
      util.createShowReview(show, currUserRating, !prevUserRating, user.id);
      updateShows(show, isShowInGrid, currUserRating);
    }
  };

  /**
   * Selects a rated show with data from graphql.
   *
   * @param {Object} show - the show to select
   */
  const selectRatedShow = async (show) => {
    const ratedShow = await util.fetchRatedShow(show.objectID);

    if (!ratedShow) { return; }

    setSelectedShow(ratedShow);
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
        description: util.determineShorterDesc(show.description, description)
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
    } else if (view.includeAdded || view === View.fromShowType(show.type)) {
      setSelectedShowIdx(0);
      setShows([show, ...shows]);
    }
  };

  /**
   * Creates a rated show.
   *
   * @param {Object} show - show to create
   * @param {number} rating - user's rating of the show
   * @param {number=} showIdx - index of the show
   */
  const createRatedShow = async (show, rating, showIdx = selectedShowIdx) => {
    if (showIdx === null) {
      showIdx = findSelectedShowIdx();

      if (showIdx !== null) {
        show = shows[showIdx];
      }
    }

    await util.maybeAddShowMetadata(show);

    const ratedShow = {
      rating,
      source: rating ? 'UR' : 'WL'
    };

    if (rating && show.rating === 0) { // unrated WL item
      API.graphql(graphqlOperation(updateShow, { input: { ...ratedShow, id: show.id } }));
    } else { // unrated show
      API.graphql(graphqlOperation(createShow, { input: { ...show, ...ratedShow } }))
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

  const selectShow = async (show, showIdx) => {
    if (!show.rating) { // unrated trending show
      await util.maybeAddShowMetadata(show);
    }

    setSelectedShow(show);
    setSelectedShowIdx(showIdx);
  };

  const closeModal = () => {
    setOpenedModal(null);
  };

  /**
   * Handles profile changes by updating the user's name
   * and avatar color in all their show reviews.
   *
   * @param {string} name - the user's updated name
   * @param {string} color - the user's updated avatar color
   */
  const handleProfileSave = (name, color) => {
    closeModal();
    util.updateUserReviews(shows, user.name, name, color);
    util.updateUserReviews(watchlist, user.name, name, color);

    setUser({ ...user, name, color });
  };

  const handleEndOfPageReached = () => {
    if (!nextToken) { return; }

    fetchShows();
  };

  /**
   * Fetches trending shows for the week.
   */
  const fetchTrendingShows = async () => {
    const { data: unratedTrendingShows } = await searchClient.fetchTrendingShows();

    const ratedTrendingShows = await Promise.all(unratedTrendingShows.map(util.maybeFetchRatedTrendingShow));

    setTrendingShows(ratedTrendingShows);
    setShows(ratedTrendingShows);
  };

  useEffect(() => {
    fetchTrendingShows();
    setTheme(dispatch, authedUser.themePref, true);
  }, []);

  useEffect(() => {
    if (trendingShows.length === 0) { return; }

    fetchShows();
  }, [trendingShows]);

  return (
    <div className={classes.root}>
      <Toolbar
        user={user}
        drawerOpen={drawerOpen}
        onDrawerOpen={() => setDrawerOpen(true)}
        onSearchSubmit={handleSearch}
        onEditProfile={() => setOpenedModal(ModalType.PROFILE)}
        onEditSettings={() => setOpenedModal(ModalType.SETTINGS)}
      />

      <Drawer
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
            userReview={util.findUserReview(selectedShow.reviews?.items, user.name)}
            isInWatchlist={watchlistIdx !== -1}
            onRatingChange={handleRatingChange}
            onShowAdded={createRatedShow}
            onFavoriteChange={handleFavoriteChange}
            onWatchlistChange={handleWatchlistChange}
            onClose={unselectShow}
          />
        )}

        {openedModal === ModalType.PROFILE && (
          <UserProfileModal
            user={user}
            onClose={closeModal}
            onSave={handleProfileSave}
          />
        )}

        {openedModal === ModalType.SETTINGS && (
          <SettingsModal onClose={closeModal} />
        )}

        <ShowCardGrid
          shows={shows}
          trendingShowsCount={view === View.HOME ? trendingShows.length : 0}
          userName={user.name}
          onRatingChange={handleRatingChange}
          onShowAdded={createRatedShow}
          onShowSelected={selectShow}
        />

        <ScrollAwareProgress
          loadingType={loading}
          backdropLeftStyle={drawerOpen ? Width.OPEN_DRAWER + 1 : Width.CLOSED_DRAWER}
          onEndOfPageReached={handleEndOfPageReached}
        />
      </main>
    </div>
  );
};

export const getStaticProps = () => ({ props: {} });

export default Index;