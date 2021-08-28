import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import API, { graphqlOperation } from '@aws-amplify/api';
import { createReview, updateReview } from '../src/graphql/mutations.js';
import * as graphqlQuery from '../src/graphql/custom-queries';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import ShowCard from './ShowCard';
import ShowDetailsModal from './ShowDetailsModal';
import useOnScreen from './useOnScreen';
import Toolbar from './Toolbar';
import Drawer from './Drawer';

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
  const [view, setView] = useState('home');
  const endOfPageRef = useRef();
  const isEndOfPageVisisble = useOnScreen(endOfPageRef);

  const fetchShows = async (type) => {
    try {
      const queryParams = {
        limit: 100,
        sortDirection: 'DESC',
        [type ? 'type' : 'source']: type ?? 'UR',
        nextToken
      };

      const queryName = type ? 'showsByType' : 'showsByDate';
      const { data } = await API.graphql(graphqlOperation(graphqlQuery[queryName], queryParams));
      const sortedShows = data[queryName].items;

      // Todo: add logic for updating show's avg rating in db when reviews are updated, rather than calculating client-side.
      sortedShows.forEach((show) => {
        show.rating = determineAvgRating(show.reviews.items);
      });
      console.log('sortedShows: ', sortedShows);
      if (type === view || !type && view === 'home') {
        setShows([...shows, ...sortedShows]);
      } else {
        setShows(sortedShows);
      }
      setNextToken(data[queryName].nextToken);
    } catch (err) {
      console.error('Failed to list shows: ', err);
    }
  };

  const handleDrawerSelection = (selectedView) => {
    if (selectedView === 'Home') {
      fetchShows();
    } else if (selectedView === 'Movies') {
      fetchShows('movie');
    } else {
      fetchShows('tv');
    }

    setView(selectedView);
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
      const { data } = await API.graphql(graphqlOperation(graphqlQuery.getShow, { id: show.objectID }));

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
    setSelectedShowIdx(shows.length);
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

  useEffect(async () => {
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
            userRating={findUserReview(selectedShow.reviews?.items)?.rating}
            onRatingChange={handleRatingChange}
            onShowAdded={addShow}
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