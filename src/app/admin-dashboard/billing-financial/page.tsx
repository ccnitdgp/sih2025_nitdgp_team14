
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  DollarSign,
  Receipt,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/layout/back-button';
import { DashboardFilters } from '@/components/admin/dashboard-filters';

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

export default function BillingFinancialPage() {
  
  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <BackButton />
        <div className="space-y-8 mt-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Billing & Financials
              </h1>
              <p className="text-muted-foreground">
                Metrics for platform revenue and outstanding payments.
              </p>
            </div>
            
            <DashboardFilters />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Total Revenue (Month)"
                    value="Rs. 1,25,430"
                    icon={DollarSign}
                    description="+12% from last month"
                    isLoading={false}
                />
                <StatCard
                    title="Total Outstanding Dues"
                    value="Rs. 18,750"
                    icon={Receipt}
                    description="From 42 pending bills"
                    isLoading={false}
                />
                <StatCard
                    title="Average Bill Value"
                    value="Rs. 850"
                    icon={TrendingUp}
                    description="Average per paid invoice"
                    isLoading={false}
                />
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 />
                      Revenue Trend (Last 30 Days)
                    </CardTitle>
                     <CardDescription>
                      Daily revenue collected over the past month.
                    </CardDescription>
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
                     <CardDescription>
                      Breakdown of revenue from different services.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center h-64 bg-muted rounded-md">
                     <p className="text-muted-foreground">[Revenue by Service Bar Chart Placeholder]</p>
                  </CardContent>
                </Card>
             </div>
        </div>
      </div>
    </div>
  );
}
