
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { visitingCamps } from "@/lib/data";
import { MapPin, CalendarDays, ArrowRight, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';

const languageFiles = { hi, bn, ta, te, mr };

export function VisitingCampsSection() {
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
    <section id="camps" className="py-12 sm:py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div className="text-left">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                    {t('free_health_camps_title', 'Free Health Check-up Camps')}
                </h2>
                <p className="mt-2 text-muted-foreground max-w-2xl">
                    {t('free_health_camps_desc', 'Get details about upcoming health camps near you for free consultations and check-ups.')}
                </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
                <Link href="/camps">
                    {t('view_all_camps_button', 'View All Camps')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visitingCamps.slice(0,3).map((camp) => (
            <Card key={camp.id} className="flex flex-col transition-shadow hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Stethoscope className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{camp.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{camp.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>{camp.date}</span>
                </div>
              </CardContent>
              <CardFooter>
                 <Button asChild variant="secondary" className="w-full">
                    <Link href="/camps">
                      {t('learn_more_button', 'Learn More')}
                    </Link>
                  </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

    