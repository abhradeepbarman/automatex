import { AppType, IApp } from '../../types';
import triggers from './triggers';

const slack: IApp = {
  id: AppType.SLACK,
  name: 'Slack',
  description: 'connect to your Slack account',
  icon: '',
  auth: {
    redirectUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: '',
  },
  triggers,
  actions: [],
};

export default slack;
