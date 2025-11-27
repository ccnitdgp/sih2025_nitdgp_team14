
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShieldCheck, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { useState, useEffect, useMemo } from 'react';
import { collection, doc, query, where } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { dummyPdfContent } from '@/lib/dummy-pdf';
import { Skeleton } from '@/components/ui/skeleton';

const languageFiles = { hi, bn, ta, te, mr };

export default function VaccinationRecordsPage() {
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
  
  const healthRecordsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, `users/${user.uid}/healthRecords`),
        where('recordType', '==', 'vaccinationRecord')
    );
  }, [user, firestore]);
  
  const { data: vaccinationRecords, isLoading } = useCollection(healthRecordsQuery);

  const handleDownload = (record) => {
    const link = document.createElement('a');
    link.href = dummyPdfContent;
    const fileName = record.details?.fileName || `vaccination-certificate-${record.details.name.replace(/\s+/g, '-')}.pdf`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const SkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-9 w-40" />
        </Card>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6" />
          <CardTitle className="text-2xl">{t('vaccination_records_page_title', 'Vaccination Records')}</CardTitle>
        </div>
        <CardDescription>
          {t('vaccination_records_page_desc', 'Your history of vaccinations and immunizations.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? <SkeletonLoader /> : vaccinationRecords && vaccinationRecords.length > 0 ? (
          vaccinationRecords.map((record) => (
            <Card key={record.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{record.details?.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('administered_on_text', 'Administered on')} {record.details?.date} {t('at_text', 'at')} {record.details?.issuer}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDownload(record)}>
                <FileDown className="mr-2 h-4 w-4" />
                {t('download_certificate_button', 'Download Certificate')}
              </Button>
            </Card>
          ))
        ) : (
          !isLoading && <p className="text-muted-foreground text-center py-4">{t('no_vaccinations_text', 'No vaccination records found.')}</p>
        )}
      </CardContent>
    </Card>
  );
}
