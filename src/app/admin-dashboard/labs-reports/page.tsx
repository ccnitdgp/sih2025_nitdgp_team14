
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
  Clock,
  AlertTriangle,
  BarChart3,
  Percent,
  FileText
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/layout/back-button';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where } from 'firebase/firestore';


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

export default function LabsReportsPage() {
  const firestore = useFirestore();
  const reportsQuery = useMemoFirebase(
      () => query(collectionGroup(firestore, 'healthRecords'), where('recordType', 'in', ['labReport', 'scanReport'])),
      [firestore]
  );
  const { data: reports, isLoading } = useCollection(reportsQuery);
  
  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <BackButton />
        <div className="space-y-8 mt-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Labs &amp; Reports Analytics
              </h1>
              <p className="text-muted-foreground">
                Metrics for diagnostic turnaround times and results.
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                <StatCard
                    title="Total Reports"
                    value={reports?.length.toString() || '0'}
                    icon={FileText}
                    description="Total lab and scan reports uploaded"
                    isLoading={isLoading}
                />
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 />
                      Top 5 Ordered Tests
                    </CardTitle>
                     <CardDescription>
                      Most frequently ordered lab tests in the last 30 days.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center h-64 bg-muted rounded-md">
                     <p className="text-muted-foreground">[Top 5 Tests Bar Chart Placeholder]</p>
                  </CardContent>
                </Card>
             </div>
        </div>
      </div>
    </div>
  );
}
