import { Box, IconButton, makeStyles } from '@material-ui/core';
import StarIcon from '@material-ui/icons/Star'
import StarHalfIcon from '@material-ui/icons/StarHalf'
import StarOutlineIcon from '@material-ui/icons/StarOutline'
import { useState } from 'react';

const useStyles = makeStyles({
    star: {
        color: 'gold'
    },
    outlinedStar: {
        opacity: 0.55
    }
});

const StarButtons = ({ rating, maxRating }) => {
    const classes = useStyles();
    const [ratingVal, setRatingVal] = useState(rating);

    const buildStars = () => {
        const wholeStarsCount = Math.floor(ratingVal);
        const stars = [];

        for (let i = 0; i < wholeStarsCount; i++) {
            stars.push(StarIcon);
        }

        if ((ratingVal % 1) >= .25) {
            stars.push(StarHalfIcon);
        }

        for (let i = stars.length; i < maxRating; i++) {
            stars.push(StarOutlineIcon);
        }

        return stars;
    }

    return (
        <Box display="flex" flexDirection="row" onMouseLeave={() => setRatingVal(rating)}>
            {buildStars().map((Star, i) => (
                <IconButton key={i} size="small" onMouseEnter={() => setRatingVal(i + 1)}>
                    <Star className={Star === StarOutlineIcon ? classes.outlinedStar : classes.star} />
                </IconButton>
            ))}
        </Box>
    );
};

export default StarButtons;