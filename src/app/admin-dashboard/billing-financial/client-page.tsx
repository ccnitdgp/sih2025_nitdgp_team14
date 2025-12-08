
'use client';

import { Suspense, useMemo } from 'react';
import { BackButton } from '@/components/layout/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, DollarSign, Receipt, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where } from 'firebase/firestore';

const StatCard = dynamic(() => import('@/components/admin/stat-card').then(mod => mod.StatCard), {
  loading: () => <Skeleton className="h-28 w-full" />,
});

export default function BillingFinancialClientPage() {
    const firestore = useFirestore();

    const billsQuery = useMemoFirebase(() => 
        firestore ? query(collectionGroup(firestore, 'healthRecords'), where('recordType', '==', 'bill')) : null,
        [firestore]
    );
    const { data: bills, isLoading: isLoadingBills } = useCollection(billsQuery);

    const financialStats = useMemo(() => {
        if (!bills) return { totalRevenue: 0, outstandingDues: 0, averageBillValue: 0, outstandingCount: 0 };

        const paidBills = bills.filter(b => b.details.status === 'Paid');
        const outstandingBills = bills.filter(b => b.details.status === 'Due');
        
        const totalRevenue = paidBills.reduce((sum, bill) => sum + bill.details.amount, 0);
        const outstandingDues = outstandingBills.reduce((sum, bill) => sum + bill.details.amount, 0);
        const averageBillValue = paidBills.length > 0 ? totalRevenue / paidBills.length : 0;

        return {
            totalRevenue,
            outstandingDues,
            averageBillValue,
            outstandingCount: outstandingBills.length
        }
    }, [bills]);


  return (
    <>
      <BackButton />
      <div className="space-y-8 mt-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Financials</h1>
          <p className="text-muted-foreground">Metrics for platform revenue and outstanding payments.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Suspense fallback={<Skeleton className="h-28 w-full" />}>
            <StatCard
              title="Total Revenue (All Time)"
              value={`Rs. ${financialStats.totalRevenue.toLocaleString('en-IN')}`}
              icon={DollarSign}
              description="From all paid invoices"
              isLoading={isLoadingBills}
            />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-28 w-full" />}>
            <StatCard
              title="Total Outstanding Dues"
              value={`Rs. ${financialStats.outstandingDues.toLocaleString('en-IN')}`}
              icon={Receipt}
              description={`From ${financialStats.outstandingCount} pending bills`}
              isLoading={isLoadingBills}
            />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-28 w-full" />}>
            <StatCard
              title="Average Bill Value"
              value={`Rs. ${financialStats.averageBillValue.toFixed(0)}`}
              icon={TrendingUp}
              description="Average per paid invoice"
              isLoading={isLoadingBills}
            />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 />
                Revenue Trend (Last 30 Days)
              </CardTitle>
              <CardDescription>Daily revenue collected over the past month.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-64 bg-muted rounded-md">
              <p className="text-muted-foreground">[Revenue Trend Line Chart Placeholder]</p>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 />
                Revenue by Service
              </CardTitle>
              <CardDescription>Breakdown of revenue from different services.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-64 bg-muted rounded-md">
              <p className="text-muted-foreground">[Revenue by Service Bar Chart Placeholder]</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
