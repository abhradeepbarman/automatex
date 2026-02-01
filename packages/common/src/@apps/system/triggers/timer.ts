import z from 'zod';
import { ITrigger, pollingInterval } from '../../../types';

export const timer: ITrigger = {
  id: 'timer',
  name: 'Timer',
  description: 'Triggered when a timer is set',
  fields: [
    {
      label: 'Interval',
      name: 'intervalMs',
      type: 'select',
      defaultValue: pollingInterval.FIVE_MINUTES.value,
      options: [
        {
          label: pollingInterval.ONE_MINUTE.label,
          value: pollingInterval.ONE_MINUTE.value,
        },
        {
          label: pollingInterval.FIVE_MINUTES.label,
          value: pollingInterval.FIVE_MINUTES.value,
        },
        {
          label: pollingInterval.TEN_MINUTES.label,
          value: pollingInterval.TEN_MINUTES.value,
        },
      ],
      validations: () => z.string().nonempty('Interval is required'),
    },
  ],
};
