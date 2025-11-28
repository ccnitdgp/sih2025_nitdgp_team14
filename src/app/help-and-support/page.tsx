
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import en from '@/lib/locales/en.json';
import { BackButton } from "@/components/layout/back-button";

const languageFiles = { hi, bn, ta, te, mr, en };

export default function HelpAndSupportPage() {
  const { user } = useUser();
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
  
  const faqs = [
    {
      question_key: 'faq_q1',
      question_fallback: 'How do I book an appointment?',
      answer_key: 'faq_a1',
      answer_fallback: 'You can book an appointment by navigating to the "Book Appointment" page. From there, you can use the AI Symptom Checker to find a specialist or browse through the list of available doctors. Select a doctor, choose an available date and time slot, and confirm your booking.',
    },
    {
      question_key: 'faq_q2',
      question_fallback: 'Where can I see my medical records?',
      answer_key: 'faq_a2',
      answer_fallback: 'Your medical records, including medical history, prescriptions, lab reports, and vaccination records, are available in the "My Health Records" section of your patient dashboard. You can also access them through the main navigation under "Records".',
    },
    {
      question_key: 'faq_q3',
      question_fallback: 'How do I change my password?',
      answer_key: 'faq_a3',
      answer_fallback: 'You can change your password by going to the "Settings" page, which is accessible from the user menu in the top-right corner. Under "Account & Personal Settings", you will find an option to "Change Password".',
    },
    {
      question_key: 'faq_q4',
      question_fallback: 'How does the AI Prescription Analyzer work?',
      answer_key: 'faq_a4',
      answer_fallback: 'Navigate to "Analyze Prescription" from your dashboard. Upload a clear photo of your prescription, and our AI tool will automatically extract details like the doctor\'s name, date, and a list of medications with their dosage and use. Please note this is for informational purposes and is not a substitute for professional medical advice.',
    },
    {
      question_key: 'faq_q5',
      question_fallback: 'How do I change the application language?',
      answer_key: 'faq_a5',
      answer_fallback: 'You can change the application language from the "Settings" page. Look for the "Language Selection" option under "Account & Personal Settings" and choose your preferred language from the dropdown menu.',
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <BackButton />
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
          {t('help_support_title', 'Help & Support')}
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          {t('help_support_desc', 'Find answers to frequently asked questions about using Swasthya.')}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{t(faq.question_key, faq.question_fallback)}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t(faq.answer_key, faq.answer_fallback)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
