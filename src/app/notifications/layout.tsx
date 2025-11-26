
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/'); 
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="container mx-auto max-w-5xl px-6 py-12">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
                My Notifications
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                A complete list of your personal reminders and alerts.
            </p>
        </div>
        {children}
    </div>
  );
}
