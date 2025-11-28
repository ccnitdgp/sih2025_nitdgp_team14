
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
    <div className="text-muted-foreground space-y-4" dangerouslySetInnerHTML={{ __html: children }}/>
  </div>
);

export default function PrivacyPolicyPage() {
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
          {t('privacy_policy_title', 'Privacy Policy')}
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          {t('privacy_policy_last_updated', 'Last updated: {date}').replace('{date}', new Date().toLocaleDateString())}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <PolicySection title={t('privacy_policy_intro_title', '1. Introduction')}>
            {t('privacy_policy_intro_content', '<p>Welcome to Swasthya. We are committed to protecting your privacy and handling your personal health information with the utmost care and respect. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you use our application.</p>')}
          </PolicySection>

          <PolicySection title={t('privacy_policy_info_title', '2. Information We Collect')}>
            {`
              <p>${t('privacy_policy_info_content_1', 'We may collect information about you in a variety of ways. The information we may collect on the Service includes:')}</p>
              <ul class="list-disc list-inside space-y-2">
                <li>${t('privacy_policy_info_list_1', '<strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Service.')}</li>
                <li>${t('privacy_policy_info_list_2', '<strong>Health Data:</strong> Information related to your health, such as medical history, prescriptions, lab reports, and vaccination records, which you provide or is provided by your linked healthcare professionals.')}</li>
                <li>${t('privacy_policy_info_list_3', '<strong>Derivative Data:</strong> Information our servers automatically collect when you access the Service, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Service.')}</li>
              </ul>
            `}
          </PolicySection>
          
          <PolicySection title={t('privacy_policy_use_title', '3. Use of Your Information')}>
             {`
              <p>${t('privacy_policy_use_content_1', 'Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:')}</p>
              <ul class="list-disc list-inside space-y-2">
                <li>${t('privacy_policy_use_list_1', 'Create and manage your account.')}</li>
                <li>${t('privacy_policy_use_list_2', 'Email you regarding your account or order.')}</li>
                <li>${t('privacy_policy_use_list_3', 'Enable user-to-user communications.')}</li>
                <li>${t('privacy_policy_use_list_4', 'Generate a personal profile about you to make future visits to the Service more personalized.')}</li>
                <li>${t('privacy_policy_use_list_5', 'Increase the efficiency and operation of the Service.')}</li>
              </ul>
            `}
          </PolicySection>

          <PolicySection title={t('privacy_policy_security_title', '4. Security of Your Information')}>
            {t('privacy_policy_security_content', '<p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>')}
          </PolicySection>

           <PolicySection title={t('privacy_policy_contact_title', '5. Contact Us')}>
            {t('privacy_policy_contact_content', '<p>If you have questions or comments about this Privacy Policy, please contact us at: privacy@swasthya.example.com.</p>')}
          </PolicySection>
        </CardContent>
      </Card>
    </div>
  );
}

    