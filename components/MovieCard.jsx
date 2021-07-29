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

const MovieCard = ({ title, rating, img }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <div className={classes.media}>
            {img && <Image src={img} layout="fill" objectFit="cover" objectPosition="top" />}
        </div>
        <CardContent className={classes.content}>
            <Typography variant="h6" component="h6">
                {title}
            </Typography>
            {title.length > 10 ? (
                <SvgIcon style={{ transform: 'scale(0.8)', marginLeft: '-5px' }}>
                    <svg x="0px" y="0px" viewBox="0 0 512 512">
                        <g>
                            <rect x="304" style={{ fill: '#D32F2F' }} width="96" height="512"/>
                            <rect x="112" style={{ fill: '#D32F2F' }} width="96" height="512"/>
                        </g>
                        <polygon style={{ fill: '#F44336' }} points="400,512 304,512 112,0 208,0 "/>
                    </svg>
                </SvgIcon>
            ) : (
                <SvgIcon style={{ transform: 'scale(2)', marginLeft: '6px' }}>
                    
                    <svg x="0px" y="0px" viewBox="0 0 320 170" style={{ enableBackground: 'new 0 0 320 170' }}>
                        <g>
                            <path d="M185.3,117.3h17.2V46.1h-17.2V117.3z M155.1,97c0,2.5-2.1,4.6-4.6,4.6h-10   c-2.5,0-4.6-2.1-4.6-4.6c0-1,0-28.7,0-28.7h-17.2v30.1c0,12.3,7.9,18.8,19.5,18.8h16.8c10.7,0,17.2-7.7,17.2-18.8V68.3h-17.2   C155.1,68.3,155.1,96.1,155.1,97z M251.8,68.3c0,0,0,27.8,0,28.7c0,2.5-2.1,4.6-4.6,4.6h-10c-2.5,0-4.6-2.1-4.6-4.6   c0-1,0-28.7,0-28.7h-17.2v30.1c0,12.3,7.9,18.8,19.5,18.8h16.8c10.7,0,17.2-7.7,17.2-18.8V68.3H251.8z M87,68.3c0,0-8.9,0-11,0   c-3.9,0-5.8,1-5.8,1V46.1H53v71.1h17.1V88.6c0-2.5,2.1-4.6,4.6-4.6h10c2.5,0,4.6,2.1,4.6,4.6v28.7h17.2V86.3   C106.5,73.3,97.8,68.3,87,68.3z" />
                        </g>
                    </svg>
                </SvgIcon>
            )}
        </CardContent>
      </CardActionArea>
      <CardActions className={classes.actions}>
        <StarButtons rating={rating} maxRating={5} />
      </CardActions>
    </Card>
  );
};

export default MovieCard;