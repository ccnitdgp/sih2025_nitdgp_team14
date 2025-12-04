
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const languageFiles = { hi, bn, ta, te, mr };

export default function VaccinationRecordsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [translations, setTranslations] = useState({});
  const { toast } = useToast();

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

  const handleDownload = async (record: any) => {
    if (!record.details?.downloadUrl || !record.details?.fileName) {
        toast({
            variant: "destructive",
            title: "Download failed",
            description: "The file URL is missing or invalid.",
        });
        return;
    }
    
    try {
        const response = await fetch(record.details.downloadUrl);
        if (!response.ok) throw new Error('Network response was not ok.');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', record.details.fileName);
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Download error:", error);
        toast({
            variant: "destructive",
            title: "Download failed",
            description: "Could not download the file. Please try again.",
        });
    }
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
