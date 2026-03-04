import { Amplify } from 'aws-amplify';

export const configureAmplify = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
        userPoolClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID || '',
        signUpVerificationMethod: 'code',
        loginWith: {
          oauth: {
            domain: import.meta.env.VITE_COGNITO_DOMAIN || '',
            scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
            redirectSignIn: [import.meta.env.VITE_COGNITO_REDIRECT_URI || 'http://localhost:3000/callback'],
            redirectSignOut: [import.meta.env.VITE_COGNITO_REDIRECT_URI || 'http://localhost:3000/callback'],
            responseType: 'code',
          },
        },
      },
    },
  });
};
