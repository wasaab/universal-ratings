import React from 'react';
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
  Select
} from '@material-ui/core';
import { SettingsBackupRestore as RevertIcon } from '@material-ui/icons';
import { revertTheme, saveThemePref, setTheme, useTheme } from './ThemeProvider';
import { themeNames } from '../resources/styles/theme';

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
  }
}));

const SettingsModal = ({ onClose }) => {
  const classes = useStyles();
  const { theme, themePref, dispatch } = useTheme();

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

        <Button
          disabled={themePref === theme}
          variant="outlined"
          onClick={() => {
            saveThemePref(dispatch);
            onClose();
          }}
          className={classes.saveButton}
        >
          Save Preference
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;