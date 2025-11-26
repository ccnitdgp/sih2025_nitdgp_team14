
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';

const languageFiles = { hi, bn, ta, te, mr };

const ContactDetail = ({ icon: Icon, title, value, href }) => (
  <div className="flex items-start gap-4">
    <div className="p-3 bg-primary/10 rounded-full mt-1">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <a href={href} className="text-muted-foreground hover:text-primary transition-colors">
        {value}
      </a>
    </div>
  </div>
);

export default function ContactPage() {
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
          {t('contact_page_title', 'Get In Touch')}
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          {t('contact_page_desc', 'We\'d love to hear from you. Here\'s how you can reach us.')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('contact_info_title', 'Contact Information')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <ContactDetail 
            icon={Mail} 
            title={t('general_inquiries_title', 'General Inquiries')}
            value="support@swasthya.example.com" 
            href="mailto:support@swasthya.example.com"
          />
          <ContactDetail 
            icon={Phone} 
            title={t('phone_support_title', 'Phone Support')}
            value="+91 98765 43210" 
            href="tel:+919876543210"
          />
          <ContactDetail 
            icon={MapPin} 
            title={t('our_office_title', 'Our Office')}
            value="123 Health St, Wellness City, India 400001" 
            href="#"
          />
        </CardContent>
      </Card>
    </div>
  );
}

    