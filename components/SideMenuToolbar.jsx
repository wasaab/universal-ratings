import React, { useState } from 'react';
import { AmplifySignOut } from '@aws-amplify/ui-react'
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
    AppBar,
    Drawer,
    Toolbar,
    List,
    CssBaseline,
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
  ChevronRight as ChevronRightIcon,
  Movie as MovieIcon,
  Tv as TvIcon,
  NewReleases as NewReleasesIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  WatchLater as WatchLaterIcon,
  Visibility as VisibilityIcon
} from '@material-ui/icons/'
import MovieCard from './MovieCard';
import ratings from '../resources/ratings.json'
import TitleSearchBar from './TitleSearchBar';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  searchBar: {
    position: 'absolute',
    right: 24
  }
}));

const SideMenuItem = ({ title, LeftIcon, onClick }) => (
  <ListItem button key={title}>
    <ListItemIcon>
      <LeftIcon />
    </ListItemIcon>
    <ListItemText primary={title} />
  </ListItem>
);

const SideMenuToolbar = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    console.log('opened');
    setOpen(true);
  };

  const handleDrawerClose = () => {
    console.log('closed');
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open,
            })}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Universal Ratings
          </Typography>
          <TitleSearchBar className={classes.searchBar} />
          {/* <AmplifySignOut className={classes.signOutButton} /> */}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </div>
        <Divider />
        <List>
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
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Grid container spacing={3}  wrap="wrap">
          {ratings.slice(0, 10).filter(({ img }) => img).map(({ title, rating, img }, i) => (
            <Grid key={i} item xs>
              <MovieCard title={title} rating={rating} img={img} />
            </Grid>
          ))}
        </Grid>
      </main>
    </div>
  );
};

export default SideMenuToolbar;
