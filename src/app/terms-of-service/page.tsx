
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { BackButton } from "@/components/layout/back-button";


const languageFiles = { hi, bn, ta, te, mr };


const PolicySection = ({ title, children }) => (
  <div className="space-y-2">
    <h2 className="text-xl font-semibold text-foreground">{title}</h2>
    <div className="text-muted-foreground space-y-4">
      <p>{children}</p>
    </div>
  </div>
);

export default function TermsOfServicePage() {
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
      <BackButton />
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
          {t('tos_title', 'Terms of Service')}
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          {t('tos_last_updated', 'Last updated: {date}').replace('{date}', new Date().toLocaleDateString())}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <PolicySection title={t('tos_agreement_title', '1. Agreement to Terms')}>
            {t('tos_agreement_content', 'By using our services, you agree to be bound by these Terms. If you don’t agree to be bound by these Terms, do not use the Services. Our services are for informational purposes only and are not a substitute for professional medical advice, diagnosis, or treatment.')}
          </PolicySection>

          <PolicySection title={t('tos_accounts_title', '2. User Accounts')}>
            {t('tos_accounts_content', 'You are responsible for safeguarding your account, so use a strong password and limit its use to this account. We cannot and will not be liable for any loss or damage arising from your failure to comply with the above. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.')}
          </PolicySection>
          
          <PolicySection title={t('tos_ai_title', '3. AI-Generated Content')}>
            {t('tos_ai_content', 'The application may use artificial intelligence to provide health suggestions, analyze prescriptions, and answer questions. This content is provided for informational purposes only. It is not medical advice. You must always consult with a qualified healthcare professional for any medical concerns. We are not liable for any decisions made based on AI-generated content.')}
          </PolicySection>

          <PolicySection title={t('tos_liability_title', '4. Limitation of Liability')}>
            {t('tos_liability_content', 'To the maximum extent permitted by law, Swasthya shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the services.')}
          </PolicySection>

           <PolicySection title={t('tos_contact_title', '5. Contact Us')}>
            {t('tos_contact_content', 'If you have any questions about these Terms, please contact us at: legal@swasthya.example.com.')}
          </PolicySection>
        </CardContent>
      </Card>
    </div>
  );
}

    