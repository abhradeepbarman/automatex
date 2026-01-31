import { ConditionOperator, type ITrigger } from '../../../types';
import { z } from 'zod';

export const newEmail: ITrigger = {
  id: 'new-email',
  name: 'New email',
  description: 'Triggered when a new email is received',

  fields: [
    {
      label: 'Polling interval',
      name: 'intervalMs',
      type: 'select',
      options: [
        { label: '1 min', value: 60000 },
        { label: '5 min', value: 300000 },
        { label: '10 min', value: 600000 },
      ],
      validations: () => z.number().nonnegative('Interval is required'),
    },
    {
      name: 'field',
      label: 'Select a field',
      type: 'select',
      options: [
        { value: 'subject', label: 'Subject' },
        { value: 'body', label: 'Body' },
      ],
      validations: () => z.string().nonempty('Field is required'),
    },
    {
      name: 'operator',
      label: 'Select an operator',
      type: 'select',
      options: [
        { value: ConditionOperator.CONTAINS, label: 'Contains' },
        { value: ConditionOperator.EQUAL, label: 'Equal' },
      ],
      validations: () => z.string().nonempty('Operator is required'),
    },
    {
      name: 'value',
      label: 'Value',
      type: 'text',
      validations: () => z.string().nonempty('Value is required'),
    },
  ],
};
