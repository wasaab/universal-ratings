import { useState } from 'react';
import clsx from 'clsx';
import {
  alpha,
  Badge,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  Grid,
  IconButton,
  Link,
  makeStyles,
  Tooltip,
  Typography,
  useMediaQuery
} from '@material-ui/core';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteOutlineIcon,
  Today as ScheduleIcon,
  WatchLater as WatchLaterIcon,
  WatchLaterOutlined as WatchLaterOutlineIcon,
} from '@material-ui/icons/';
import { AvatarGroup } from '@material-ui/lab';
import Image from 'next/image';
import API, { graphqlOperation } from '@aws-amplify/api';
import { updateReview } from '../src/graphql/mutations';
import UserAvatar from './UserAvatar';
import StarButtons from './StarButtons';
import LabelledIcon from './LabelledIcon';
import { ShowType, Width } from '../src/model';
import JustWatchIcon from '../resources/images/justWatch.svg';
import ImdbIcon from '../resources/images/imdb.svg';
import RtFreshIcon from '../resources/images/rt.svg';
import RtRottenIcon from '../resources/images/rt-rotten.svg';
import PlexIcon from '../resources/images/plex.svg';
import { renderProviderLogo } from '../resources/data/providers';

const avatarSize = 33;

function buildBackdropUrl(width) {
  return ({ backgroundImg: img }) => `url(${width ? img?.replace(Width.BACKDROP_LARGE, width) : img})`;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    '& .MuiPaper-root': {
      backgroundColor: 'rgba(0, 0, 0, 0.06)',
    }
  },
  backdrop: {
    '&:before': {
      content: '""',
      [theme.breakpoints.down(Width.BACKDROP_SMALL + 1)]: {
        backgroundImage: buildBackdropUrl(Width.BACKDROP_SMALL),
      },
      [theme.breakpoints.up(Width.BACKDROP_SMALL + 1)]: {
        backgroundImage: buildBackdropUrl(Width.BACKDROP_MEDIUM),
      },
      [theme.breakpoints.up(Width.BACKDROP_MEDIUM + 1)]: {
        backgroundImage: buildBackdropUrl(),
      },
      backgroundSize: 'cover',
      position: 'absolute',
      inset: 0,
      opacity: 0.7,
    }
  },
  year: {
    paddingLeft: 3
  },
  badge: {
    userSelect: 'none',
    border: '2px solid transparent'
  },
  avatarGroup: {
    '& > .MuiAvatar-root': {
      width: avatarSize,
      height: avatarSize,
      marginTop: 2,
      marginLeft: -4,
      fontSize: 14,
      color: theme.palette.text.primary
    }
  },
  content: {
    padding: '20px 24px'
  },
  showDesc: {
    marginTop: 12,
    maxHeight: 150,
    overflowY: 'auto'
  },
  streamingSitesContainer: {
    alignItems: 'center',
    marginTop: 0,
    maxWidth: 328
  },
  streamingSitesLabel: {
    fontSize: '0.9rem',
    lineHeight: '1em',
    whiteSpace: 'nowrap'
  },
  streamingSitesLabelContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  toggleButtonsContainer: {
    display: 'flex',
    justifyContent: 'space-evenly'
  },
  providerLogosContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  singleProvider: {
    justifyContent: 'center'
  },
  rateButton: {
    border: '1px solid rgb(255, 180, 0)',
    color: '#ffb400',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
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
  thirdPartyRatingsContainer: {
    maxWidth: '78%',
    [theme.breakpoints.up(565)]: {
      '& :nth-child(2)': {
        justifyContent: 'flex-end'
      }
    }
  },
  scheduleButton: {
    position: 'absolute',
    top: 10,
    right: 12,
    padding: 8,
    fontSize: 22
  },
  plexLink: {
    lineHeight: 0,
    '&:hover': {
      color: alpha(theme.palette.text.primary, 0.6)
    }
  },
  title: {
    WebkitLineClamp: 4,
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    overflowY: 'hidden',
    [theme.breakpoints.down(550)]: {
      WebkitLineClamp: 3,
      fontSize: '1.5rem',
      fontWeight: 500
    }
  }
}));

const plexSearchBaseUrl = 'https://app.plex.tv/desktop/#!/search?query=';

