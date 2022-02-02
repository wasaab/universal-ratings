import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import ShowCard from './ShowCard';
import util from '../src/util';

const useStyles = makeStyles({
  reducedGrow: {
    flexGrow: 0.2,
    flexBasis: 'unset'
  },
  sectionHeader: {
    margin: '70px 0px 10px 0px',
    fontWeight: 500,
    '&:first-of-type': {
      marginTop: 0
    }
  }
});

const ShowCardGrid = ({ shows, trendingShowsCount, userName, onRatingChange, onShowAdded, onShowSelected }) => {
  const classes = useStyles();

  const renderShowCard = (show, showIdx) => (
    <Grid key={showIdx} item xs className={clsx({ [classes.reducedGrow]: shows.length === 2 })}>
      <ShowCard
        show={show}
        userRating={util.findUserReview(show.reviews?.items, userName)?.rating}
        onClick={() => onShowSelected(show, showIdx)}
        onRatingChange={(currUserRating, prevUserRating) => {
          if (show.rating) { // rated show
            onRatingChange(show, currUserRating, prevUserRating, showIdx);
          } else { // unrated trending show
            onShowAdded(show, currUserRating, showIdx);
          }
        }}
      />
    </Grid>
  );

  return (
    <>
      {trendingShowsCount !== 0 && (
        <>
          <Typography variant="h5" className={classes.sectionHeader}>Trending</Typography>
          <Grid container spacing={3} wrap="wrap">
            {shows.slice(0, trendingShowsCount).map(renderShowCard)}
          </Grid>
          <Typography variant="h5" className={classes.sectionHeader}>Recently Rated</Typography>
        </>
      )}

      <Grid container spacing={3} wrap="wrap">
        {
          shows.slice(trendingShowsCount)
            .map((show, i) => renderShowCard(show, trendingShowsCount + i))
        }
      </Grid>
    </>
  );
};

export default ShowCardGrid;