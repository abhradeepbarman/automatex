import z from 'zod';
import { ConditionOperator, type ITrigger } from '../../../types';

export const newMessage: ITrigger = {
  id: 'NEW_MESSAGE',
  name: 'New message',
  description: 'Triggered when a new message is received in a channel',
  pollingIntervalMs: 120,

  fields: [
    {
      name: 'channelId',
      label: 'Channel ID',
      type: 'select',
      placeholder: 'Select a channel',
      description: 'The Discord server/guild to monitor',
      dynamicOptions: {
        url: 'https://discord.com/api/users/@me/guilds',
        labelKey: 'name',
        valueKey: 'id',
      },
      validations: () => z.string().nonempty('Channel ID is required'),
    },
    {
      name: 'field',
      label: 'Select a field',
      type: 'select',
      options: [
        { value: 'subject', label: 'Subject' },
        { value: 'body', label: 'Body' },
        { value: 'content', label: 'Content' },
      ],
      disabled: true,
      defaultValue: 'content',
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
