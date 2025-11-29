
'use client';

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Card, CardTitle, CardDescription
} from '@/components/ui/card';
import { vaccinationDrives } from '@/lib/data';
import { Calendar, MapPin, Syringe } from 'lucide-react';
import { Highlight } from '@/components/ui/highlight';
import { useUser, useDoc, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { useToast } from '@/hooks/use-toast';
import { doc, collection } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import en from '@/lib/locales/en.json';
import { BackButton } from '@/components/layout/back-button';

const languageFiles = { hi, bn, ta, te, mr, en };

export default function VaccinationPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const { user } = useUser();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [translations, setTranslations] = useState(en);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);

  useEffect(() => {
    const lang = userProfile?.preferredLanguage || 'en';
    setTranslations(languageFiles[lang] || en);
  }, [userProfile]);

  const t = (key: string, fallback: string) => translations[key] || fallback;

  const handleRegister = (driveId: number, driveName: string) => {
    if (!user || !firestore || !userProfile) {
        toast({
            variant: 'destructive',
            title: 'Login Required',
            description: 'You must be logged in to register for a drive.',
        });
        return;
    }

    const registrationRef = collection(firestore, 'vaccinationRegistrations');
    addDocumentNonBlocking(registrationRef, {
        driveId: driveId,
        driveName: driveName,
        userId: user.uid,
        userName: `${userProfile.firstName} ${userProfile.lastName}`,
        registeredAt: new Date(),
    });

    toast({
      title: t('registration_successful_toast_title', 'Registration Successful!'),
      description: t('registration_successful_toast_desc', 'You have been successfully registered for the drive.'),
    });
  };

  const RegisterButton = ({ driveId, driveName }) => {
    if (user) {
      return <Button onClick={() => handleRegister(driveId, driveName)}>{t('register_now_button', 'Register Now')}</Button>;
    }
    return (
      <AuthDialog 
        trigger={
           <Button>{t('register_now_button', 'Register Now')}</Button>
        }
      />
    );
  };


  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <BackButton />
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
            {t('vaccination_page_title', 'Vaccination Drives')}
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t('vaccination_page_desc', 'Stay protected. Find information about upcoming vaccination drives near you.')}
          </p>
        </div>
        {vaccinationDrives.length > 0 ? (
          <div className="space-y-8">
              {vaccinationDrives.map((drive) => {
                const driveName = t(drive.name_key, drive.name);
                const driveDetails = t(drive.details_key, drive.details);
                const driveLocation = t(drive.location_key, drive.location);

                return (
                <Card key={drive.id} className="w-full transition-shadow hover:shadow-lg">
                  <Accordion type="single" collapsible className="w-full" defaultValue={searchQuery && (driveName.toLowerCase().includes(searchQuery) || driveDetails.toLowerCase().includes(searchQuery)) ? `item-${drive.id}` : undefined}>
                    <AccordionItem value={`item-${drive.id}`} className="border-b-0">
                      <AccordionTrigger className="p-6 hover:no-underline text-left">
                        <div className="flex items-start w-full gap-4">
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Syringe className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <h3 className="font-semibold text-lg">
                              <Highlight text={driveName} query={searchQuery} />
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{driveLocation}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{drive.date}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="pl-16 space-y-4">
                          <p className="text-muted-foreground">
                            <Highlight text={driveDetails} query={searchQuery} />
                          </p>
                          <RegisterButton driveId={drive.id} driveName={drive.name} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              )})}
          </div>
        ) : (
          <Card className="text-center p-8">
            <CardTitle>No Vaccination Drives Scheduled</CardTitle>
            <CardDescription>Please check back later for information on upcoming drives.</CardDescription>
          </Card>
        )}
      </div>
    </div>
  );
}
