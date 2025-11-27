
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
import { vaccinationRecords } from '@/lib/data';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { dummyPdfContent } from '@/lib/dummy-pdf';

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

  const handleDownload = (record) => {
    const link = document.createElement('a');
    link.href = dummyPdfContent;
    link.download = `vaccination-certificate-${record.vaccine.replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        {vaccinationRecords.length > 0 ? (
          vaccinationRecords.map((record) => (
            <Card key={record.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{record.vaccine} - {t('dose_text', 'Dose')} {record.dose}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('administered_on_text', 'Administered on')} {record.date} {t('at_text', 'at')} {record.location}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDownload(record)}>
                <FileDown className="mr-2 h-4 w-4" />
                {t('download_certificate_button', 'Download Certificate')}
              </Button>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-4">{t('no_vaccinations_text', 'No vaccination records found.')}</p>
        )}
      </CardContent>
    </Card>
  );
}
