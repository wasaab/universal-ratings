import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import { makeStyles } from '@material-ui/core/styles';
import API, { graphqlOperation } from '@aws-amplify/api';
import {
  createShow,
  createWatchlistItem,
  deleteShow,
  deleteWatchlistItem,
  updateShow
} from '../src/graphql/mutations.js';
import { deleteReview } from '../src/graphql/custom-mutations.js';
import * as gqlQuery from '../src/graphql/custom-queries';
import {
  Drawer,
  Toolbar,
  EpisodeSchedule,
  ShowCardGrid,
  ShowDetailsModal,
  SettingsModal,
  UserProfileModal,
  ScrollAwareProgress,
  setTheme,
  useTheme
} from '../components';
import { View, Loading, ModalType, Width, ShowType } from '../src/model';
import { searchClient } from '../src/client';
import {
  buildOrUpdateOverallDateToEpisodes,
  buildWatchlist,
  createShowReview,
  determineShorterDesc,
  fetchOverallShowSchedule,
  fetchRatedShow,
  fetchShowSchedule,
  findUserReview,
  getEpisodesOfLatestSeason,
  isInAnyUsersWatchlist,
  maybeAddShowMetadata,
  maybeFetchRatedTrendingShow,
  removeShowFromSchedule,
  resetTrendingShow,
  resetWatchlistShow,
  unwrapShowsAndUpdateAvgRatings,
  updateAvgRating,
  updateReviewsAndAvgRating,
  updateUserReviews
} from '../src/util';

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

