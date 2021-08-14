import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Drawer,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
} from '@material-ui/core';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Movie as MovieIcon,
  Tv as TvIcon,
  NewReleases as NewReleasesIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  WatchLater as WatchLaterIcon,
  Visibility as VisibilityIcon,
  Home as HomeIcon
} from '@material-ui/icons/'
import ShowCard from './ShowCard';
import ratings from '../resources/ratings.json'
import TitleSearchBar from './TitleSearchBar';
import ShowDetailsModal from './ShowDetailsModal';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  appBar: ({ open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    marginLeft: open ? drawerWidth : 0,
    width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  }),
  menuButton: {
    marginRight: 36
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },
  drawerOpen: {
    width: drawerWidth,
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
    width: theme.spacing(7)
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  },
  searchBar: {
    position: 'absolute',
    right: 24
  }
}));

const SideMenuItem = ({ title, LeftIcon, onClick }) => (
  <ListItem button key={title} onClick={onClick}>
    <ListItemIcon>
      <LeftIcon />
    </ListItemIcon>

    <ListItemText primary={title} />
  </ListItem>
);

const SideMenuToolbar = () => {
  const [open, setOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState();
  const classes = useStyles({ open });

  const handleDrawerOpen = () => {
    console.log('opened');
    setOpen(true);
  };

  const handleDrawerClose = () => {
    console.log('closed');
    setOpen(false);
  };

  const renderDrawer = () => {
    const drawerStateClass = open ? classes.drawerOpen : classes.drawerClose;

    return (
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, drawerStateClass)}
        classes={{ paper: drawerStateClass }}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>

        <Divider />

        <List>
          <SideMenuItem title="Home" LeftIcon={HomeIcon} />
          <SideMenuItem title="Movies" LeftIcon={MovieIcon} />
          <SideMenuItem title="TV Shows" LeftIcon={TvIcon} />
          <SideMenuItem title="Recently Released" LeftIcon={NewReleasesIcon} />
          <SideMenuItem title="Recently Rated" LeftIcon={StarIcon} />
        </List>

        <Divider />

        <List>
          <SideMenuItem title="Favorites" LeftIcon={FavoriteIcon} />
          <SideMenuItem title="Watchlist" LeftIcon={WatchLaterIcon} />
          <SideMenuItem title="Watched" LeftIcon={VisibilityIcon} />
        </List>
      </Drawer>
    );
  }

  const renderShowCardGrid = () => (
    <Grid container spacing={3}  wrap="wrap">
      {ratings.slice(0, 100).filter(({ img }) => img).map((show, i) => (
        <Grid key={i} item xs>
          <ShowCard
            title={show.title}
            avgRating={show.rating}
            userRating={4}
            img={show.img}
            onClick={() => setSelectedShow(show)}
          />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          {!open && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              className={classes.menuButton}
              onClick={handleDrawerOpen}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap>
            Universal Ratings
          </Typography>
          <TitleSearchBar className={classes.searchBar} onSubmit={setSelectedShow} />
        </Toolbar>
      </AppBar>

      {renderDrawer()}

      <main className={classes.content}>
        <span className={classes.toolbar} />
        {selectedShow && <ShowDetailsModal show={selectedShow} onClose={() => setSelectedShow(null)} />}
        {renderShowCardGrid()}
      </main>
    </div>
  );
};

export default SideMenuToolbar;
