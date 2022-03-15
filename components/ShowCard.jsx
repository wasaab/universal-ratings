import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Typography,
} from '@material-ui/core';
import Image from 'next/image';
import StarButtons from './StarButtons';
import { ShowType } from '../src/model';

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
    lineClamp: 2,
    boxOrient: 'vertical',
    position: 'relative'
  },
  showTypeIcon: {
    position: 'absolute',
    right: 5,
    top: 3,
    fontSize: 18,
    opacity: 0.8
  }
});

const ShowCard = ({ show, userRating, onRatingChange, onClick }) => {
  const classes = useStyles();
  const TypeIcon = ShowType.toTwoToneIcon(show.type);

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
            />
          )}
        </div>
        <CardContent className={classes.content}>
          <TypeIcon className={classes.showTypeIcon} />
          <Typography variant="h6" component="h6">
            {show.title}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions className={classes.actions}>
        <StarButtons
          avgRating={show.rating}
          userRating={userRating}
          maxRating={4}
          onClick={onRatingChange}
        />
      </CardActions>
    </Card>
  );
};

export default ShowCard;