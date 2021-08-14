import {
  Avatar,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  Grid,
  makeStyles,
  Typography
} from '@material-ui/core';
import { AvatarGroup } from '@material-ui/lab';
import * as matColors from '@material-ui/core/colors';
import Image from 'next/image';
import StarButtons from './StarButtons';
import LabelledIcon from './LabelledIcon';
import HuluIcon from '../resources/hulu.svg';
import NetflixIcon from '../resources/netflix.svg';
import ImdbIcon from '../resources/imdb.svg';
import RottenTomatoesIcon from '../resources/rt.svg';
import { useState } from 'react';
import clsx from 'clsx';

// -------------------- User Review Mocks --------------------
const mockReviews = [
  {
    name: 'Tony',
    rating: 4
  },
  {
    name: 'Brian',
    rating: 4
  },
  {
    name: 'Dan',
    rating: 3
  },
  {
    name: 'Olivia',
    rating: 2
  },
  {
    name: 'Kent',
    rating: 1
  }
];

const colors = Object.values(matColors)
  .slice(1)
  .map(( color ) => color['300']);

function getRandColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

// -----------------------------------------------------------

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
    fontSize: '0.9rem'
  },
  streamingSites: {
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
  }
}));

const ShowDetailsModal = ({ show, onClose }) => {
  const classes = useStyles();
  const [userRating, setUserRating] = useState(show.rating);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const toggleTooltip = () => {
    if (show.rating || userRating) { return; }

    setIsTooltipOpen(!isTooltipOpen);
  };

  return (
    <Dialog open={show != null} onClose={onClose} className={classes.root}>
      <DialogContent className={classes.content}>
        <Grid container spacing={2} direction="row">
          <Grid item xs={5}>
            <Image src={show.img} alt={show.title} width={233.33} height={350} />
          </Grid>

          <Grid item xs={7} direction="column" className={classes.showDetailsContainer}>
            <Grid item xs>
              <Typography variant="subtitle2" className={classes.year}>
                {show.year}
              </Typography>
              <Typography variant="h4" gutterBottom>
                {show.title}
              </Typography>
            </Grid>

            <Grid item container xs={12} spacing={2} direction="row">
              <Grid item xs style={{ paddingRight: 22 }}>
                <StarButtons
                  className={clsx(classes.ratingStars, { [classes.ratingRequiredTip]: isTooltipOpen })}
                  avgRating={show.rating ?? userRating}
                  userRating={userRating}
                  maxRating={5}
                  onClick={setUserRating}
                />
              </Grid>
              <Grid item xs style={{ paddingRight: 0 }}>
                {show.rating ? (
                  <AvatarGroup max={4} className={classes.avatarGroup}>
                    {mockReviews.map(({ name, rating }, i) => (
                      <Badge key={i} color="secondary" badgeContent={rating} className={classes.badge}>
                        <Avatar className={classes.avatar} style={{ backgroundColor: getRandColor() }}>
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
                      disabled={!userRating}
                      onClick={() => {
                        // Todo: call /create api endpoint and close modal. maybe show a success toast.
                      }}
                    >
                      Rate
                    </Button>
                  </span>
                )}
              </Grid>
            </Grid>

            <DialogContentText className={classes.showDesc}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec quis nunc accumsan,
              rhoncus nisi commodo, facilisis erat. Pellentesque a velit nisl. Nunc rhoncus augue at ex...
            </DialogContentText>

            <Grid item container xs={9} spacing={1} direction="row">
              {show.imdbRating && <LabelledIcon Icon={ImdbIcon} label={show.imdbRating} />}
              {show.rtRating && <LabelledIcon Icon={RottenTomatoesIcon} label={show.rtRating ?? 78} />}
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
              <Grid item xs className={classes.streamingSites}>
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