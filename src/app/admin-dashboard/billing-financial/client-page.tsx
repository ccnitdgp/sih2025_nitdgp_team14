
'use client';

import { Suspense } from 'react';
import { BackButton } from '@/components/layout/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, DollarSign, Receipt, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';

const StatCard = dynamic(() => import('@/components/admin/stat-card').then(mod => mod.StatCard), {
  loading: () => <Skeleton className="h-28 w-full" />,
});

export default function BillingFinancialClientPage() {
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
              value="Rs. 1,24,530"
              icon={DollarSign}
              description="From all paid invoices"
            />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-28 w-full" />}>
            <StatCard
              title="Total Outstanding Dues"
              value="Rs. 12,870"
              icon={Receipt}
              description="From 15 pending bills"
            />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-28 w-full" />}>
            <StatCard
              title="Average Bill Value"
              value="Rs. 830"
              icon={TrendingUp}
              description="Average per paid invoice"
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
