import React, { createContext, useContext, useReducer } from 'react';
import { CssBaseline, ThemeProvider as MaterialThemeProvider } from '@material-ui/core';
import API, { graphqlOperation } from '@aws-amplify/api';
import { updateUser } from '../src/graphql/mutations';
import Theme from '../resources/styles/theme';

class ThemeAction {
  static SET_THEME = 'set';
  static SAVE_PREFERENCE = 'save';
  static REVERT_THEME = 'revert';
}

const initialState = { theme: Theme.DEFAULT };
const ThemeContext = createContext(initialState);
const nameToTheme = Object.values(Theme)
  .reduce((result, theme) => ({ ...result, [theme.name]: theme }), {});

const updateUserThemePref = async (themePref, userId) => {
  const input = {
    id: userId,
    themePref
  };

  try {
    await API.graphql(graphqlOperation(updateUser, { input }));
  } catch (err) {
    console.error('Failed to update user\'s theme pref: ', err);
  }
};

const reducer = (userId) => (state, action) => {
  switch (action.type) {
    case ThemeAction.SAVE_PREFERENCE: {
      const themePref = state.theme.name;

      updateUserThemePref(themePref, userId);

      return { ...state, themePref };
    }
    case ThemeAction.SET_THEME: {
      return {
        theme: nameToTheme[action.themeName] ?? state.theme,
        themePref: action.isPreference ? action.themeName : state.themePref
      };
    }
    case ThemeAction.REVERT_THEME:
      return { ...state, theme: Theme.DEFAULT };
    default:
      throw new Error('Unsupported theme action');
  }
};

const ThemeProvider = ({ children, userId }) => {
  const [state, dispatch] = useReducer(reducer(userId), initialState);
  const value = {
    theme: state.theme.name,
    themePref: state.themePref,
    dispatch
  };

  return (
    <ThemeContext.Provider value={value}>
      <MaterialThemeProvider theme={state.theme.value}>
        <CssBaseline />
        {children}
      </MaterialThemeProvider>
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

/**
 * Sets the app's theme to the provided theme.
 * Optionally sets the user's theme preference to the same theme.
 *
 * @param {React.DispatchWithoutAction} dispatch - the reducer's dispatch function
 * @param {string} themeName - the name of the theme to use
 * @param {boolean=} isPreference - whether the provided theme is the user's preference
 */
function setTheme(dispatch, themeName, isPreference) {
  dispatch({ type: ThemeAction.SET_THEME, themeName, isPreference });
}

/**
 * Saves the user's theme preference to the DB and updates the context's state.
 *
 * @param {React.DispatchWithoutAction} dispatch - the reducer's dispatch function
 */
function saveThemePref(dispatch) {
  dispatch({ type: ThemeAction.SAVE_PREFERENCE });
}

/**
 * Reverts the selected theme to the default theme.
 *
 * @param {React.DispatchWithoutAction} dispatch - the reducer's dispatch function
 */
function revertTheme(dispatch) {
  dispatch({ type: ThemeAction.REVERT_THEME });
}

export { ThemeProvider, useTheme, setTheme, saveThemePref, revertTheme };