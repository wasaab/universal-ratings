import { useEffect } from 'react';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch } from 'react-instantsearch-dom';
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

const searchClient = algoliasearch('QVUO52LVSK', 'ae8c0c082adf1cd9dace13ea68322713');

amplify.configure(amplifyConfig);

const App = () => {
    useEffect(removeJss, []);

    return (
        <AmplifyAuthContainer>
            <AmplifyAuthenticator>
                <InstantSearch indexName="shows" searchClient={searchClient}>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <SideMenuToolbar />
                    </ThemeProvider>
                </InstantSearch>
            </AmplifyAuthenticator>
        </AmplifyAuthContainer>
    );
};

export default App;
