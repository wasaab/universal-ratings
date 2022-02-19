import React from 'react';
import {
  AppBar,
  IconButton,
  Toolbar as MaterialToolbar,
  Typography
} from '@material-ui/core';
import { Menu as MenuIcon } from '@material-ui/icons/';
import { makeStyles } from '@material-ui/core/styles';
import TitleSearchBar from './TitleSearchBar';
import UserMenu from './UserMenu';

const useStyles = makeStyles((theme) => ({
  appBar: ({ drawerOpen, drawerWidth }) => ({
    zIndex: theme.zIndex.drawer + 1,
    marginLeft: drawerOpen ? drawerWidth : 0,
    width: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    background: theme.palette.background.header
  }),
  menuButton: {
    marginRight: 36
  },
  searchBar: {
    position: 'absolute',
    right: 100
  },
  userMenu: {
    position: 'absolute',
    right: 12
  },
  appName: {
    [theme.breakpoints.down(580)]: {
      display: 'none'
    }
  }
}));

const Toolbar = ({ user, drawerOpen, onDrawerOpen, onSearchSubmit, onEditProfile, onEditSettings, drawerWidth }) => {
  const classes = useStyles({ drawerOpen, drawerWidth });

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <MaterialToolbar>
        {!drawerOpen && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            className={classes.menuButton}
            onClick={onDrawerOpen}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" noWrap className={classes.appName}>
          Universal Ratings
        </Typography>

        <TitleSearchBar className={classes.searchBar} onSubmit={onSearchSubmit} />

        <UserMenu
          className={classes.userMenu}
          user={user}
          onEditProfile={onEditProfile}
          onEditSettings={onEditSettings}
        />
      </MaterialToolbar>
    </AppBar>
  );
};

export default Toolbar;