import z from 'zod';
import { type ITrigger } from '../../../types';

export const sendEmail: ITrigger = {
  id: 'SEND_EMAIL',
  name: 'Send email',
  description: 'Send an email to a recipient',

  scopes: ['https://mail.google.com/'],

  fields: [
    {
      name: 'to',
      label: 'To',
      type: 'text',
      validations: () =>
        z.string().nonempty('To is required').email('Invalid email'),
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'text',
      validations: () => z.string().nonempty('Subject is required'),
    },
    {
      name: 'body',
      label: 'Body',
      type: 'textarea',
      validations: () => z.string().nonempty('Body is required'),
    },
  ],
};
