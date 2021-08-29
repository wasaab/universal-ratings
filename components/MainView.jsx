import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import API, { graphqlOperation } from '@aws-amplify/api';
import {
  createReview,
  createWatchlistItem,
  deleteWatchlistItem,
  updateReview
} from '../src/graphql/mutations.js';
import * as gqlQuery from '../src/graphql/custom-queries';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import ShowCard from './ShowCard';
import ShowDetailsModal from './ShowDetailsModal';
import useOnScreen from './useOnScreen';
import Toolbar from './Toolbar';
import Drawer from './Drawer';
import View from '../src/model/View';

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

function determineAvgRating(reviews) {
  return reviews.reduce((sum, { rating }) => sum + rating, 0) / reviews.length;
}

const MainView = ({ user }) => {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState();
  const [selectedShowIdx, setSelectedShowIdx] = useState();
  const [shows, setShows] = useState([]);
  const [nextToken, setNextToken] = useState();
  const [view, setView] = useState(View.HOME);
  const [watchlist, setWatchlist] = useState(user.watchlist.items.map(({ show }) => show));
  const endOfPageRef = useRef();
  const isEndOfPageVisisble = useOnScreen(endOfPageRef);

  const buildQueryParams = (targetView) => {
    const queryParams = {
      ...targetView.query.params,
      limit: 100,
      sortDirection: 'DESC',
      nextToken
    };

    if (targetView.query.name === View.FAVORITES.query.name) {
      queryParams.userId = user.id;
    }

    return queryParams;
  }

  const fetchShows = async (targetView = view) => {
    try {
      const queryName = targetView.query.name;
      const { data } = await API.graphql(graphqlOperation(gqlQuery[queryName], buildQueryParams(targetView)));
      let updatedShows = data[queryName].items;

      if (targetView.query.name === View.FAVORITES.query.name) {
        updatedShows = updatedShows.map(({ show }) => show);
      } else {
        // Todo: add logic for updating show's avg rating in db when reviews are updated, rather than calculating client-side.
        updatedShows.forEach((show) => {
          show.rating = determineAvgRating(show.reviews.items);
        });
      }

      console.log('shows: ', updatedShows);

      if (targetView === view) {
        setShows([...shows, ...updatedShows]);
      } else {
        setShows(updatedShows);
      }

      setNextToken(data[queryName].nextToken);
    } catch (err) {
      console.error('Failed to list shows: ', err);
    }
  };

  const handleDrawerSelection = (selectedView) => {
    if (selectedView === View.WATCHLIST) {
      setShows(watchlist);
    } else {
      fetchShows(selectedView);
    }

    setView(selectedView);
  };

  const handleFavoriteChange = (updatedVal) => {
    const updatedShows = [...shows];
    const targetShow = updatedShows[selectedShowIdx];

    findUserReview(targetShow.reviews.items).isFavorite = updatedVal;
    setShows(updatedShows);
    setSelectedShow(targetShow);
  };

  const removeFromWatchlist = () => {
    const updatedWatchlist = watchlist.filter(({ id }) => id !== selectedShow.id);

    setWatchlist(updatedWatchlist);

    if (view !== View.WATCHLIST) { return; }

    setShows(updatedWatchlist);
    unselectShow();
  };

  const handleWatchlistChange = async (isRemoval) => {
    const watchlistItem = {
      userId: user.id,
      showId: selectedShow.id
    };
    const operation = isRemoval ? deleteWatchlistItem : createWatchlistItem;

    try {
      await API.graphql(graphqlOperation(operation, { input: watchlistItem }));
    } catch (err) {
      console.error('GraphQL toggle watchlist failed. ', err);
      return;
    }

    if (isRemoval) {
      removeFromWatchlist();
    } else {
      setWatchlist([...watchlist, selectedShow]);
    }
  };

  const updateReviews = (reviews, review) => {
    const oldReview = reviews.find((review) => review.user.name === user.name);

    if (oldReview) {
      oldReview.rating = review.rating;
    } else {
      reviews.push(review);
    }
  };

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

  const updateReviewsAndAvgRating = (show, review) => {
    if (!show.reviews) { return; }

    const reviews = show.reviews.items;

    updateReviews(reviews, review);

    const avgRating = determineAvgRating(reviews);

    show.rating = avgRating;
  };

  // Todo: Refactor. logic currently covers all cases, but readability could be improved.
  const handleRatingChange = async (show, updatedUserRating, isUnrated, showIdx = selectedShowIdx) => {
    await createShowReview(show, updatedUserRating, isUnrated);

    const review = { user, rating: updatedUserRating }

    if (showIdx == null) {
      showIdx = shows.findIndex(({ id }) => id === selectedShow.id);

      if (showIdx === -1) {
        updateReviewsAndAvgRating(show, review)
        return;
      }

      setSelectedShowIdx(showIdx);
    }

    const updatedShows = [...shows];
    const updatedShow = updatedShows[showIdx];

    updateReviewsAndAvgRating(updatedShow, review);
    setShows(updatedShows);

    if (!selectedShow) { return; }

    setSelectedShow(updatedShow);
  };

  const selectRatedShow = async (show) => {
    try {
      const { data } = await API.graphql(graphqlOperation(gqlQuery.getShow, { id: show.objectID }));

      setSelectedShow(data.getShow);
    } catch (err) {
      console.error(`Failed to get rated show "${show.objectID}": `, err);
    }
  };

  const selectUnratedShow = async (show) => {
    try {
      const { data } = await axios.get(`/api/search?id=${show.id}`);

      setSelectedShow(data);
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
    setSelectedShowIdx(0);
    setSelectedShow(show);
    setShows([show, ...shows]);
  };

  const unselectShow = () => {
    setSelectedShow(null);
    setSelectedShowIdx(null);
  };

  const selectShow = (show, showIdx) => {
    setSelectedShow(show);
    setSelectedShowIdx(showIdx);
  };

  const findUserReview = (reviews) => reviews?.find((review) => review.user.name === user.name);

  useEffect(fetchShows, []);

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
            isInWatchlist={watchlist.findIndex(({ id }) => id === selectedShow.id) !== -1}
            onRatingChange={handleRatingChange}
            onShowAdded={addShow}
            onFavoriteChange={handleFavoriteChange}
            onWatchlistChange={handleWatchlistChange}
            onClose={unselectShow}
          />
        )}

        <Grid container spacing={3} wrap="wrap">
          {shows.map((show, i) => (
            <Grid key={i} item xs>
              <ShowCard
                show={show}
                userRating={findUserReview(show.reviews?.items)?.rating}
                onRatingChange={(rating) => handleRatingChange(show, rating, false, i)}
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