const Index = ({ authedUser }) => {
  const classes = useStyles();
  const { dispatch } = useTheme();
  const [user, setUser] = useState(authedUser);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openedModal, setOpenedModal] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedShowIdx, setSelectedShowIdx] = useState(null);
  const [shows, setShows] = useState([]);
  const [trending, setTrending] = useState(null);
  const [dateToEpisodes, setDateToEpisodes] = useState();
  const [nextToken, setNextToken] = useState();
  const router = useRouter();
  const [view, setView] = useState(View.fromPath(router.asPath) ?? View.HOME);
  const [loading, setLoading] = useState(null);
  const [watchlist, setWatchlist] = useState(() => buildWatchlist(authedUser.watchlist.items));
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


  const findTrendingShowIdx = ({ id }) => trending.shows.findIndex((show) => show.id === id);
  const isTrending = (show) => -1 !== findTrendingShowIdx(show);

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
        updatedShows = unwrapShowsAndUpdateAvgRatings(updatedShows);
      } else {
        updatedShows.forEach(updateAvgRating);
      }

      if (queryParams.nextToken) {
        setShows([...shows, ...updatedShows]);
      } else if (targetView === View.HOME) {
        const uniqueShows = updatedShows.filter((show) => !isTrending(show));

        setShows([...trending.shows, ...uniqueShows]);
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

      const updatedShow = await fetchShowSchedule(selectedShow);

      setShows([updatedShow]);
      setDateToEpisodes(updatedShow.dateToEpisodes);
    } else {
      const { recentShows, overallDateToEpisodes } = await fetchOverallShowSchedule(user.id, watchlist);

      setShows(recentShows);
      setDateToEpisodes(overallDateToEpisodes);
    }

    setNextToken(null);
    setLoading(null);
  };

  const scrollToTop = () => {
    window.scrollTo(0, 0);
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
    } else if (selectedView === View.HOME && (!trending || moment().isAfter(trending.expirationTime))) {
      setLoading(Loading.VIEW);
      fetchTrendingShows();
    } else {
      fetchShows(selectedView);
    }

    setView(selectedView);
    scrollToTop();
    router.push(selectedView.path);
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
    const userReview = findUserReview(updatedShow.reviews.items, user.name);

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
    const updatedShow = await getEpisodesOfLatestSeason(show);

    if (!updatedShow?.dateToEpisodes) { return; }

    addShow(updatedShow);
    buildOrUpdateOverallDateToEpisodes([updatedShow], dateToEpisodes);
    setDateToEpisodes({ ...dateToEpisodes });
  };

  const removeFromSchedule = (showIdx = findSelectedShowIdx()) => {
    const show = shows[showIdx];

    if (!show) { return; }

    removeShowFromSchedule(show, dateToEpisodes);
    updateShowCardGrid(showIdx);
    unselectShow();
  };

  const isShowReviewedByUser = () => findUserReview(selectedShow.reviews?.items, user.name);

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
   * Adds or removes a show from the user's watchlist.
   *
   * @param {boolean} isRemoval - whether or not this is a watchlist removal
   * @param {string} showId - the id of the show being added/removed from watchlist
   */
  const changeWatchlist = (isRemoval, showId) => {
    if (isRemoval) {
      removeFromWatchlist(showId);
    } else {
      addToWatchlist();
    }
  };

  /**
   * Adds or removes TV show from schedule when on SCHEDULE view.
   *
   * @param {boolean} isRemoval - whether or not this is a watchlist removal
   * @param {ShowType} showType - the type of the show being added/removed from watchlist
   */
  const maybeUpdateSchedule = (isRemoval, showType) => {
    const isScheduleChange = view === View.SCHEDULE && showType === ShowType.TV && !isShowReviewedByUser();

    if (!isScheduleChange) { return; }

    if (isRemoval) {
      removeFromSchedule();
    } else {
      addToSchedule();
    }
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

    changeWatchlist(isRemoval, showId);
    maybeUpdateSchedule(isRemoval, show.type);
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
   */
   const maybeUpdateTrending = (updatedShow) => {
    if (view === View.HOME) { return; }

    const trendingShowIdx = findTrendingShowIdx(updatedShow);

    if (trendingShowIdx === -1) { return; }

    trending.shows[trendingShowIdx] = updatedShow;
    setTrending({ ...trending });
  };

  /**
   * Updates shows on rating change.
   *
   * @param {Object} show - the show to update
   * @param {boolean} isShowInGrid - whether or not the show is in the card grid
   * @param {number} userRating - the user's rating of the show
   */
  const updateShows = (show, isShowInGrid, userRating) => {
    updateReviewsAndAvgRating(show, userRating, user);
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
   * Removes the provided show from the card grid if not trending,
   * otherwise updates shows in place.
   *
   * @param {number} showIdx - the index of the show
   */
  const updateShowCardGrid = (showIdx) => {
    if (view !== View.WATCHLIST && (view !== View.HOME || showIdx >= trending.shows.length)) {
      shows.splice(showIdx, 1);
    }

    setShows([...shows]);
  };

  /**
   * Converts a previously rated show into an unrated watchlist show.
   *
   * @param {Object} show - the show to convert
   */
  const convertToWatchlist = async (show) => {
    const input = {
      id: show.id,
      source: 'WL',
      rating: 0
    };

    await API.graphql(graphqlOperation(updateShow, { input }));
    resetWatchlistShow(show);
  };

  /**
   * Removes a show.
   *
   * @param {Object} show - the show to remove
   */
  const removeShow = async (show) => {
    if (isTrending(show)) {
      resetTrendingShow(show);
    }

    try {
      await API.graphql(graphqlOperation(deleteShow, { input: { id: show.id } }));
    } catch (err) {
      console.error('Unable to remove show owned by another user. ', err);
      await convertToWatchlist(show);
    }
  };

  /**
   * Removes unrated show if not watchlisted by any user.
   * Updates show to have watchlist source if watchlisted.
   *
   * @param {Object} show - the show to delete or convert to WL
   */
  const removeShowOrConvertToWatchlist = async (show) => {
    const isWatchlisted = await isInAnyUsersWatchlist(show.id);

    if (isWatchlisted) {
      await convertToWatchlist(show);
      resetWatchlistShow(show);
      updateWatchlist(show);
    } else {
      await removeShow(show);
    }
  };

  /**
   * Removes a show that is no longer rated or watchlisted.
   *
   * @param {Object} show - the show to remove
   * @param {number} showIdx - the index of the show
   */
  const removeUntrackedShow = async (show, showIdx) => {
    try {
      await removeShowOrConvertToWatchlist(show);
    } catch (err) {
      console.error(`Failed to remove untracked show "${show.id}": `, err);
      return;
    }

    maybeUpdateTrending(show);
    searchClient.removeShowFromCache(show.tmdbId);

    if (view === View.SCHEDULE) { return; }

    if (showIdx !== null) {
      updateShowCardGrid(showIdx);
    }

    if (selectedShow) {
      unselectShow();
    }
  };

  /**
   * Removes the logged in user's review of a show and the
   * show itself if sole reviewer and not watchlisted.
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

      const { data: { deleteReview: resp } } = await API.graphql(graphqlOperation(deleteReview, { input }));

      if (resp.show.reviews.items.length === 0) {
        removeUntrackedShow(show, showIdx);
      } else {
        updateShows(show, showIdx !== null);
      }

      if (view === View.SCHEDULE && watchlistIdx === -1 && show.type === ShowType.TV) {
        removeFromSchedule(showIdx);
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
      createShowReview(show, currUserRating, !prevUserRating, user.id);
      updateShows(show, isShowInGrid, currUserRating);

      if (view === View.SCHEDULE && !prevUserRating && watchlistIdx === -1 && show.type === ShowType.TV) {
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
    const ratedShow = await fetchRatedShow(show.objectID);

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
      setSelectedShowIdx(trending.shows.length);
      shows.splice(trending.shows.length, 0, show);
      setShows([...shows]);
    } else if (view.includeAdded || view === View.fromShowType(show.type)) {
      setSelectedShowIdx(0);
      setShows([show, ...shows]);
    }
  };

  /**
   * Converts a watchlisted show to a rated show, by updating the source and rating.
   *
   * @param {Object} watchlistedShow - watchlisted show to convert to rated show
   * @param {string} showId - ID of the show to update
   */
  const convertToRatedShow = (watchlistedShow, showId) => {
    API.graphql(graphqlOperation(updateShow, { input: { ...watchlistedShow, id: showId } }))
      .catch((err) => {
        console.error('Failed to convert watchlisted show to rated show. ', err);
      });
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

    await maybeAddShowMetadata(show);

    const isWatchlisted = show.rating === 0 || watchlistIdx !== -1 || await isInAnyUsersWatchlist(show.id);
    const ratedShow = {
      rating,
      source: rating ? 'UR' : 'WL'
    };

    if (rating && isWatchlisted) { // unrated WL item
      convertToRatedShow(ratedShow, show.id);
    } else { // unrated show
      API.graphql(graphqlOperation(createShow, { input: { ...show, ...ratedShow } }))
        .catch((err) => {
          console.error('GraphQL create show failed. ', err);
        });
      searchClient.removeShowFromCache(show.tmdbId);
    }

    if (!rating) { return; } // Unrated show added to WL

    handleRatingChange(show, rating, null, showIdx);

    if (null === showIdx && view !== View.SCHEDULE) {
      addShow(show);
    }
  };

  const unselectShow = () => {
    setSelectedShow(null);
    setSelectedShowIdx(null);
  };

  const selectShow = async (show, showIdx) => {
    if (!show.rating) { // unrated trending show
      await maybeAddShowMetadata(show);
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
    updateUserReviews(shows, user.name, name, color);
    updateUserReviews(watchlist, user.name, name, color);

    setUser({ ...user, name, color });
  };

  const handleSettingsSave = (plexSearchEnabled) => {
    setUser({ ...user, plexSearchEnabled });
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
    const ratedTrendingShows = await Promise.all(unratedTrendingShows.map(maybeFetchRatedTrendingShow));
    const expirationTime = moment()
      .startOf('day')
      .add(1, 'day') // trending updates daily
      .valueOf();

    setNextToken(null);
    setTrending({ shows: ratedTrendingShows, expirationTime });
    setShows(ratedTrendingShows);
  };

  useEffect(() => {
    setTheme(dispatch, authedUser.themePref, true);
    handleDrawerSelection(view, true);
    router.beforePopState(({ as: path }) => {
      handleDrawerSelection(View.fromPath(path));
    });
  }, []);

  useEffect(() => {
    if (!trending) { return; }

    fetchShows();
  }, [trending]);

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
            userReview={findUserReview(selectedShow.reviews?.items, user.name)}
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
          <SettingsModal
            user={user}
            onClose={closeModal}
            onSave={handleSettingsSave}
          />
        )}

        {view === View.SCHEDULE && !loading && dateToEpisodes ? (
          <EpisodeSchedule
            shows={shows}
            dateToEpisodes={dateToEpisodes}
            onShowSelected={selectShow}
          />
        ) : (
          <ShowCardGrid
            shows={shows}
            trendingShowsCount={view === View.HOME && trending ? trending.shows.length : 0}
            userName={user.name}
            onRatingChange={handleRatingChange}
            onShowAdded={createRatedShow}
            onShowSelected={selectShow}
          />
        )}

        <ScrollAwareProgress
          loadingType={loading}
          backdropLeftStyle={drawerOpen ? Width.OPEN_DRAWER + 1 : Width.CLOSED_DRAWER}
          onEndOfPageReached={handleEndOfPageReached}
        />
      </main>
    </div>
  );
};

export default Index;