import { useState } from 'react';
import clsx from 'clsx';
import { Box, IconButton, makeStyles } from '@material-ui/core';
import {
  Star as StarIcon,
  StarOutline as StarOutlineIcon,
  StarHalf as StarHalfIcon
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
    }
  },
  userRating: {
    transition: 'background 0s 150ms',
    backgroundColor: 'rgba(255, 255, 255, 0.13) !important'
  }
});

const StarButtons = ({ avgRating, userRating, maxRating, onClick, className }) => {
  const classes = useStyles();
  const [displayedRating, setDisplayedRating] = useState(avgRating);
  const [currUserRating, setCurrUserRating] = useState(userRating);

  const buildStars = () => {
    const wholeStarsCount = Math.floor(displayedRating);
    const stars = [];

    for (let i = 0; i < wholeStarsCount; i++) {
      stars.push(StarIcon);
    }

    if ((displayedRating % 1) >= .25) {
      stars.push(StarHalfIcon);
    }

    for (let i = stars.length; i < maxRating; i++) {
      stars.push(StarOutlineIcon);
    }

    return stars;
  }

  return (
    <Box className={className} display="flex" flexDirection="row" onMouseLeave={() => setDisplayedRating(avgRating)}>
      {buildStars().map((Star, i) => (
        <IconButton
          key={i}
          size="small"
          className={clsx(classes.button, { [classes.userRating]: i + 1 === currUserRating })}
          onMouseEnter={() => setDisplayedRating(i + 1)}
          onClick={() => {
            setCurrUserRating(i + 1);
            onClick(i + 1);
          }}
        >
          <Star className={Star === StarOutlineIcon ? classes.outlinedStar : classes.star} />
        </IconButton>
      ))}
    </Box>
  );
};

export default StarButtons;