const ShowDetailsModal = ({
  show,
  user,
  userReview,
  isInWatchlist,
  onWatchlistChange,
  onFavoriteChange,
  onRatingChange,
  onShowAdded,
  onScheduleOpen,
  onClose
}) => {
  const classes = useStyles(show);
  const isMobile = useMediaQuery('(max-width:390px)');
  const [currUserRating, setCurrUserRating] = useState(userReview?.rating);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const TypeIcon = ShowType.toTwoToneIcon(show.type);

  const toggleTooltip = () => {
    if (show.rating || currUserRating) { return; }

    setIsTooltipOpen(!isTooltipOpen);
  };

  const isDeletion = (updatedUserRating) => updatedUserRating === currUserRating;

  const rateShow = (updatedUserRating) => {
    setCurrUserRating(isDeletion(updatedUserRating) ? null : updatedUserRating);

    if (show.rating) {
      onRatingChange(show, updatedUserRating, userReview?.rating);
    }
  };

  const toggleFavorite = async () => {
    try {
      const updatedReview = {
        showId: show.id,
        userId: user.id,
        isFavorite: !userReview.isFavorite
      };

      await API.graphql(graphqlOperation(updateReview, { input: updatedReview }));
      onFavoriteChange(updatedReview.isFavorite);
    } catch (err) {
      console.error('GraphQL toggle favorite failed. ', err);
    }
  };

  const getImgContainerXs = () => (show.img ? 5 : 3);

  return (
    <Dialog
      open={show !== null}
      onClose={onClose}
      className={classes.root}
      aria-label={show.title}
      BackdropProps= {{
        classes: {
          root: clsx({ [classes.backdrop]: show.backgroundImg })
        }
      }}
    >
      <DialogContent className={classes.content}>
        <Grid container spacing={2} direction="row">
          <Grid
            item
            container
            xs={isMobile ? true : getImgContainerXs()}
            direction="column"
            justifyContent="center"
          >
            {show.img && !isMobile && (
              <Image
                src={show.img}
                alt={show.title}
                width={233.33}
                height={350}
                unoptimized
              />
            )}
            <Box className={classes.toggleButtonsContainer} pt="10px">
              <IconButton disabled={!userReview} onClick={toggleFavorite}>
                {userReview?.isFavorite ? <FavoriteIcon /> : <FavoriteOutlineIcon />}
              </IconButton>
              <IconButton onClick={() => onWatchlistChange(isInWatchlist)}>
                {isInWatchlist ? <WatchLaterIcon /> : <WatchLaterOutlineIcon />}
              </IconButton>
            </Box>
          </Grid>

          <Grid item container xs direction="column" justifyContent="space-between" wrap="nowrap">
            <Grid item xs>
              <Box display="flex" alignItems="center" gridGap={4}>
                <TypeIcon fontSize="small" />
                <Typography variant="subtitle2" className={classes.year}>
                  {show.releaseDate.slice(0, 4)}
                </Typography>
              </Box>
              <Typography variant="h4" gutterBottom className={classes.title}>
                {show.title}
              </Typography>
              {show.type === ShowType.TV && (
                <IconButton className={classes.scheduleButton} onClick={onScheduleOpen}>
                  <ScheduleIcon fontSize="inherit" />
                </IconButton>
              )}
            </Grid>

            <Grid item container xs spacing={2} direction="row">
              <Grid item style={{ paddingRight: 40 }}>
                <StarButtons
                  className={clsx(classes.ratingStars, { [classes.ratingRequiredTip]: isTooltipOpen })}
                  avgRating={show.rating}
                  userRating={currUserRating}
                  maxRating={4}
                  onClick={rateShow}
                />
              </Grid>
              <Grid item xs style={{ paddingRight: 0 }}>
                {show.rating ? (
                  <AvatarGroup max={4} className={classes.avatarGroup}>
                    {show.reviews.items.sort((a, b) => b.rating - a.rating).map(({ user: { name, color }, rating }, i) => (
                      <Badge key={i} color="secondary" badgeContent={rating} className={classes.badge}>
                        <UserAvatar name={name} backgroundColor={color} size={avatarSize} tooltip />
                      </Badge>
                    ))}
                  </AvatarGroup>
                ) : (
                  <span onMouseEnter={toggleTooltip} onMouseLeave={toggleTooltip}>
                    <Button
                      className={classes.rateButton}
                      variant="outlined"
                      disabled={!currUserRating}
                      onClick={() => onShowAdded(show, currUserRating)}
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
              xs
              spacing={1}
              className={classes.thirdPartyRatingsContainer}
              direction="row"
            >
              {show.imdbRating !== null && (
                <LabelledIcon Icon={ImdbIcon} label={`${show.imdbRating}/10`} />
              )}
              {show.rtRating !== null && (
                <LabelledIcon Icon={show.rtRating >= 60 ? RtFreshIcon : RtRottenIcon} label={`${show.rtRating}%`} />
              )}
            </Grid>

            <Grid
              item
              container
              xs
              spacing={3}
              className={classes.streamingSitesContainer}
              direction="row"
            >
              {(show.providerIds?.length > 0 || user.plexSearchEnabled) && (
                <>
                  <Grid item xs className={classes.streamingSitesLabelContainer} title="Powered by JustWatch">
                    <JustWatchIcon />
                    <Typography variant="overline" className={classes.streamingSitesLabel}>
                      Available on
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs
                    className={clsx(
                      classes.providerLogosContainer,
                      { [classes.singleProvider]: show.providerIds.length === Number(!user.plexSearchEnabled) }
                    )}
                  >
                    {show.providerIds.map(renderProviderLogo)}

                    {user.plexSearchEnabled && (
                      <Tooltip title="Search your available Plex libraries">
                        <Link
                          className={classes.plexLink}
                          href={`${plexSearchBaseUrl}${show.title}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <PlexIcon />
                        </Link>
                      </Tooltip>
                    )}
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ShowDetailsModal;