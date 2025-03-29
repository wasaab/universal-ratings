import { useEffect, useState } from 'react';
import Head from 'next/head';
import API, { graphqlOperation } from '@aws-amplify/api';
import { getUser } from '../src/graphql/custom-queries.js';
import { AmplifyAuthContainer, AmplifyAuthenticator } from '@aws-amplify/ui-react';
import { AuthState } from '@aws-amplify/ui-components';
import { Amplify as amplify } from 'aws-amplify';
import amplifyConfig from '../src/aws-exports';
import { ThemeProvider } from '../components/ThemeProvider.jsx';
import '../resources/styles/global.css';

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

const App = ({ Component, pageProps }) => {
  const [user, setUser] = useState();

  const handleAuthStateChange = async (authState, authedUser) => {
    if (!user && authState === AuthState.SignedIn) { // handle login
      const userInfo = await fetchUser(authedUser.attributes.sub);

      setUser(userInfo);
    } else if (user && authState === AuthState.SignIn) { // handle logout
      setUser(null);
    }
  };

  useEffect(removeJss, []);

  return (
    <>
      <Head>
        <title>Universal Ratings</title>
      </Head>

      <AmplifyAuthContainer>
        <AmplifyAuthenticator handleAuthStateChange={handleAuthStateChange}>
          <ThemeProvider userId={user?.id}>
            {user && <Component {...pageProps} authedUser={user} />}
          </ThemeProvider>
        </AmplifyAuthenticator>
      </AmplifyAuthContainer>
    </>
  );
};

export default App;