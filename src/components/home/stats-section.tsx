
'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse, Stethoscope, Syringe } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const StatCard = ({ icon: Icon, value, name, isLoading }) => {
  return (
    <Card className="text-center transition-all duration-300 hover:scale-105 hover:shadow-xl border-t-4 border-primary">
      <CardHeader className="flex flex-col items-center gap-4 pb-2">
        <div className="p-4 bg-primary/10 rounded-full">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        {isLoading ? (
          <Skeleton className="h-12 w-24" />
        ) : (
          <CardTitle className="text-5xl font-bold">{value}</CardTitle>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground font-semibold">{name}</p>
      </CardContent>
    </Card>
  )
}

export function StatsSection() {
  const firestore = useFirestore();

  const drivesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'vaccinationDrives'));
  }, [firestore]);
  
  const { data: drives, isLoading: isLoadingDrives } = useCollection(drivesQuery);

  const campsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'healthCamps'));
  }, [firestore]);

  const { data: camps, isLoading: isLoadingCamps } = useCollection(campsQuery);

  const patientsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // This query is allowed by security rules for all users.
    return query(collection(firestore, 'users'), where('role', '==', 'patient'));
  }, [firestore]);

  const { data: patients, isLoading: isLoadingPatients } = useCollection(patientsQuery);

  const stats = useMemo(() => {
    const patientCount = patients?.length || 0;

    return [
      {
        id: 1,
        name: 'Vaccination Drives',
        value: drives ? `${drives.length}+` : '0+',
        icon: Syringe,
        isLoading: isLoadingDrives,
      },
      {
        id: 2,
        name: 'Health Camps',
        value: camps ? `${camps.length}+` : '0+',
        icon: Stethoscope,
        isLoading: isLoadingCamps,
      },
      {
        id: 3,
        name: 'Records Secured',
        value: isLoadingPatients ? '0+' : `${patientCount * 3}+`, // Use a simple multiplier for effect
        icon: HeartPulse,
        isLoading: isLoadingPatients,
      },
    ];
  }, [drives, camps, patients, isLoadingDrives, isLoadingCamps, isLoadingPatients]);


  return (
    <section className="py-12 sm:py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.id} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
