import React from 'react';
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
  Home as HomeIcon
} from '@material-ui/icons/';

const useStyles = makeStyles((theme) => ({
  drawer: ({ width }) => ({
    width: width,
    flexShrink: 0,
    whiteSpace: 'nowrap'
  }),
  drawerOpen: ({ width }) => ({
    overflowX: 'hidden',
    width: width,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  }),
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
}));

const DrawerMenuItem = ({ title, LeftIcon, onClick }) => (
  <ListItem button key={title} onClick={onClick}>
    <ListItemIcon>
      <LeftIcon />
    </ListItemIcon>

    <ListItemText primary={title} />
  </ListItem>
);

const Drawer = ({ open, width, onClose }) => {
  const classes = useStyles({ width })
  const drawerStateClass = open ? classes.drawerOpen : classes.drawerClose;

  return (
    <MaterialDrawer
      variant="permanent"
      className={clsx(classes.drawer, drawerStateClass)}
      classes={{ paper: drawerStateClass }}
    >
      <div className={classes.toolbar}>
        <IconButton onClick={onClose}>
          <ChevronLeftIcon />
        </IconButton>
      </div>

      <Divider />

      <List>
        <DrawerMenuItem title="Home" LeftIcon={HomeIcon} />
        <DrawerMenuItem title="Movies" LeftIcon={MovieIcon} />
        <DrawerMenuItem title="TV Shows" LeftIcon={TvIcon} />
        <DrawerMenuItem title="Recently Released" LeftIcon={NewReleasesIcon} />
        <DrawerMenuItem title="Recently Rated" LeftIcon={StarIcon} />
      </List>

      <Divider />

      <List>
        <DrawerMenuItem title="Favorites" LeftIcon={FavoriteIcon} />
        <DrawerMenuItem title="Watchlist" LeftIcon={WatchLaterIcon} />
        <DrawerMenuItem title="Watched" LeftIcon={VisibilityIcon} />
      </List>
    </MaterialDrawer>
  );
};

export default Drawer;