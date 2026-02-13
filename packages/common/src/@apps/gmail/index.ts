import { AppType, type IApp } from '../../types';
import triggers from './triggers';
import actions from './actions';
import auth from './auth';

export const gmail: IApp = {
  id: AppType.GMAIL,
  name: 'Gmail',
  description: 'connect to your Gmail account',
  icon: '/gmail.png',
  auth,
  triggers,
  actions,
};
