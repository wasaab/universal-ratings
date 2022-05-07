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
import { Width } from '../src/model';

const useStyles = makeStyles((theme) => ({
  appBar: ({ drawerOpen }) => ({
    zIndex: theme.zIndex.drawer + 1,
    marginLeft: drawerOpen ? Width.OPEN_DRAWER : 0,
    width: drawerOpen ? `calc(100% - ${Width.OPEN_DRAWER}px)` : '100%',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    background: theme.palette.background.header
  }),
  toolbar: {
    paddingLeft: 16
  },
  menuButton: {
    marginRight: 20
  },
  searchBar: {
    position: 'absolute',
    right: 100,
    marginBottom: 6
  },
  userMenu: {
    position: 'absolute',
    right: 12
  },
  appName: {
    marginLeft: 8,
    [theme.breakpoints.down(580)]: {
      display: 'none'
    }
  }
}));

const Toolbar = ({ user, drawerOpen, onDrawerOpen, onSearchSubmit, onEditProfile, onEditSettings }) => {
  const classes = useStyles({ drawerOpen });

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <MaterialToolbar className={classes.toolbar}>
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