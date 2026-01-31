import { IAction } from '../../../types';

export const sendEmail: IAction = {
  id: 'send-email',
  name: 'Send email',
  description: 'Send an email',

  fields: [
    {
      name: 'to',
      label: 'To',
      type: 'email',
      required: true,
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      label: 'Body',
      type: 'textarea',
      required: true,
    },
  ],
};
