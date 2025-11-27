
'use client';

import { useState, useEffect } from 'react';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { stats } from "@/lib/data";
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { HeartPulse, Stethoscope, Syringe } from 'lucide-react';

const languageFiles = { hi, bn, ta, te, mr };

const staticStats = [
  {
    id: 1,
    name: 'stat_vaccination_drives',
    value: '0+',
    icon: Syringe,
  },
  {
    id: 2,
    name: 'stat_health_camps',
    value: '0+',
    icon: Stethoscope,
  },
  {
    id: 3,
    name: 'stat_records_secured',
    value: '0+',
    icon: HeartPulse,
  },
];


export function StatsSection() {
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

  const displayStats = stats.length > 0 ? stats : staticStats;

  return (
    <section className="py-12 sm:py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {displayStats.map((stat) => (
            <Card key={stat.id} className="text-center transition-all duration-300 hover:scale-105 hover:shadow-xl border-t-4 border-primary">
              <CardHeader className="flex flex-col items-center gap-4 pb-2">
                <div className="p-4 bg-primary/10 rounded-full">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-5xl font-bold">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-semibold">{t(stat.name, stat.name.replace(/_/g, ' '))}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
