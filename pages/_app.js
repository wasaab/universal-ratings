import { useEffect } from 'react';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import SideMenuToolbar from '../components/SideMenuToolbar';
import theme from '../src/theme';
import '../styles/global.css';

/**
 * Remove the server-side injected CSS, as it will be injected client-side.
 * Required for material-ui SSR https://material-ui.com/guides/server-rendering/.
 */
function removeJss() {
    const jssStyles = document.querySelector('#jss-server-side');

    jssStyles?.parentElement?.removeChild(jssStyles);
}

const App = () => {
    useEffect(removeJss, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SideMenuToolbar />
        </ThemeProvider >
    );
};

export default App;
