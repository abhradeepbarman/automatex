import { IApp } from '../../types';
import triggers from './triggers';

const slack: IApp = {
  id: 'SLACK',
  name: 'Slack',
  description: 'connect to your Slack account',
  icon: '',
  triggers,
  actions: [],
};

export default slack;
