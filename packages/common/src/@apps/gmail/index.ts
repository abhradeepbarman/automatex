import { AppType, IApp } from '../../types';
import triggers from './triggers';
import actions from './actions';

const gmail: IApp = {
  id: AppType.GMAIL,
  name: 'Gmail',
  description: 'connect to your Gmail account',
  icon: '',
  auth: {
    redirectUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
  },
  triggers,
  actions,
};

export default gmail;
