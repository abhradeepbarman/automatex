import { ConditionOperator, ITrigger } from '../../../types';

const newMessage: ITrigger = {
  id: 'NEW_MESSAGE',
  name: 'New message',
  description: 'Triggered when a new message is received',

  field: {
    name: 'field',
    label: 'Select a field',
    type: 'select',
    selectOptions: [
      { value: 'subject', label: 'Subject' },
      { value: 'body', label: 'Body' },
    ],
    required: false,
    disabled: true,
  },

  operator: {
    name: 'operator',
    label: 'Select an operator',
    type: 'select',
    selectOptions: [
      { value: ConditionOperator.CONTAINS, label: 'Contains' },
      { value: ConditionOperator.EQUAL, label: 'Equal' },
      { value: ConditionOperator.NOT_EQUAL, label: 'Not equal' },
    ],
    required: false,
  },

  value: {
    name: 'value',
    label: 'Value',
    type: 'text',
    required: false,
  },
};

export default newMessage;
