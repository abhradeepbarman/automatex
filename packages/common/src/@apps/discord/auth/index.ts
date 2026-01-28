import axios from 'axios';
import { TokenResponse } from '../../../types';

export const getAuthUrl = (): string => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  const response_type = 'code';
  const scopes = ['identify', 'email', 'guilds', 'messages.read'];

  const authUrl = new URL('https://discord.com/oauth2/authorize');
  authUrl.searchParams.append('client_id', clientId!);
  authUrl.searchParams.append('redirect_uri', redirectUri!);
  authUrl.searchParams.append('response_type', response_type);
  authUrl.searchParams.append('scope', scopes.join(' '));
  return authUrl.toString();
};

export const getToken = async (code: string): Promise<TokenResponse> => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  const API_ENDPOINT = 'https://discord.com/api/v10';
  const data = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri!,
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const response = await axios.post(
    `${API_ENDPOINT}/oauth2/token`,
    new URLSearchParams(data).toString(),
    {
      headers,
      auth: {
        username: clientId!,
        password: clientSecret!,
      },
    },
  );

  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
    expires_in: response.data.expires_in,
  };
};

export const getUserInfo = async (
  accessToken: string,
): Promise<{ id: string; name: string; email: string }> => {
  const { data } = await axios.get('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    id: data.id,
    name: data.username,
    email: data.email,
  };
};
