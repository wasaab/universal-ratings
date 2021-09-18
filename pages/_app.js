import { useEffect, useState } from 'react';
import Head from 'next/head';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import API, { graphqlOperation } from '@aws-amplify/api';
import { getUser } from '../src/graphql/custom-queries.js';
import { AmplifyAuthContainer, AmplifyAuthenticator } from '@aws-amplify/ui-react';
import { AuthState } from '@aws-amplify/ui-components';
import amplify from 'aws-amplify';
import amplifyConfig from '../src/aws-exports';
import MainView from '../components/MainView';
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

const fetchUser = async (id) => {
  const { data } = await API.graphql(graphqlOperation(getUser, { id }));

  return data.getUser;
};

const App = () => {
  const [user, setUser] = useState();

  const storeUser = async (authState, authedUser) => {
    if (user || !authedUser || authState !== AuthState.SignedIn) { return; }

    const userInfo = await fetchUser(authedUser.attributes.sub);

    setUser(userInfo);
  };

  useEffect(removeJss, []);

  return (
    <>
      <Head>
        <title>Universal Ratings</title>
      </Head>

      <AmplifyAuthContainer>
        <AmplifyAuthenticator handleAuthStateChange={storeUser}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {user && <MainView user={user} />}
          </ThemeProvider>
        </AmplifyAuthenticator>
      </AmplifyAuthContainer>
    </>
  );
};

export default App;