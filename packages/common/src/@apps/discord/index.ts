import { AppType, IApp } from '../../types';
import triggers from './triggers';
import actions from './actions';
import { getAuthUrl, getToken, getUserInfo } from './auth';

export const discord: IApp = {
  id: AppType.DISCORD,
  name: 'Discord',
  description: 'Connect to your Discord account',
  icon: '/discord.png',
  triggers,
  actions,
  getAuthUrl,
  getToken,
  getUserInfo,
};
