'use client';

import { useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';

export function RoleRedirect() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (isUserLoading || isProfileLoading) {
      return; 
    }

    if (user && userProfile) {
      const { role } = userProfile;
      
      if (role === 'doctor') {
        router.push('/doctor-dashboard');
      } else if (role === 'patient') {
        router.push('/patient-dashboard');
      }
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, router]);

  return null; // This component does not render anything
}
