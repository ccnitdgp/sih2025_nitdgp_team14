'use client';
import { Twitter, Facebook, Instagram } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';

const languageFiles = { hi, bn, ta, te, mr };

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
];

const footerLinks = [
  { href: "/about", label: "About Us", i18n_key: "footer_about_us" },
  { href: "/contact", label: "Contact", i18n_key: "footer_contact" },
  { href: "/privacy-policy", label: "Privacy Policy", i18n_key: "footer_privacy_policy" },
  { href: "/terms-of-service", label: "Terms of Service", i18n_key: "footer_terms_of_service" },
  { href: "/submit-feedback", label: "Submit Feedback", i18n_key: "footer_feedback" },
  { href: "/help-and-support", label: "Help & Support", i18n_key: "footer_help_support" },
];

const serviceLinks = [
    { href: "/vaccination", label: "Vaccination Drives", i18n_key: "vaccination_drive_link" },
    { href: "/camps", label: "Health Camps", i18n_key: "visiting_camps_link" },
    { href: "/announcements", label: "Announcements", i18n_key: "announcements_link" },
]

export function Footer() {
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
    <footer className="bg-card border-t">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              {t('footer_tagline', 'Your health, our priority. Easy access to healthcare services.')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 lg:col-span-2 sm:grid-cols-3">
            <div>
              <h3 className="font-semibold text-foreground">{t('footer_quick_links', 'Quick Links')}</h3>
              <ul className="mt-4 space-y-2">
                {footerLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {t(link.i18n_key, link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t('footer_services', 'Services')}</h3>
              <ul className="mt-4 space-y-2">
                {serviceLinks.map((link) => (
                    <li key={link.i18n_key}>
                        <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                            {t(link.i18n_key, link.label)}
                        </Link>
                    </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t('footer_follow_us', 'Follow Us')}</h3>
              <div className="flex mt-4 space-x-4">
                {socialLinks.map((social) => (
                  <Link key={social.name} href={social.href} className="text-muted-foreground hover:text-foreground" aria-label={social.name}>
                    <social.icon className="h-6 w-6" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>{t('footer_copyright', '© {year} Swasthya. All rights reserved.').replace('{year}', new Date().getFullYear().toString())}</p>
        </div>
      </div>
    </footer>
  );
}
