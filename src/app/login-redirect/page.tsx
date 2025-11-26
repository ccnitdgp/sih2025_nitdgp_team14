'use client';

import { RoleRedirect } from '@/components/auth/role-redirect';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginRedirectPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <RoleRedirect />
    </div>
  );
}
