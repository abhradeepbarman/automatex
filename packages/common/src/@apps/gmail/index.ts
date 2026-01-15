import { IApp } from '../../types';
import triggers from './triggers';
import actions from './actions';

const gmail: IApp = {
  id: 'GMAIL',
  name: 'Gmail',
  description: 'connect to your Gmail account',
  icon: '',
  triggers,
  actions,
};

export default gmail;
