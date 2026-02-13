import { AppType, type IApp } from '../../types';
import triggers from './triggers';

export const system: IApp = {
  id: AppType.SYSTEM,
  name: 'Others',
  description: 'system events',
  icon: '/system.png',
  triggers,
};
