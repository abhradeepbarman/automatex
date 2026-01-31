import { AppType, IApp } from '../../types';
import triggers from './triggers';
import auth from './auth';

export const gmail: IApp = {
  id: AppType.GMAIL,
  name: 'Gmail',
  description: 'connect to your Gmail account',
  icon: '/gmail.png',
  auth,
  triggers,
};
