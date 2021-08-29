import { useState } from 'react';
import clsx from 'clsx';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  Grid,
  IconButton,
  makeStyles,
  Typography
} from '@material-ui/core';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteOutlineIcon,
  WatchLater as WatchLaterIcon,
  WatchLaterOutlined as WatchLaterOutlineIcon,
} from '@material-ui/icons/';
import { AvatarGroup } from '@material-ui/lab';
import * as matColors from '@material-ui/core/colors';
import Image from 'next/image';
import API, { graphqlOperation } from '@aws-amplify/api';
import { updateReview } from '../src/graphql/mutations';
import { createShow } from '../src/graphql/custom-mutations';
import StarButtons from './StarButtons';
import LabelledIcon from './LabelledIcon';
import HuluIcon from '../resources/hulu.svg';
import NetflixIcon from '../resources/netflix.svg';
import ImdbIcon from '../resources/imdb.svg';
import RtFreshIcon from '../resources/rt.svg';
import RtRottenIcon from '../resources/rt-rotten.svg';

// -------------------- User Review Color Mocking --------------------
const colors = Object.values(matColors)
  .slice(1)
  .map(( color ) => color['300']);

function getRandColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandColors(count = 0) {
  return [...new Array(count)].map(getRandColor);
}
// -------------------------------------------------------------------

const avatarSize = 33;
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column'
  },
  year: {
    paddingLeft: 3,
  },
  badge: {
    border: '2px solid transparent'
  },
  avatarGroup: {
    '& > .MuiAvatar-root': {
      width: avatarSize,
      height: avatarSize,
      marginTop: 2,
      marginLeft: -4,
      fontSize: 14,
      color: theme.palette.text.primary,
    }
  },
  avatar: {
    width: avatarSize,
    height: avatarSize,
    color: theme.palette.text.primary,
  },
  content: {
    padding: '20px 24px',
  },
  showDesc: {
    marginTop: 12
  },
  streamingSitesContainer: {
    alignItems: 'center',
    marginTop: 0
  },
  streamingSitesLabel: {
    fontSize: '0.9rem',
    whiteSpace: 'nowrap'
  },
  evenlySpaced: {
    display: 'flex',
    justifyContent: 'space-evenly'
  },
  rateButton: {
    border: '1px solid rgb(255, 180, 0)',
    color: '#ffb400',
    '&:hover': {
      backgroundColor: 'rgba(255, 180, 0, 0.08)'
    }
  },
  ratingStars: {
    position: 'relative',
    border: '1px solid transparent',
    transition: 'all 0.1s ease-in',
    '&:after': {
      opacity: 0,
      content: '"* RATING REQUIRED"',
      color: theme.palette.error.main,
      position: 'absolute',
      top: 33,
      fontSize: 11,
      fontWeight: 'bold',
      transition: 'opacity 0.1s ease-in'
    }
  },
  ratingRequiredTip: {
    border: `1px solid ${theme.palette.error.main}`,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    '&:after': {
      opacity: 1,
    }
  },
  showDetailsContainer: {
    justifyContent: 'space-between',
    display: 'flex'
  },
  thirdPartyRatingsContainer: {
    [theme.breakpoints.up(565)]: {
      '& :nth-child(2)': {
        justifyContent: 'flex-end'
      }
    }
  }
}));

