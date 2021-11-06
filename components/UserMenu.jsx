import { useRef, useState } from 'react';
import { Auth } from 'aws-amplify';
import clsx from 'clsx';
import {
  alpha,
  ClickAwayListener,
  Divider,
  Grow,
  IconButton,
  ListItemIcon,
  ListSubheader,
  makeStyles,
  MenuItem,
  MenuList,
  Paper,
  Popper
} from '@material-ui/core';
import {
  AccountCircle as AccountCircleIcon,
  PowerSettingsNew as LogoutIcon
} from '@material-ui/icons';
import UserAvatar from './UserAvatar';

const useStyles = makeStyles((theme) => ({
  hoverHighlight: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.12)'
    }
  },
  userMenuPaper: {
    backgroundColor: `${alpha(theme.palette.background.default, 0.55)} !important`
  },
  listItemIcon: {
    minWidth: 36
  },
  menuButton: {
    padding: 10
  },
  menu: {
    '& .MuiDivider-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.25)'
    }
  },
  subheader: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '17ch',
    lineHeight: '36px'
  }
}));

const UserMenu = ({ className, user, onEditProfile }) => {
  const classes = useStyles();
  const userMenuButtonRef = useRef();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleUserMenuKeypress = (event) => {
    if (event.key !== 'Tab' && event.key !== 'Escape') { return; }

    event.preventDefault();
    setUserMenuOpen(false);
  };

  const handleEditProfileClick = () => {
    setUserMenuOpen(false);
    onEditProfile();
  };

  return (
    <div className={className}>
      <IconButton
        ref={userMenuButtonRef}
        className={clsx(classes.hoverHighlight, classes.menuButton)}
        onClick={() => setUserMenuOpen(true)}
        aria-label="user menu button"
        >
        <UserAvatar name={user.name} color="#8100ff" size={35} />
      </IconButton>

      <Popper
        open={userMenuOpen}
        anchorEl={userMenuButtonRef.current}
        transition
        disablePortal
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'center bottom' }}>
            <Paper className={classes.userMenuPaper}>
              <ClickAwayListener onClickAway={() => setUserMenuOpen(false)}>
                <MenuList
                  className={classes.menu}
                  autoFocusItem={userMenuOpen}
                  onKeyDown={handleUserMenuKeypress}
                  subheader={
                    <ListSubheader className={classes.subheader}>
                      {user.name}
                    </ListSubheader>
                  }
                >
                  <Divider />
                  <MenuItem className={classes.hoverHighlight} onClick={handleEditProfileClick}>
                    <ListItemIcon className={classes.listItemIcon}>
                      <AccountCircleIcon fontSize="small" />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <MenuItem className={classes.hoverHighlight} onClick={() => Auth.signOut()}>
                  <ListItemIcon className={classes.listItemIcon}>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                    Logout
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
};

export default UserMenu;