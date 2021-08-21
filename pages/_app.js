import { useEffect } from 'react';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { AmplifyAuthContainer, AmplifyAuthenticator } from '@aws-amplify/ui-react'
import amplify from 'aws-amplify';
import amplifyConfig from '../src/aws-exports';
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

amplify.configure(amplifyConfig);

const App = () => {
    useEffect(removeJss, []);

    return (
        <AmplifyAuthContainer>
            <AmplifyAuthenticator>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <SideMenuToolbar />
                </ThemeProvider>
            </AmplifyAuthenticator>
        </AmplifyAuthContainer>
    );
};

export default App;
