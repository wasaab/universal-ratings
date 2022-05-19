import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Typography,
} from '@material-ui/core';
import { renderProviderLogo } from '../resources/data/providers';
import { EventBusy as FinaleIcon } from '@material-ui/icons';
import ShowImage from './ShowImage';

const useStyles = makeStyles({
  fixedWidthRoot: {
    width: 158
  },
  content: {
    padding: 8
  },
  title: {
    height: '3em',
    display: '-webkit-box',
    overflow: 'hidden',
    lineClamp: 2,
    boxOrient: 'vertical',
    position: 'relative'
  },
  tags: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gridGap: 8,
    paddingTop: '12px',
    fontSize: '0.8em',
  },
  episodeChip: {
    borderColor: 'rgba(255, 180, 0, 0.6)',
    color: '#ffb400',
    '& .MuiChip-icon': {
      marginLeft: '4px'
    }
  }
});

const EpisodeCard = ({ show, elevation = 1, onClick }) => {
  const classes = useStyles();

  return (
    <Card className={classes.fixedWidthRoot} elevation={elevation}>
      <CardActionArea onClick={onClick}>
        <ShowImage show={show} tall />
        <CardContent className={classes.content}>
          <Typography className={classes.title} variant="subtitle2">
            {show.title}
          </Typography>

          <div className={classes.tags}>
            <Chip
              title={show.isFinale ? 'Finale' : ''}
              className={classes.episodeChip}
              label={`${show.seasonNum}x${show.episodeNum}`}
              icon={show.isFinale ? <FinaleIcon /> : null}
              variant="outlined"
              color="primary"
              size="small"
            />
            {show.providerIds?.slice(0, 2).map(renderProviderLogo)}
          </div>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default EpisodeCard;