
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FlaskConical, FileDown, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, where, or } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';

const languageFiles = { hi, bn, ta, te, mr };

export default function LabReportsPage() {
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
        where('recordType', 'in', ['labReport', 'scanReport'])
    );
  }, [user, firestore]);
  
  const { data: healthRecords, isLoading } = useCollection(healthRecordsQuery);

  const getIcon = (recordType: string) => {
    switch(recordType) {
        case 'labReport':
            return <FlaskConical className="h-5 w-5 text-primary" />;
        case 'scanReport':
            return <Scan className="h-5 w-5 text-primary" />;
        default:
            return <FileDown className="h-5 w-5 text-primary" />;
    }
  }

  const SkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-9 w-28" />
        </Card>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
         <div>
            <div className="flex items-center gap-3">
            <FlaskConical className="h-6 w-6" />
            <CardTitle className="text-2xl">{t('lab_reports_page_title', 'Lab & Scan Reports')}</CardTitle>
            </div>
            <CardDescription>
                {t('lab_reports_page_desc', 'View and manage your diagnostic lab and scan reports.')}
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? <SkeletonLoader /> : healthRecords && healthRecords.length > 0 ? (
            healthRecords.map((report) => (
              <Card key={report.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-primary/10 rounded-md">
                        {getIcon(report.recordType)}
                      </div>
                      <div className="flex-1">
                          <h3 className="font-semibold text-lg">{report.details.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                              {t('date_label', 'Date')}: {report.details.date} - {t('issued_by_label', 'Issued by')}: {report.details.issuer}
                          </p>
                      </div>
                  </div>
                   <Button variant="outline" size="sm" disabled>
                      <FileDown className="mr-2 h-4 w-4"/>
                      {t('download_button', 'Download')}
                  </Button>
              </Card>
            ))
        ) : (
          !isLoading && <p className="text-muted-foreground text-center py-4">{t('no_lab_reports_text', 'No lab reports uploaded yet.')}</p>
        )}
      </CardContent>
    </Card>
  );
}
