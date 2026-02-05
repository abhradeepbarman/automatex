import z from 'zod';
import { IAction, ReturnResponse } from '../../../types';
import axios from 'axios';

interface SendEmailMetadata {
  to: string;
  subject: string;
  body: string;
}

export const sendEmail: IAction<SendEmailMetadata> = {
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

  run: async (metadata, accessToken): Promise<ReturnResponse> => {
    try {
      const { to, subject, body } = metadata;
      const emailContent = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset="UTF-8"',
        'MIME-Version: 1.0',
        '',
        body,
      ].join('\r\n');

      const encodedEmail = Buffer.from(emailContent)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const postData = JSON.stringify({
        raw: encodedEmail,
      });

      const response = await axios.post(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        postData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200) {
        return {
          success: true,
          message: 'Email sent successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to send email',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send email',
      };
    }
  },
};
