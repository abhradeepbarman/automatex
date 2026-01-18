import z from 'zod';
import { ConditionOperator, type ITrigger } from '../../../types';

const newMessage: ITrigger = {
  id: 'NEW_MESSAGE',
  name: 'New message',
  description: 'Triggered when a new message is received',

  scopes: ['chat:write:bot', 'chat:write:user'],

  fields: [
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
        { value: ConditionOperator.NOT_EQUAL, label: 'Not equal' },
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

export default newMessage;
