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
import util, { schedule } from '../src/util';
import { setTheme, useTheme } from './ThemeProvider.jsx';
import EpisodeSchedule from './EpisodeSchedule';
import ShowCardGrid from './ShowCardGrid';
import ShowDetailsModal from './ShowDetailsModal';
import SettingsModal from './SettingsModal.jsx';
import UserProfileModal from './UserProfileModal';
import ScrollAwareProgress from './ScrollAwareProgress';
import Toolbar from './Toolbar';
import Drawer from './Drawer';
import { View, Loading, ModalType } from '../src/model';
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
  }
}));

const MainView = ({ authedUser }) => {
  const classes = useStyles();
  const { dispatch } = useTheme();
  const [user, setUser] = useState(authedUser);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openedModal, setOpenedModal] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedShowIdx, setSelectedShowIdx] = useState(null);
  const [shows, setShows] = useState([]);
  const [trendingShows, setTrendingShows] = useState([]);
  const [dateToEpisodes, setDateToEpisodes] = useState();
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
        updatedShows = util.unwrapShowsAndUpdateAvgRatings(updatedShows);
      } else {
        updatedShows.forEach(util.updateAvgRating);
      }

      if (queryParams.nextToken) {
        setShows([...shows, ...updatedShows]);
      } else if (targetView === View.HOME) {
        const uniqueShows = updatedShows.filter((show) => !isTrending(show));

        setShows([...trendingShows, ...uniqueShows]);
      } else {
        setShows(updatedShows);
      }

      setNextToken(data[queryName].nextToken);
    } catch (err) {
      console.error(`Failed to list shows for view "${targetView.label}": `, err);
    }

    setLoading(null);
  };

  /**
   * Fetches the schedule of the selected TV show or
   * all TV shows the user has rated/watchlisted.
   */
  const fetchSchedule = async () => {
    setLoading(Loading.VIEW);

    if (selectedShow) {
      unselectShow();

      const updatedShow = await schedule.fetchShowSchedule(selectedShow);

      setShows([updatedShow]);
      setDateToEpisodes(updatedShow.dateToEpisodes);
    } else {
      const { recentShows, overallDateToEpisodes } = await schedule.fetchOverallShowSchedule(user.id, watchlist);

      setShows(recentShows);
      setDateToEpisodes(overallDateToEpisodes);
    }

    setNextToken(null);
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
    } else if (selectedView === View.SCHEDULE) {
      fetchSchedule();
    } else {
      fetchShows(selectedView);
    }

    setView(selectedView);
    util.scrollToTop();
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

  const addToSchedule = async (show = selectedShow) => {
    const updatedShow = await schedule.getEpisodesOfLatestSeason(show);

    if (!updatedShow) { return; }

    if (updatedShow.rating) {
      addShow(updatedShow);
    }

    schedule.buildOrUpdateOverallDateToEpisodes([updatedShow], dateToEpisodes);
  };

  const removeFromSchedule = (show = selectedShow, showIdx = selectedShowIdx) => {
    schedule.removeShow(show, dateToEpisodes);
    removeOrResetShowInGrid(show, showIdx ?? findSelectedShowIdx());
    unselectShow();
  };

  const isShowReviewedByUser = () => util.findUserReview(selectedShow.reviews?.items, user.name);

  const removeFromWatchlist = (showId) => {
    const updatedWatchlist = watchlist.filter(({ id }) => id !== showId);

    setWatchlist(updatedWatchlist);

    if (view === View.WATCHLIST) {
      setShows(updatedWatchlist);
      unselectShow();
    }
  };

  const addToWatchlist = () => {
    const updatedWatchlist = [selectedShow, ...watchlist];

    setWatchlist(updatedWatchlist);

    if (view === View.WATCHLIST) {
      setShows(updatedWatchlist);
    }
  };

  /**
   * Adds or removes show from watchlist.
   * Also adds or removes show from schedule when on SCHEDULE view
   * and the show is not rated by the user.
   *
   * @param {boolean} isRemoval - whether or not this is a watchlist removal
   * @param {string} showId - the id of the show being added/removed from watchlist
   */
  const updateWatchlistAndSchedule = (isRemoval, showId) => {
    const isScheduleChange = view === View.SCHEDULE && !isShowReviewedByUser();

    if (isRemoval) {
      removeFromWatchlist(showId);

      if (isScheduleChange) {
        removeFromSchedule();
      }
    } else {
      addToWatchlist();

      if (isScheduleChange) {
        addToSchedule();
      }
    }
  };

  /**
   * Handles watchlist addition and removal.
   *
   * @param {boolean} isRemoval - whether or not this is a watchlist removal
   * @param {string} showId - the id of the show being added/removed from watchlist
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

    updateWatchlistAndSchedule(isRemoval, showId);
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

  const resetTrendingShow = (show) => {
    delete show.rating;
    delete show.reviews;
    delete show.updatedAt;
  };

  /**
   * Updates the trending shows if the updated show is trending.
   *
   * @param {Object} updatedShow - the updated show
   */
  const maybeUpdateTrending = (updatedShow, isReset) => {
    if (view === View.HOME) { return; }

    const trendingShowIdx = findTrendingShowIdx(updatedShow);

    if (trendingShowIdx === -1) { return; }

    if (isReset) {
      resetTrendingShow(updatedShow);
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
      resetTrendingShow(show);
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

      if (view === View.SCHEDULE && watchlistIdx === -1) {
        removeFromSchedule(show, showIdx);
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
    } else {
      util.createShowReview(show, currUserRating, !prevUserRating, user.id);
      updateShows(show, isShowInGrid, currUserRating);

      if (view === View.SCHEDULE && !prevUserRating && watchlistIdx === -1) {
        addToSchedule(show);
      }
    }
  };

  /**
   * Selects a rated show with data from graphql.
   *
   * @param {Object} show - the show to select
   */
  const selectRatedShow = async (show) => {
    try {
      const { data } = await API.graphql(graphqlOperation(gqlQuery.getShow, { id: show.objectID }));

      if (data.getShow.rating) {
        util.updateAvgRating(data.getShow);
      }

      setSelectedShow(data.getShow);
    } catch (err) {
      console.error(`Failed to get rated show "${show.objectID}": `, err);
    }
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
   * @param {number} showIdx - index of the show
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
        drawerWidth={drawerWidth}
        drawerOpen={drawerOpen}
        onDrawerOpen={() => setDrawerOpen(true)}
        onSearchSubmit={handleSearch}
        onEditProfile={() => setOpenedModal(ModalType.PROFILE)}
        onEditSettings={() => setOpenedModal(ModalType.SETTINGS)}
      />

      <Drawer
        width={drawerWidth}
        open={drawerOpen}
        selectedView={view}
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
            onScheduleOpen={() => handleDrawerSelection(View.SCHEDULE)}
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

        {view === View.SCHEDULE && !loading ? (
          <EpisodeSchedule
            shows={shows}
            dateToEpisodes={dateToEpisodes}
            onShowSelected={selectShow}
          />
        ) : (
          <ShowCardGrid
            shows={shows}
            trendingShowsCount={view === View.HOME ? trendingShows.length : 0}
            userName={user.name}
            onRatingChange={handleRatingChange}
            onShowAdded={createRatedShow}
            onShowSelected={selectShow}
          />
        )}

        <ScrollAwareProgress
          loadingType={loading}
          backdropLeftStyle={drawerOpen ? drawerWidth + 1 : 57}
          onEndOfPageReached={handleEndOfPageReached}
        />
      </main>
    </div>
  );
};

export default MainView;