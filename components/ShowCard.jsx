import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Typography,
} from '@material-ui/core';
import { PlayCircleFilledTwoTone as StreamableIcon } from '@material-ui/icons';
import StarButtons from './StarButtons';
import ShowImage from './ShowImage';
import { ShowType } from '../src/model';

const useStyles = makeStyles({
  dynamicWidthRoot: {
    maxWidth: 345,
    minWidth: 200
  },
  content: {
    paddingBottom: 8,
    position: 'relative'
  },
  title: {
    height: '3em',
    display: '-webkit-box',
    overflow: 'hidden',
    lineClamp: 2,
    boxOrient: 'vertical',
    position: 'relative'
  },
  actions: {
    justifyContent: 'center'
  },
  tags: {
    display: 'flex',
    alignItems: 'center',
    gridGap: 8,
    position: 'absolute',
    right: 5,
    top: 3,
    opacity: 0.8,
    '& .MuiSvgIcon-root': {
      fontSize: 18,
      opacity: 0.8
    }
  },
});

const ShowCard = ({ show, userRating, onRatingChange, onClick }) => {
  const classes = useStyles();
  const TypeIcon = ShowType.toTwoToneIcon(show.type);

  return (
    <Card className={classes.dynamicWidthRoot}>
      <CardActionArea onClick={onClick}>
        <ShowImage show={show} />
        <CardContent className={classes.content}>
          <div className={classes.tags}>
            <TypeIcon />
            {show.providerIds?.length > 0 && <StreamableIcon />}
          </div>

          <Typography className={classes.title} variant="h6">
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