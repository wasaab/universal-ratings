import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
    palette: {
        type: 'dark',
        background:{
            default: '#bf0fff'
        },
        primary: {
            main: '#bf0fff'
        },
        secondary: {
            main: '#470fff'
        }
    }
});

export default theme;