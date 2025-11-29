
'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Users,
  Activity,
  BarChart3,
  Heart,
  Repeat
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/layout/back-button';
import { AgeDistributionChart } from '@/components/admin/age-distribution-chart';
import { GenderDistributionChart } from '@/components/admin/gender-distribution-chart';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { DiseaseTrendChart } from '@/components/admin/disease-trend-chart';


type StatCardProps = {
  title: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  isLoading: boolean;
};

const StatCard = ({ title, value, icon: Icon, description, isLoading }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{value}</div>}
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function PatientDiseaseInsightsPage() {
    const firestore = useFirestore();

    const patientsQuery = useMemoFirebase(
        () => (firestore ? query(collection(firestore, 'users'), where('role', '==', 'patient')) : null),
        [firestore]
    );
    const { data: patients, isLoading: isLoadingPatients } = useCollection(patientsQuery);
  
  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <BackButton />
        <div className="space-y-8 mt-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Patient & Disease Insights
              </h1>
              <p className="text-muted-foreground">
                Demographic and epidemiological data analytics.
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Top Diagnosis"
                    value="Hypertension"
                    icon={Activity}
                    description="Most common condition this month"
                    isLoading={false}
                />
                <StatCard
                    title="Chronic Disease Count"
                    value="2,148"
                    icon={Heart}
                    description="Patients with diabetes or hypertension"
                    isLoading={false}
                />
                <StatCard
                    title="30-Day Readmission Rate"
                    value="2.1%"
                    icon={Repeat}
                    description="Patients readmitted within 30 days"
                    isLoading={false}
                />
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users />
                      Patient Age Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <AgeDistributionChart patients={patients} isLoading={isLoadingPatients} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users />
                      Patient Gender Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <GenderDistributionChart patients={patients} isLoading={isLoadingPatients} />
                  </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 />
                      Top 5 Reported Symptoms
                    </CardTitle>
                     <CardDescription>
                      Most frequently reported symptoms in the last 30 days.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center h-64 bg-muted rounded-md">
                     <p className="text-muted-foreground">[Top 5 Symptoms Bar Chart Placeholder]</p>
                  </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity />
                      Disease &amp; Symptom Trends
                    </CardTitle>
                    <CardDescription>
                      Reported cases of Influenza over the last 7 days.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DiseaseTrendChart />
                  </CardContent>
                </Card>
             </div>
        </div>
      </div>
    </div>
  );
}
