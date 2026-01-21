import { AppType, IApp } from '../../types';
import triggers from './triggers';
import actions from './actions';

const gmail: IApp = {
  id: AppType.GMAIL,
  name: 'Gmail',
  description: 'connect to your Gmail account',
  icon: '',
  triggers,
  actions,

  getAuthUrl: () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const response_type = 'code';
    const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', clientId!);
    authUrl.searchParams.append('redirect_uri', redirectUri!);
    authUrl.searchParams.append('response_type', response_type);
    authUrl.searchParams.append('scope', scopes.join(' '));
    return authUrl.toString();
  },

  getTokenUrl: (code: string) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const grant_type = 'authorization_code';

    const tokenUrl = new URL('https://oauth2.googleapis.com/token');
    tokenUrl.searchParams.append('client_id', clientId!);
    tokenUrl.searchParams.append('client_secret', clientSecret!);
    tokenUrl.searchParams.append('redirect_uri', redirectUri!);
    tokenUrl.searchParams.append('grant_type', grant_type);
    tokenUrl.searchParams.append('code', code);
    return tokenUrl.toString();
  },
};

export default gmail;
