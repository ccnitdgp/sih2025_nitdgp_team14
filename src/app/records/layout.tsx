
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  BookUser,
  ScanText,
  FlaskConical,
  History,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';

const languageFiles = { hi, bn, ta, te, mr };

interface RecordsLayoutProps {
  children: React.ReactNode;
}

export default function RecordsLayout({ children }: RecordsLayoutProps) {
  const pathname = usePathname();
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

  const sidebarNavItems = [
    {
      title: t('medical_history_link', 'Medical History'),
      href: '/records/medical-history',
      icon: History,
    },
    {
      title: t('medical_details_link', 'Medical Details'),
      href: '/records/medical-details',
      icon: HeartPulse,
    },
    {
      title: t('prescriptions_link', 'Prescriptions'),
      href: '/records/prescriptions',
      icon: BookUser,
    },
    {
      title: t('analyze_prescription_link', 'Analyze Prescription'),
      href: '/records/analyze-prescription',
      icon: ScanText,
    },
    {
      title: t('lab_reports_link', 'Lab Reports'),
      href: '/records/lab-reports',
      icon: FlaskConical,
    },
    {
      title: t('vaccinations_link', 'Vaccination Records'),
      href: '/records/vaccination-records',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-4">
        <aside className="md:col-span-1">
          <div className="flex flex-col gap-4">
            <Button
              variant="ghost"
              asChild
              className="justify-start text-muted-foreground"
            >
              <Link href="/patient-dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('back_to_dashboard_button', 'Back to Dashboard')}
              </Link>
            </Button>
            <nav className="flex flex-col gap-2">
              {sidebarNavItems.map((item) => {
                 const isActive = pathname.includes(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </Link>
              )}
              )}
            </nav>
          </div>
        </aside>
        <main className="md:col-span-3">{children}</main>
      </div>
    </div>
  );
}
