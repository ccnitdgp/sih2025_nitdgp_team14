
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, CalendarDays, ArrowRight, Syringe } from "lucide-react";
import Link from "next/link";
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { vaccinationDrives } from "@/lib/data";
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { Skeleton } from "../ui/skeleton";

const languageFiles = { hi, bn, ta, te, mr };

export function VaccinationDriveSection() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(true);

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
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [userProfile]);

  const t = (key: string, fallback: string) => translations[key] || fallback;

  const RegisterButton = ({ driveId }) => {
    if (user) {
      return (
         <Button asChild variant="secondary" className="w-full">
            <Link href="/vaccination">
                {t('view_details_and_register_button', 'View Details & Register')}
            </Link>
        </Button>
      );
    }
    return (
      <AuthDialog 
        trigger={
           <Button variant="secondary" className="w-full">
                {t('view_details_and_register_button', 'View Details & Register')}
            </Button>
        }
      />
    );
  };
  
  const DriveSkeleton = () => (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-6 w-3/4" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-1/3" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );

  return (
    <section id="vaccination" className="py-12 sm:py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div className="text-left">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                    {t('upcoming_vaccination_drives_title', 'Upcoming Vaccination Drives')}
                </h2>
                <p className="mt-2 text-muted-foreground max-w-2xl">
                    {t('upcoming_vaccination_drives_desc', 'Find and register for vaccination drives in your area to stay protected.')}
                </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
                <Link href="/vaccination">
                    {t('view_all_drives_button', 'View All Drives')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
                <>
                    <DriveSkeleton />
                    <DriveSkeleton />
                    <DriveSkeleton />
                </>
            ) : vaccinationDrives && vaccinationDrives.length > 0 ? (
                vaccinationDrives.slice(0, 3).map((drive) => (
                <Card key={drive.id} className="flex flex-col transition-shadow hover:shadow-xl">
                    <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                        <Syringe className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>{t(drive.name_key, drive.name)}</CardTitle>
                    </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{t(drive.location_key, drive.location)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>{drive.date}</span>
                    </div>
                    </CardContent>
                    <CardFooter>
                    <RegisterButton driveId={drive.id} />
                    </CardFooter>
                </Card>
                ))
            ) : (
                 <Card className="md:col-span-3">
                    <CardHeader>
                    <CardTitle>No Vaccination Drives</CardTitle>
                    <CardDescription>There are no upcoming vaccination drives scheduled at this time.</CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
      </div>
    </section>
  );
}
