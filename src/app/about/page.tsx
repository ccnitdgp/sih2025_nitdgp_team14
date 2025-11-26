
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Target, Users } from "lucide-react";
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';

const languageFiles = { hi, bn, ta, te, mr };

export default function AboutPage() {
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
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
          {t('about_page_title', 'About Swasthya')}
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          {t('about_page_desc', 'Our mission is to make healthcare accessible and manageable for everyone, everywhere.')}
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><Target className="h-6 w-6 text-primary"/> {t('our_mission_title', 'Our Mission')}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              {t('our_mission_content', 'In a world where access to healthcare can be fragmented and complex, Swasthya was born out of a simple idea: to create a unified platform that empowers individuals to take control of their health journey. We aim to bridge the gap between patients and healthcare providers by providing intuitive, accessible, and secure digital health services. From finding local health drives to managing personal medical records, our goal is to put essential healthcare information at your fingertips.')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><Info className="h-6 w-6 text-primary"/> {t('what_we_do_title', 'What We Do')}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              {t('what_we_do_content', 'Swasthya is a comprehensive digital health platform designed to serve communities by providing timely information on vaccination drives and health camps. For individuals, we offer a secure space to manage personal and family medical records, book appointments, and interact with healthcare professionals. Our AI-powered tools provide helpful suggestions and analyze prescriptions to make understanding your health easier than ever before. We are committed to leveraging technology to foster a healthier tomorrow for everyone.')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><Users className="h-6 w-6 text-primary"/> {t('our_team_title', 'Our Team')}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              {t('our_team_content', 'We are a passionate team of developers, healthcare professionals, and designers dedicated to revolutionizing the digital health space. We believe in a future where healthcare is not a privilege but a right, and we are working tirelessly to build the tools that will make that future a reality.')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    