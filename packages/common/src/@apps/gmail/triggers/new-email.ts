import axios from 'axios';
import {
  ConditionOperator,
  PollingInterval,
  ReturnResponse,
  type ITrigger,
} from '../../../types';
import { z } from 'zod';

interface NewEmailMetadata {
  intervalMs: PollingInterval;
  field: 'subject' | 'body';
  operator: ConditionOperator;
  value: string;
}

export const newEmail: ITrigger<NewEmailMetadata> = {
  id: 'new-email',
  name: 'New email',
  description: 'Triggered when a new email is received',

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

  run: async (
    metadata,
    lastExecutedAt,
    accessToken,
  ): Promise<ReturnResponse> => {
    try {
      const { field, operator, value } = metadata;
      const lastExecuted = lastExecutedAt ? new Date(lastExecutedAt) : null;

      let query = 'q=is:unread';
      if (lastExecuted) {
        const seconds = Math.floor(lastExecuted.getTime() / 1000);
        query += ` after:${seconds}`;
      }

      const response = await axios.get(
        `https://www.googleapis.com/gmail/v1/users/me/messages?${query}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const messages = response.data.messages;
      if (!messages || messages.length === 0) {
        return {
          success: false,
          message: 'No new emails found',
        };
      }

      const detailedMessages = await Promise.all(
        messages.map(async (msg: any) => {
          try {
            const msgDetails = await axios.get(
              `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              },
            );
            return msgDetails.data;
          } catch (e) {
            console.error(`Failed to fetch message ${msg.id}`, e);
            return null;
          }
        }),
      );

      const validMessages = detailedMessages.filter((msg) => {
        if (!msg) return false;

        let contentToCheck = '';
        if (field === 'subject') {
          const headers = msg.payload.headers;
          const subjectHeader = headers.find(
            (h: any) => h.name.toLowerCase() === 'subject',
          );
          contentToCheck = subjectHeader ? subjectHeader.value : '';
        } else if (field === 'body') {
          contentToCheck = msg.snippet;
        }

        if (operator === ConditionOperator.CONTAINS) {
          return contentToCheck.toLowerCase().includes(value.toLowerCase());
        } else if (operator === ConditionOperator.EQUAL) {
          return contentToCheck === value;
        }

        return false;
      });

      if (validMessages.length === 0) {
        return {
          success: false,
          message: 'No matching emails found',
        };
      }

      return {
        success: true,
        message: 'New emails found',
        data: validMessages,
      };
    } catch (error) {
      console.error('Error executing new email trigger:', error);
      return {
        success: false,
        message: 'Error executing new email trigger',
      };
    }
  },
};
