/** * User Profile Component * Displays current user information */ 'use client';
import { useSession } from 'next-auth/react';
import SignOutButton from './SignOutButton';
export default function UserProfile() {
  const { data: session, status } = useSession();
  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 dark:border-muted-foreground"></div>
        <span className="text-gray-400 dark:text-muted-foreground">Loading...</span>
      </div>
    );
  }
  if (!session) {
    return null;
  }
  return (
    <div className="flex items-center gap-4">
      {session.user?.image && (
        <img
          src={session.user.image}
          alt={session.user.name ?? 'User'}
          className="w-10 h-10 rounded-full border-2 border-gray-700 dark:border-border"
        />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-white dark:text-foreground">
          {session.user?.name ?? session.user?.email}
        </span>
        {session.user?.email && session.user?.name && (
          <span className="text-xs text-gray-400 dark:text-muted-foreground">{session.user.email}</span>
        )}
      </div>
      <SignOutButton variant="secondary" />
    </div>
  );
}
