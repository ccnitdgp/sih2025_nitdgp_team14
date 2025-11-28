
'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { BackButton } from '@/components/layout/back-button';

const languageFiles = { hi, bn, ta, te, mr };

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [translations, setTranslations] = useState({});

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);

  useEffect(() => {
    if (userProfile?.preferredLanguage && languageFiles[userProfile.preferredLanguage]) {
      setTranslations(languageFiles[userProfile.preferredLanguage]);
    } else {
      setTranslations({});
    }
  }, [userProfile]);

  const t = (key: string, fallback: string) => translations[key] || fallback;

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/'); 
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="container mx-auto max-w-5xl px-6 py-12">
        <p>{t('loading_text', 'Loading...')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
        <BackButton />
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
                {t('my_notifications_page_title', 'My Notifications')}
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                {t('my_notifications_page_desc', 'A complete list of your personal reminders and alerts.')}
            </p>
        </div>
        {children}
    </div>
  );
}
