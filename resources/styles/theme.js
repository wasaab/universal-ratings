import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
  palette: {
    type: 'dark',
    background: {
      default: '#bf0fff'
    },
    primary: {
      main: '#fff',
      contrastText: '#fff'
    },
    secondary: {
      light: '#7f00ff',
      main: '#470fff'
    }
  }
});

export default theme;