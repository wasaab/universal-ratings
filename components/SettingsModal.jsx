import React, { useState } from 'react';
import API, { graphqlOperation } from '@aws-amplify/api';
import { updateUser } from '../src/graphql/mutations';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Switch,
  Typography
} from '@material-ui/core';
import { SettingsBackupRestore as RevertIcon } from '@material-ui/icons';
import { revertTheme, saveThemePref, setTheme, useTheme } from './ThemeProvider';
import { themeNames } from '../resources/styles/theme';
import PlexIcon from '../resources/images/plex.svg';

const useStyles = makeStyles((theme) => ({
  content: {
    height: 204,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    [theme.breakpoints.up(365)]: {
      width: 300
    }
  },
  saveButton: {
    marginBottom: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.08)'
  },
  themeForm: {
    alignSelf: 'start'
  },
  revertButton: {
    alignSelf: 'end'
  },
  plexSearchLabel: {
    fontSize: 22,
    lineHeight: 1,
    margin: '0px 12px 0px 6px'
  }
}));

const SettingsModal = ({ user, onClose, onSave }) => {
  const classes = useStyles();
  const { theme, themePref, dispatch } = useTheme();
  const [plexSearchEnabled, setPlexSearchEnabled] = useState(Boolean(user.plexSearchEnabled));

  const savePlexSearchPref = async () => {
    const input = {
      id: user.id,
      plexSearchEnabled
    };

    try {
      await API.graphql(graphqlOperation(updateUser, { input }));
      onSave(plexSearchEnabled);
    } catch (err) {
      console.error('Failed to update user: ', err);
    }
  };

  const handleSave = () => {
    if (themePref !== theme) {
      saveThemePref(dispatch);
    }

    if (plexSearchEnabled !== user.plexSearchEnabled) {
      savePlexSearchPref();
    }

    onClose();
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogContent className={classes.content}>
        <Box display="flex" height={56} gridGap={20}>
          <FormControl className={classes.themeForm} fullWidth>
            <InputLabel id="theme-select-label">Theme</InputLabel>
            <Select
              labelId="theme-select-label"
              value={theme}
              onChange={(event) => setTheme(dispatch, event.target.value)}
              MenuProps={{
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left'
                },
                getContentAnchorEl: null
              }}
              >
              {themeNames.map((themeName) => (
                <MenuItem key={themeName} value={themeName}>
                  {themeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton className={classes.revertButton} onClick={() => revertTheme(dispatch)}>
            <RevertIcon />
          </IconButton>
        </Box>

        <Box display="flex" alignItems="center">
          <PlexIcon />
          <Typography variant="subtitle2" className={classes.plexSearchLabel}>
            Search
          </Typography>
          <Switch
            color="primary"
            checked={plexSearchEnabled}
            onChange={() => setPlexSearchEnabled(!plexSearchEnabled)}
          />
        </Box>

        <Button
          disabled={themePref === theme && plexSearchEnabled === user.plexSearchEnabled}
          variant="outlined"
          onClick={handleSave}
          className={classes.saveButton}
        >
          Save Preference
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;