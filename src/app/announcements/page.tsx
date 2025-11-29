
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { medicalNotifications } from '@/lib/data';
import { Calendar, Syringe, Info, TriangleAlert, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import en from '@/lib/locales/en.json';
import { Highlight } from '@/components/ui/highlight';
import { BackButton } from '@/components/layout/back-button';
import { Skeleton } from '@/components/ui/skeleton';

const languageFiles = { hi, bn, ta, te, mr, en };

const categoryIcons = {
    'WEATHER ADVISORY': TriangleAlert,
    'DISEASE PREVENTION': ShieldCheck,
    'PUBLIC HEALTH': Info,
    'VACCINATION': Syringe,
};

export default function AnnouncementsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const { user } = useUser();
  const firestore = useFirestore();
  const [translations, setTranslations] = React.useState(en);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile } = useDoc(userDocRef);

  const announcementsQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'announcements'));
  }, [firestore]);
  const { data: announcements, isLoading } = useCollection(announcementsQuery);

  React.useEffect(() => {
    const lang = userProfile?.preferredLanguage || 'en';
    setTranslations(languageFiles[lang] || en);
  }, [userProfile]);

  const t = (key: string, fallback: string) => translations[key] || fallback;
  
  const filteredNotifications = React.useMemo(() => {
    if (!announcements) return [];
    return announcements.filter(notification => {
        const title = notification.title.toLowerCase();
        const details = notification.details.toLowerCase();
        const category = notification.category.toLowerCase();
        const query = searchQuery.toLowerCase();
        return title.includes(query) || details.includes(query) || category.includes(query);
    });
  }, [announcements, searchQuery]);

  const AnnouncementSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
    </div>
  );

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
        <BackButton />
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
                {t('announcements_page_title', 'Announcements')}
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                {t('announcements_page_desc', 'Important health advisories and public announcements for the community.')}
            </p>
        </div>
        {isLoading ? <AnnouncementSkeleton /> : filteredNotifications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredNotifications.map((notification) => {
              const notificationTitle = t(notification.title_key, notification.title);
              const notificationDetails = t(notification.details_key, notification.details);
              const Icon = categoryIcons[notification.category] || Info;

              return (
              <Card key={notification.id} className={cn("w-full border-l-4", notification.borderColor)}>
                <Accordion type="single" collapsible className="w-full" defaultValue={searchQuery ? `item-${notification.id}` : undefined}>
                  <AccordionItem value={`item-${notification.id}`} className="border-b-0">
                    <AccordionTrigger className="p-6 hover:no-underline text-left w-full">
                      <div className="flex items-start w-full gap-4">
                        <Icon className={cn("h-6 w-6 mt-1", notification.color)} />
                        <div className="flex-1 space-y-2">
                          <h3 className="font-semibold text-lg text-left">
                            <Highlight text={notificationTitle} query={searchQuery} />
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className={cn("border-none text-xs font-bold", notification.color, notification.bgColor)}>
                              <Highlight text={t(notification.category.toLowerCase().replace(' ', '_'), notification.category)} query={searchQuery} />
                            </Badge>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(notification.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="pl-10">
                        <p className="text-muted-foreground">
                          <Highlight text={notificationDetails} query={searchQuery} />
                        </p>
                      </div>
                    </AccordionContent>
                    </AccordionItem>
                </Accordion>
              </Card>
            )})}
          </div>
        ) : (
          <Card className="text-center p-8">
            <CardTitle>No Announcements Found</CardTitle>
            <CardDescription>{searchQuery ? `Your search for "${searchQuery}" did not match any announcements.` : "There are currently no active announcements."}</CardDescription>
          </Card>
        )}
    </div>
  );
}
