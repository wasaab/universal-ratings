import { grey, blue } from '@material-ui/core/colors';
import { createTheme } from '@material-ui/core/styles';
import { blueAndWhiteGradient, darkTriangleGradiant, purpleGradiant } from './gradiant';

const defaultTheme = createTheme({
  palette: {
    type: 'dark',
    background: {
      default: '#bf0fff',
      paper: 'rgba(255, 255, 255, 0.06)',
      header: 'linear-gradient(to right, #E100FF, #7F00FF)'
    },
    primary: {
      main: '#fff',
      contrastText: '#fff'
    },
    secondary: {
      light: '#7f00ff',
      main: '#470fff'
    },
    text: {
      avatar: '#8100ff'
    }
  },
  elevation: {
    card: 3
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          backgroundImage: purpleGradiant
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(127, 0, 255, 0.8)',
          borderRadius: 4
        }
      }
    }
  }
});

const darkTheme = createTheme({
  palette: {
    type: 'dark',
    background: {
      paper: 'rgba(255, 255, 255, 0.1)',
      header: grey[900]
    },
    primary: {
      main: '#fff',
      contrastText: '#fff'
    },
    secondary: {
      light: '#7f00ff',
      main: '#470fff'
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.85)',
      avatar: grey[900]
    }
  },
  elevation: {
    card: 6
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          backgroundImage: darkTriangleGradiant
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 4
        }
      }
    }
  }
});

const blueTheme = createTheme({
  palette: {
    type: 'dark',
    background: {
      default: '#376be3',
      paper: 'rgba(255, 255, 255, 0.06)',
      header: 'linear-gradient(to right, #0730d8, #5690e6)'
    },
    primary: {
      main: '#fff',
      contrastText: '#fff'
    },
    secondary: {
      light: '#fff',
      main: blue.A400
    },
    text: {
      avatar: '#538de6'
    }
  },
  elevation: {
    card: 3
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          backgroundImage: blueAndWhiteGradient
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 4
        }
      }
    }
  }
});

export default class Theme {
  static DEFAULT = new Theme('Default', defaultTheme);
  static DARK = new Theme('Dark', darkTheme);
  static BLUE = new Theme('Blue', blueTheme);

  constructor(name, value) {
    this.name = name;
    this.value = value;
  }
}

const themeNames = Object.values(Theme).map(({ name }) => name);

export { defaultTheme, themeNames };