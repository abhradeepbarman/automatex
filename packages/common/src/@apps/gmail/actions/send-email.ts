import z from 'zod';
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
      validations: () =>
        z.string().nonempty('To is required').email('Invalid email'),
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'text',
      required: true,
      validations: () => z.string().nonempty('Subject is required'),
    },
    {
      name: 'body',
      label: 'Body',
      type: 'textarea',
      required: true,
      validations: () => z.string().nonempty('Body is required'),
    },
  ],
};
