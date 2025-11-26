'use client';

import { useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';

export function RoleRedirect() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    // Only run this on the client, and only on the /login-redirect page.
    if (typeof window === 'undefined' || pathname !== '/login-redirect') {
      return;
    }
    
    if (isUserLoading || isProfileLoading) {
      return; 
    }

    if (user && userProfile) {
      const { role } = userProfile;
      
      if (role === 'doctor') {
        router.replace('/doctor-dashboard');
      } else if (role === 'patient') {
        router.replace('/patient-dashboard');
      } else {
        // Fallback for users with no role or an unknown role
        router.replace('/');
      }
    } else if (!isUserLoading && !user) {
        // If the user is not logged in, send them to the homepage.
        router.replace('/');
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, router, pathname]);

  return null; // This component does not render anything
}
