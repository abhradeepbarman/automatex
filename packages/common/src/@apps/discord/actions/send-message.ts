import z from 'zod';
import { type IAction } from '../../../types';

export const sendMessage: IAction = {
  id: 'SEND_MESSAGE',
  name: 'Send message',
  description: 'Send a message to a Discord channel',

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
      name: 'content',
      label: 'Message content',
      type: 'textarea',
      placeholder: 'Enter your message here',
      validations: () =>
        z
          .string()
          .nonempty('Message content is required')
          .max(2000, 'Message cannot exceed 2000 characters'),
    },
  ],
};
