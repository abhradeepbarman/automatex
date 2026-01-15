import { ConditionOperator, ITrigger } from '../../../types';

const newEmail: ITrigger = {
  id: 'NEW_EMAIL',
  name: 'New email',
  description: 'Triggered when a new email is received',

  field: {
    name: 'field',
    label: 'Select a field',
    type: 'select',
    selectOptions: [
      { value: 'subject', label: 'Subject' },
      { value: 'body', label: 'Body' },
    ],
    required: false,
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

export default newEmail;
