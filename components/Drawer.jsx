import React, { useState } from 'react';
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

const Drawer = ({ open, width, onClose, onSelect }) => {
  const classes = useStyles({ width })
  const drawerStateClass = open ? classes.drawerOpen : classes.drawerClose;
  const [selected, setSelected] = useState('Home');

  const handleSelection = (title) => {
    onSelect(title);
    setSelected(title);
  };

  const DrawerMenuItem = ({ title, LeftIcon }) => (
    <ListItem button key={title} onClick={() => handleSelection(title)} disabled={title === selected}>
      <ListItemIcon>
        <LeftIcon />
      </ListItemIcon>

      <ListItemText primary={title} />
    </ListItem>
  );

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
        <DrawerMenuItem title="Home" LeftIcon={HomeIcon} onClick={onSelect} />
        <DrawerMenuItem title="Movies" LeftIcon={MovieIcon} onClick={onSelect} />
        <DrawerMenuItem title="TV Shows" LeftIcon={TvIcon} onClick={onSelect} />
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