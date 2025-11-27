
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookUser, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';

const languageFiles = { hi, bn, ta, te, mr };

export default function PrescriptionsPage() {
  const { user } = useUser();
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

  const prescriptionsRef = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return collection(firestore, `users/${user.uid}/healthRecords`);
  }, [user, firestore]);
  
  const { data: prescriptions, isLoading } = useCollection(prescriptionsRef);

  const SkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-9 w-28" />
        </Card>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
        <BookUser className="h-6 w-6" />
        <CardTitle className="text-2xl">{t('prescriptions_page_title', 'Prescriptions')}</CardTitle>
        </div>
        <CardDescription>
        {t('prescriptions_page_desc', 'Your prescribed medications and their details.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? <SkeletonLoader /> : prescriptions && prescriptions.length > 0 ? (
          prescriptions
            .filter(item => item.recordType === 'prescription')
            .map((item) => (
            <Card key={item.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-lg">{item.details?.medication}</h3>
                        <Badge variant={item.details?.status === 'Active' ? 'default' : 'secondary'}>{t(item.details?.status.toLowerCase() + '_status', item.details?.status)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {item.details?.dosage} - {t('prescribed_by_text', 'Prescribed by')} {item.details?.doctor} {t('on_date_text', 'on')} {item.details?.date}
                    </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                    <FileDown className="mr-2 h-4 w-4"/>
                    {t('download_button', 'Download')}
                </Button>
            </Card>
        ))) : (
          !isLoading && <p className="text-muted-foreground text-center py-4">{t('no_prescriptions_text', 'No prescriptions recorded yet.')}</p>
        )}
      </CardContent>
    </Card>
  );
}