const ShowDetailsModal = ({ show, userId, userReview, onRatingChange, onShowAdded, onFavoriteChange, onWatchlistChange, isInWatchlist, onClose }) => {
  const classes = useStyles();
  const [currUserRating, setCurrUserRating] = useState(userReview?.rating);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [avatarColors] = useState(getRandColors(3));

  const toggleTooltip = () => {
    if (show.rating || currUserRating) { return; }

    setIsTooltipOpen(!isTooltipOpen);
  };

  const createRatedShow = async () => {
    const ratedShow = {
      ...show,
      rating: currUserRating,
      source: 'UR'
    };

    await onRatingChange(ratedShow, currUserRating, true);

    try {
      const createShowResp = await API.graphql(graphqlOperation(createShow, { input: ratedShow }));

      onShowAdded(createShowResp.data.createShow);
    } catch (err) {
      console.error('GraphQL create show failed. ', err);
    }
  };

  const rateShow = async (updatedUserRating) => {
    setCurrUserRating(updatedUserRating);

    if (show.rating) {
      onRatingChange(show, updatedUserRating, !userReview?.rating);
    }
  };

  const toggleFavorite = async () => {
    try {
      const updatedReview = {
        showId: show.id,
        userId,
        isFavorite: !userReview.isFavorite
      };

      await API.graphql(graphqlOperation(updateReview, { input: updatedReview }));
      onFavoriteChange(updatedReview.isFavorite);
    } catch (err) {
      console.error('GraphQL toggle favorite failed. ', err);
    }
  };

  return (
    <Dialog open={show != null} onClose={onClose} className={classes.root}>
      <DialogContent className={classes.content}>
        <Grid container spacing={2} direction="row">
          <Grid item container xs={5} direction="column" justifyContent="space-between">
            {/* Todo: Placeholder image when none found or change styling to work with no image */}
            {show.img && (
              <Image
                src={show.img}
                alt={show.title}
                width={233.33}
                height={350}
                unoptimized
              />
            )}
            <Box className={classes.evenlySpaced} pt="10px">
              <IconButton disabled={!userReview} onClick={toggleFavorite}>
                {userReview?.isFavorite ? <FavoriteIcon /> : <FavoriteOutlineIcon />}
              </IconButton>
              <IconButton disabled={!show.rating} onClick={() => onWatchlistChange(isInWatchlist)}>
                {isInWatchlist ? <WatchLaterIcon /> : <WatchLaterOutlineIcon />}
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={7} direction="column" className={classes.showDetailsContainer}>
            <Grid item xs>
              <Typography variant="subtitle2" className={classes.year}>
                {show.releaseDate.slice(0, 4)}
              </Typography>
              <Typography variant="h4" gutterBottom>
                {show.title}
              </Typography>
            </Grid>

            <Grid item container xs={12} spacing={2} direction="row">
              <Grid item xs style={{ paddingRight: 22 }}>
                <StarButtons
                  className={clsx(classes.ratingStars, { [classes.ratingRequiredTip]: isTooltipOpen })}
                  avgRating={show.rating ?? currUserRating}
                  userRating={currUserRating}
                  maxRating={5}
                  onClick={rateShow}
                />
              </Grid>
              <Grid item xs style={{ paddingRight: 0 }}>
                {show.rating ? (
                  <AvatarGroup max={4} className={classes.avatarGroup}>
                    {show.reviews.items.sort((a, b) => b.rating - a.rating).map(({ user: { name }, rating }, i) => (
                      <Badge key={i} color="secondary" badgeContent={rating} className={classes.badge}>
                        <Avatar className={classes.avatar} style={{ backgroundColor: avatarColors[i] }}>
                          {name[0].toUpperCase()}
                        </Avatar>
                      </Badge>
                    ))}
                  </AvatarGroup>
                ) : (
                  <span onMouseEnter={toggleTooltip} onMouseLeave={toggleTooltip}>
                    <Button
                      className={classes.rateButton}
                      variant="outlined"
                      disabled={!currUserRating}
                      onClick={createRatedShow}
                    >
                      Rate
                    </Button>
                  </span>
                )}
              </Grid>
            </Grid>

            {show.description && (
              <DialogContentText className={classes.showDesc}>
                {show.description}
              </DialogContentText>
            )}

            <Grid
              item
              container
              xs={9}
              spacing={1}
              className={classes.thirdPartyRatingsContainer}
              direction="row"
            >
              {show.imdbRating && <LabelledIcon Icon={ImdbIcon} label={`${show.imdbRating}/10`} />}
              {show.rtRating && <LabelledIcon Icon={show.rtRating >= 60 ? RtFreshIcon : RtRottenIcon} label={`${show.rtRating}%`} />}
            </Grid>

            <Grid
              item
              container
              xs={11}
              spacing={3}
              className={classes.streamingSitesContainer}
              direction="row"
            >
              <Grid item xs>
                <Typography variant="overline" className={classes.streamingSitesLabel}>
                  Available on
                </Typography>
              </Grid>
              <Grid item xs className={classes.evenlySpaced}>
                <HuluIcon height="17" />
                <NetflixIcon height="17" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ShowDetailsModal;