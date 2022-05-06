import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import {
  Drawer as MaterialDrawer,
  List,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import {
  ChevronLeft as ChevronLeftIcon,
  Movie as MovieIcon,
  Tv as TvIcon,
  NewReleases as NewReleasesIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  WatchLater as WatchLaterIcon,
  Visibility as VisibilityIcon,
  Home as HomeIcon,
  Today as CalendarIcon
} from '@material-ui/icons/';
import { View, Width } from '../src/model';
import TmdbIcon from '../resources/images/tmdb.svg';

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: Width.OPEN_DRAWER,
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },
  drawerOpen: {
    overflowX: 'hidden',
    width: Width.OPEN_DRAWER,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: 'hidden',
    width: `${theme.spacing(7)}px !important`
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar
  },
  tmdbIcon: {
    position: 'absolute',
    bottom: 24,
    padding: '0px 8px',
    boxSizing: 'border-box',
    width: 56
  }
}));

const Drawer = ({ open, width, selectedView, onClose, onSelect }) => {
  const classes = useStyles({ width });
  const drawerStateClass = open ? classes.drawerOpen : classes.drawerClose;

  const DrawerMenuItem = ({ view, LeftIcon }) => (
    <ListItem
      button
      key={view.label}
      onClick={() => onSelect(view)}
      disabled={view === selectedView}
    >
      <ListItemIcon>
        <LeftIcon />
      </ListItemIcon>

      <ListItemText primary={view.label} />
    </ListItem>
  );

  return (
    <MaterialDrawer
      variant="permanent"
      className={clsx(classes.drawer, drawerStateClass)}
      classes={{ paper: drawerStateClass }}
    >
      <div className={classes.toolbar}>
        <IconButton aria-label="close drawer" onClick={onClose}>
          <ChevronLeftIcon />
        </IconButton>
      </div>

      <Divider />

      <List>
        <DrawerMenuItem view={View.HOME} LeftIcon={HomeIcon} />
        <DrawerMenuItem view={View.MOVIES} LeftIcon={MovieIcon} />
        <DrawerMenuItem view={View.TV} LeftIcon={TvIcon} />
        <DrawerMenuItem view={View.RECENTLY_RELEASED} LeftIcon={NewReleasesIcon} />
        <DrawerMenuItem view={View.RECENTLY_RATED} LeftIcon={StarIcon} />
      </List>

      <Divider />

      <List>
        <DrawerMenuItem view={View.FAVORITES} LeftIcon={FavoriteIcon} />
        <DrawerMenuItem view={View.WATCHLIST} LeftIcon={WatchLaterIcon} />
        <DrawerMenuItem view={View.WATCHED} LeftIcon={VisibilityIcon} />
        <DrawerMenuItem view={View.SCHEDULE} LeftIcon={CalendarIcon} />
      </List>

      <div title="This site uses the TMDB API for show details but is not endorsed or certified by TMDB">
        <TmdbIcon className={classes.tmdbIcon} />
      </div>
    </MaterialDrawer>
  );
};

export default Drawer;