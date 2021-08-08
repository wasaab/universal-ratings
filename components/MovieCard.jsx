import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    Typography,
    SvgIcon
} from '@material-ui/core';
import StarButtons from './StarButtons';
import Image from 'next/image';
import NetflixIcon from '../resources/netflix.svg';
import HuluIcon from '../resources/hulu.svg';

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
    paddingBottom: '4px'
  }
});

const ShowCard = ({ title, rating, userRating, img, onClick }) => {
  const classes = useStyles();

  const rateShow = (updatedUserRating) => {
    console.log(`${title} rated ${updatedUserRating} stars`);
  };

  return (
    <Card className={classes.root}>
      <CardActionArea onClick={onClick}>
        <div className={classes.media}>
          <Image
            src={img}
            alt={title}
            layout="fill"
            objectFit="cover"
            objectPosition="top"
          />
        </div>
        <CardContent className={classes.content}>
            <Typography variant="h6" component="h6">
                {title}
            </Typography>
            {title.length > 10 ? <NetflixIcon height="19" /> : <HuluIcon height="13" />}
        </CardContent>
      </CardActionArea>
      <CardActions className={classes.actions}>
        <StarButtons avgRating={rating} userRating={userRating} maxRating={5} onClick={rateShow} />
      </CardActions>
    </Card>
  );
};

export default ShowCard;