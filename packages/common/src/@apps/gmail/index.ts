import { AppType, IApp } from '../../types';
import triggers from './triggers';
import actions from './actions';

const gmail: IApp = {
  id: AppType.GMAIL,
  name: 'Gmail',
  description: 'connect to your Gmail account',
  icon: '',
  scopes: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
  ],
  auth: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
  },
  triggers,
  actions,
};

export default gmail;
