import { ITrigger } from '../../../types';

export const timer: ITrigger = {
  id: 'timer',
  name: 'Timer',
  description: 'Triggered when a timer is set',
  fields: [
    {
      label: 'Interval',
      name: 'intervalMs',
      type: 'select',
      options: [
        { label: '1 min', value: 60000 },
        { label: '5 min', value: 300000 },
        { label: '10 min', value: 600000 },
      ],
    },
  ],
};
