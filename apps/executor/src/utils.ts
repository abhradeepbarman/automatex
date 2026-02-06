import db from '@repo/db';
import { connections } from '@repo/db/schema';
import { eq } from 'drizzle-orm';
import type { IApp } from '@repo/common/types';

/**
 * Refreshes an expired access token and updates the connection in the database
 * @param connectionId - The ID of the connection to refresh
 * @param app - The app configuration containing auth methods
 * @throws Error if connection not found, app has no auth, or connection has no refresh token
 */
export async function getRefreshTokenAndUpdate(
  connectionId: string,
  app: IApp,
): Promise<void> {
  const connection = await db.query.connections.findFirst({
    where: eq(connections.id, connectionId),
  });

  if (!connection) {
    throw new Error('Connection not found');
  }

  if (!app.auth) {
    throw new Error('App has no auth');
  }

  if (!connection.refreshToken) {
    throw new Error('Connection has no refresh token');
  }

  const { access_token, refresh_token, expires_in } =
    await app.auth.refreshAccessToken(connection.refreshToken);

  await db
    .update(connections)
    .set({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(Date.now() + expires_in * 1000),
    })
    .where(eq(connections.id, connectionId));
}
