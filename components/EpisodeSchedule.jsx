import React, { useRef, useEffect, Fragment } from 'react';
import moment from 'moment';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Box, Fab, Grid, Typography, Zoom } from '@material-ui/core';
import {
  History as PastIcon,
  DoubleArrow as PresentIcon,
  Update as FutureIcon,
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon
} from '@material-ui/icons';
import EpisodeCard from './EpisodeCard';
import { useOnScreen } from '../hooks';
import Alert from './Alert';

/**
 * Configures moment calendar to output the desired day header format.
 */
function configureMomentCalendar() {
  const monthDayFormat = ', MMMM Do';
  const weekdayMonthDayFormat = `dddd${monthDayFormat}`;

  moment.updateLocale('en', {
    calendar: {
      yesterday: `[Yesterday]${monthDayFormat}`,
      today: `[Today]${monthDayFormat}`,
      tomorrow: `[Tomorrow]${monthDayFormat}`,
      last: `[Last] ${weekdayMonthDayFormat}`,
      next: `[Next] ${weekdayMonthDayFormat}`,
      diffYear: `MMMM Do YYYY`,
      other: `${weekdayMonthDayFormat}`
    }
  });

  moment.calendarFormat = (time, now) => {
    const daysDiff = time.diff(now, 'days', true);

    if (Math.abs(daysDiff) > 30 && time.year() !== now.year()) { return 'diffYear'; }
    if (daysDiff < -6) { return 'other'; }
    if (daysDiff < -1) { return 'last'; }
    if (daysDiff < 0) { return 'yesterday'; }
    if (daysDiff < 1) { return 'today'; }
    if (daysDiff < 2) { return 'tomorrow'; }
    if (daysDiff < 7) { return 'next'; }

    return 'other';
  };
}

configureMomentCalendar();

const useStyles = makeStyles({
  sectionHeader: {
    margin: '24px 0px 10px 0px',
    fontWeight: 500,
    '&:first-of-type': {
      marginTop: 0
    }
  },
  alert: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  navFab: {
    position: 'fixed',
    bottom: 32,
    right: 32
  }
});

function renderTimeIcon(today, airDate) {
  if (today.isBefore(airDate, 'day')) { return <FutureIcon />; }

  return today.isAfter(airDate, 'day') ? <PastIcon /> : <PresentIcon />;
}

const NoRecentEpsAlert = () => (
  <Alert
    title="No Recent Episodes"
    desc="None of the shows you've rated or added to your watchlist have recent episodes."
  />
);

const NoEpsAlert = ({ title }) => (
  <Alert
    title="No Episodes"
    desc={`"${title}" never aired and has no episodes in production.`}
  />
);

const EpisodeSchedule = ({ shows, dateToEpisodes, onShowSelected }) => {
  const classes = useStyles();
  const theme = useTheme();
  const nearestDayRef = useRef();
  const [isNearestDayVisible, nearestDayPosition] = useOnScreen(nearestDayRef);
  const today = moment();

  const scrollToNearestDay = () => {
    window.scrollTo(0, nearestDayRef.current.offsetTop - 80);
  };

  useEffect(() => {
    if (!nearestDayRef.current) { return; }

    scrollToNearestDay();
  }, [nearestDayRef.current]);

  const renderShowCard = (scheduledShow, ep, releaseDate) => {
    const show = { ...scheduledShow, ...ep, releaseDate };
    const showIdx = shows.findIndex(({ id }) => id === show.id);

    return (
      <Grid key={`${showIdx}-${show.episodeNum}`} item>
        <EpisodeCard
          show={show}
          onClick={() => onShowSelected(show, showIdx)}
          elevation={theme.elevation.card}
        />
      </Grid>
    );
  };

  const renderEpisodes = (day) => dateToEpisodes[day]
    .map((show) => show.episodes.map((ep) => renderShowCard(show, ep, day)));

  const renderSchedule = () => {
    let nearestDay;

    return Object.keys(dateToEpisodes).map((day) => {
      if (!nearestDay && today.isSameOrBefore(day, 'day')) {
        nearestDay = day;
      }

      return (
        <Fragment key={day}>
          <Box
            display="flex"
            alignItems="center"
            gridGap={8}
            className={classes.sectionHeader}
            style={{ color: nearestDay === day ? '#ffb400' : 'unset' }}
          >
            {renderTimeIcon(today, day)}
            <Typography
              ref={nearestDay === day ? nearestDayRef : null}
              variant="h5"
              style={{ fontWeight: 'inherit' }}
            >
              {moment(day).calendar()}
            </Typography>
          </Box>
          <Grid container spacing={2} wrap="wrap">
           {renderEpisodes(day)}
          </Grid>
        </Fragment>
      );
    });
  };

  const renderNoEpisodesAlert = () => (
    shows.length === 0 ? <NoRecentEpsAlert /> : <NoEpsAlert title={shows[0].title} />
  );

  const isScheduleEmpty = () => shows.length === 0 || Object.keys(dateToEpisodes).length === 0;

  return isScheduleEmpty() ? renderNoEpisodesAlert() : (
    <>
      {renderSchedule()}
      {nearestDayRef.current && (
        <Zoom in={!isNearestDayVisible} timeout={300}>
          <Fab
            className={classes.navFab}
            size="medium"
            color="secondary"
            onClick={scrollToNearestDay}
          >
            {nearestDayPosition === 'above' ? <UpIcon /> : <DownIcon />}
          </Fab>
        </Zoom>
      )}
    </>
  );
};

export default EpisodeSchedule;