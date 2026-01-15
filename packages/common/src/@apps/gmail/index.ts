import { IApp } from '../../types';
import triggers from './triggers';

const gmail: IApp = {
  id: 'GMAIL',
  name: 'Gmail',
  description: 'connect to your Gmail account',
  icon: '',
  triggers,
};

export default gmail;
