
'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { medicalNotifications } from '@/lib/data';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import en from '@/lib/locales/en.json';

const languageFiles = { hi, bn, ta, te, mr, en };

export default function AnnouncementsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [translations, setTranslations] = React.useState(en);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);

  React.useEffect(() => {
    const lang = userProfile?.preferredLanguage || 'en';
    setTranslations(languageFiles[lang] || en);
  }, [userProfile]);

  const t = (key: string, fallback: string) => translations[key] || fallback;

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
                {t('announcements_page_title', 'Announcements')}
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                {t('announcements_page_desc', 'Important health advisories and public announcements for the community.')}
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {medicalNotifications.map((notification) => (
            <Card key={notification.id} className={cn("w-full border-l-4", notification.borderColor)}>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={`item-${notification.id}`} className="border-b-0">
                  <AccordionTrigger className="p-6 hover:no-underline text-left w-full">
                    <div className="flex items-start w-full gap-4">
                      <notification.Icon className={cn("h-6 w-6 mt-1", notification.color)} />
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-lg text-left">{t(notification.title_key, notification.title)}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className={cn("border-none text-xs font-bold", notification.color, notification.bgColor)}>
                            {t(notification.i18n_category_key, notification.category)}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{notification.date}</span>
                          </div>
                        </div>
                      </div>
                       <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="pl-10">
                      <p className="text-muted-foreground">{t(notification.details_key, notification.details)}</p>
                    </div>
                  </AccordionContent>
                  </AccordionItem>
              </Accordion>
            </Card>
          ))}
        </div>
    </div>
  );
}
