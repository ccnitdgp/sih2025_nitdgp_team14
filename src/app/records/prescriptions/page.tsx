
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookUser, FileDown, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useMemo } from 'react';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { dummyPdfContent } from '@/lib/dummy-pdf';
import { isPast, parseISO } from 'date-fns';
import Link from 'next/link';

const languageFiles = { hi, bn, ta, te, mr };

const PrescriptionCard = ({ item, t }) => {
    return (
        <Card className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-lg">{item.medication}</h3>
                    <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>{t(item.status.toLowerCase() + '_status', item.status)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    {item.dosage} - {t('prescribed_by_text', 'Prescribed by')} {item.doctorName} {t('on_date_text', 'on')} {item.date}
                </p>
            </div>
            <div className="flex items-center gap-2">
                 {item.status !== 'Active' && <Button asChild size="sm"><Link href="/appointments">Book Again</Link></Button>}
            </div>
        </Card>
    );
};

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

  const prescriptionsQuery = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return query(
        collection(firestore, 'prescriptions'),
        where('patientId', '==', user.uid)
      );
  }, [user, firestore]);
  
  const { data: prescriptions, isLoading } = useCollection(prescriptionsQuery);
  
  const { currentPrescriptions, pastPrescriptions } = useMemo(() => {
    if (!prescriptions) {
        return { currentPrescriptions: [], pastPrescriptions: [] };
    }

    const current: any[] = [];
    const past: any[] = [];
    const today = new Date();

    prescriptions.forEach(p => {
        const hasEnded = p.endDate && isPast(parseISO(p.endDate));
        if (p.status === 'Active' && !hasEnded) {
            current.push(p);
        } else {
            past.push(p);
        }
    });

    return { 
        currentPrescriptions: current.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        pastPrescriptions: past.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };
  }, [prescriptions]);


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
    <div className="space-y-8">
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
            <CardContent>
                <h3 className="text-lg font-semibold mb-4">Current Prescriptions</h3>
                <div className="space-y-4">
                    {isLoading ? <SkeletonLoader /> : currentPrescriptions.length > 0 ? (
                        currentPrescriptions.map(item => <PrescriptionCard key={item.id} item={item} t={t} />)
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No active prescriptions.</p>
                    )}
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <CalendarClock className="h-6 w-6" />
                    <CardTitle className="text-2xl">Past Prescriptions</CardTitle>
                </div>
                <CardDescription>
                    A history of your completed or expired prescriptions.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {isLoading ? <SkeletonLoader /> : pastPrescriptions.length > 0 ? (
                        pastPrescriptions.map(item => <PrescriptionCard key={item.id} item={item} t={t} />)
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No past prescriptions found.</p>
                    )}
            </CardContent>
        </Card>
    </div>
  );
}
