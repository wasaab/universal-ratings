import { useRef, useState } from 'react';
import { Auth } from 'aws-amplify';
import {
  alpha,
  ClickAwayListener,
  Grow,
  IconButton,
  makeStyles,
  MenuItem,
  MenuList,
  Paper,
  Popper
} from '@material-ui/core';
import { AccountCircle as AccountCircleIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  hoverHighlight: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.12)'
    }
  },
  userMenuPaper: {
    backgroundColor: `${alpha(theme.palette.background.default, 0.55)} !important`
  }
}));

const UserMenu = ({ className, onEditProfile }) => {
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
        className={classes.hoverHighlight}
        onClick={() => setUserMenuOpen(true)}
        aria-label="user menu button"
      >
        <AccountCircleIcon fontSize="large" />
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
                <MenuList autoFocusItem={userMenuOpen} onKeyDown={handleUserMenuKeypress}>
                  <MenuItem className={classes.hoverHighlight} onClick={handleEditProfileClick}>
                    Edit Profile
                  </MenuItem>
                  <MenuItem className={classes.hoverHighlight} onClick={() => Auth.signOut()}>
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