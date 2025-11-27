
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Volume2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';

const languageFiles = { hi, bn, ta, te, mr };

export default function MedicalHistoryPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
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
            where('recordType', '==', 'medicalHistory')
        );
    }, [user, firestore]);
    
    const { data: medicalHistory, isLoading } = useCollection(healthRecordsQuery);

    const handleTextToSpeech = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        } else {
             toast({
                variant: "destructive",
                title: t('unsupported_feature_toast_title', "Unsupported Feature"),
                description: t('unsupported_feature_toast_desc', "Text-to-speech is not supported in your browser."),
            });
        }
    };
    
    const SkeletonLoader = () => (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border bg-background p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ))}
      </div>
    );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <History className="h-6 w-6" />
          <CardTitle className="text-2xl">{t('medical_history_page_title', 'Medical History')}</CardTitle>
        </div>
        <CardDescription>
          {t('medical_history_page_desc', 'A summary of your past and present medical conditions as recorded by your doctor.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? <SkeletonLoader /> : medicalHistory && medicalHistory.length > 0 ? (
          medicalHistory
            .sort((a, b) => b.dateCreated?.toMillis() - a.dateCreated?.toMillis())
            .map((item) => (
            <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border bg-background p-4"
            >
                <div className='flex-1'>
                    <p>{item.details}</p>
                     <p className="text-xs text-muted-foreground mt-1">
                        Recorded on: {item.dateCreated ? new Date(item.dateCreated.seconds * 1000).toLocaleDateString() : 'N/A'}
                     </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleTextToSpeech(item.details)}>
                <Volume2 className="h-5 w-5 text-muted-foreground" />
                </Button>
            </div>
            ))
        ) : (
          !isLoading && <p className="text-muted-foreground text-center py-4">{t('no_medical_history_text', 'No medical history recorded yet.')}</p>
        )}
      </CardContent>
    </Card>
  );
}
