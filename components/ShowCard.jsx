import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Typography,
} from '@material-ui/core';
import StarButtons from './StarButtons';
import Image from 'next/image';

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
    minWidth: 200
  },
  media: {
    height: 200,
    position: 'relative'
  },
  actions: {
    justifyContent: 'center'
  },
  content: {
    height: 84,
    paddingBottom: 4,
    display: '-webkit-box',
    overflow: 'hidden',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical'
  }
});

const ShowCard = ({ show, userRating, onRatingChange, onClick }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardActionArea onClick={onClick}>
        <div className={classes.media}>
          {show.img && (
            <Image
              src={show.img}
              alt={show.title}
              layout="fill"
              objectFit="cover"
              objectPosition="top"
              unoptimized
            />
          )}
        </div>
        <CardContent className={classes.content}>
          <Typography variant="h6" component="h6">
            {show.title}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions className={classes.actions}>
        <StarButtons
          avgRating={show.rating}
          userRating={userRating}
          maxRating={5}
          onClick={onRatingChange}
        />
      </CardActions>
    </Card>
  );
};

export default ShowCard;