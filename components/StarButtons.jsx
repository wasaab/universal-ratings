import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Box, IconButton, makeStyles } from '@material-ui/core';
import {
  Star as StarIcon,
  StarOutline as StarOutlineIcon,
  StarHalf as StarHalfIcon,
  Remove as RemoveIcon
} from '@material-ui/icons';

const useStyles = makeStyles({
  star: {
    color: 'rgb(255, 180, 0)'
  },
  outlinedStar: {
    opacity: 0.55
  },
  button: {
    transition: 'background 350ms ease-out',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0)'
    },
    '& .MuiSvgIcon-root': {
      pointerEvents: 'none'
    }
  },
  userRating: {
    backgroundColor: 'rgba(255, 255, 255, 0.13) !important'
  },
  removeRatingIcon: {
    transform: 'scaleY(1.2)'
  }
});

const StarButtons = ({ avgRating, userRating, maxRating, onClick, className }) => {
  const classes = useStyles();
  const [displayedRating, setDisplayedRating] = useState(avgRating ?? userRating);
  const [newlyRated, setNewlyRated] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (avgRating === displayedRating) { return; }

    setDisplayedRating(avgRating);
  }, [avgRating]);

  const buildStars = () => {
    const wholeStarsCount = Math.floor(displayedRating);
    const stars = [];

    for (let i = 0; i < wholeStarsCount; i++) {
      stars.push(StarIcon);
    }

    if ((displayedRating % 1) >= 0.25) {
      stars.push(StarHalfIcon);
    }

    for (let i = stars.length; i < maxRating; i++) {
      stars.push(StarOutlineIcon);
    }

    return stars;
  };

  const handleRatingClick = (rating) => {
    onClick(rating, userRating);

    if (rating === userRating) { return; }

    setNewlyRated(true);
  };

  const handleMouseEnter = (rating) => {
    setDisplayedRating(rating);
    setNewlyRated(false);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setDisplayedRating(avgRating ?? userRating);
    setNewlyRated(false);
    setHovered(false);
  };

  return (
    <Box className={className} display="flex" flexDirection="row" onMouseLeave={handleMouseLeave}>
      {buildStars().map((Star, i) => {
        const rating = i + 1;
        const isHoveredOnUserRating = hovered && userRating === rating && displayedRating === rating;

        return (
          <IconButton
            key={i}
            size="small"
            className={clsx(classes.button, { [classes.userRating]: rating === userRating })}
            onMouseEnter={() => handleMouseEnter(rating)}
            onClick={() => handleRatingClick(rating)}
          >
            {isHoveredOnUserRating && !newlyRated && avgRating ? (
              <RemoveIcon className={classes.removeRatingIcon} />
            ) : (
              <Star className={Star === StarOutlineIcon ? classes.outlinedStar : classes.star} />
            )}
          </IconButton>
        );
      })}
    </Box>
  );
};

export default StarButtons;