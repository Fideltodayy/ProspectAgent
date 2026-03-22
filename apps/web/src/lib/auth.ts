import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from './db';

/**
 * Get or create the database User record for the current Clerk session.
 * Call this in server components or API routes that need the DB user.
 */
export async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';

  const user = await db.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: { clerkId: userId, email },
  });

  return user;
}

/**
 * Require auth — throw if not authenticated. For use in API routes.
 */
export async function requireAuth() {
  const user = await getDbUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
