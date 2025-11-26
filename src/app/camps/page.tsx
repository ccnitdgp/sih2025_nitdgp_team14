
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
} from '@/components/ui/card';
import { visitingCamps } from '@/lib/data';
import { Calendar, MapPin, Stethoscope } from 'lucide-react';
import { Highlight } from '@/components/ui/highlight';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';

const languageFiles = { hi, bn, ta, te, mr };

export default function CampsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
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

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
            {t('camps_page_title', 'Visiting Medical Camps')}
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t('camps_page_desc', 'Find information about upcoming free health camps organized for your community.')}
          </p>
        </div>
        <div className="space-y-8">
          {visitingCamps.map((camp) => (
            <Card key={camp.id} className="w-full transition-shadow hover:shadow-lg">
              <Accordion type="single" collapsible className="w-full" defaultValue={searchQuery && (camp.name.toLowerCase().includes(searchQuery) || camp.details.toLowerCase().includes(searchQuery)) ? `item-${camp.id}` : undefined}>
                <AccordionItem value={`item-${camp.id}`} className="border-b-0">
                  <AccordionTrigger className="p-6 hover:no-underline text-left">
                    <div className="flex items-start w-full gap-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Stethoscope className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-lg">
                          <Highlight text={camp.name} query={searchQuery} />
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{camp.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{camp.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="pl-16">
                      <p className="text-muted-foreground">
                        <Highlight text={camp.details} query={searchQuery} />
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

    