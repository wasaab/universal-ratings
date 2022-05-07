import { useEffect, useState } from 'react';
import Head from 'next/head';
import API, { graphqlOperation } from '@aws-amplify/api';
import { getUser } from '../src/graphql/custom-queries.js';
import { AmplifyAuthContainer, AmplifyAuthenticator } from '@aws-amplify/ui-react';
import { AuthState } from '@aws-amplify/ui-components';
import amplify from 'aws-amplify';
// import amplify from '@aws-amplify/core'; // Todo: smaller bundle, but causes an error in console
  // Expected server HTML to contain a matching <amplify-authenticator> in <amplify-auth-container></amplify-auth-container>
  // I'm getting that now... even with aws-amplify import. what is going on?
  // on refresh the error is gone... so does it just happen after initial build?
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

amplify.configure({ ...amplifyConfig, ssr: true }); // todo: undecided on SSR

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