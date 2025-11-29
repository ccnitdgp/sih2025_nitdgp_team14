
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
  Calendar,
  Clock,
  TrendingDown,
  UserCheck
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/layout/back-button';
import { AppointmentTrendChart } from '@/components/admin/appointment-trend-chart';
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

export default function AppointmentsUtilizationPage() {
  
  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <BackButton />
        <div className="space-y-8 mt-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Appointments &amp; Utilization
              </h1>
              <p className="text-muted-foreground">
                Analytics for appointment scheduling, no-shows, and doctor utilization.
              </p>
            </div>
            
            <DashboardFilters />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="No-show Rate"
                    value="8%"
                    icon={TrendingDown}
                    description="Percentage of missed appointments this month"
                    isLoading={false}
                />
                <StatCard
                    title="Avg. Booking to Appt. Time"
                    value="3.2 days"
                    icon={Clock}
                    description="Average time from booking to consultation"
                    isLoading={false}
                />
                <StatCard
                    title="Avg. Doctor Utilization"
                    value="78%"
                    icon={UserCheck}
                    description="Percentage of available slots filled"
                    isLoading={false}
                />
                 <StatCard
                    title="Peak Booking Day"
                    value="Monday"
                    icon={Calendar}
                    description="Most popular day for booking appointments"
                    isLoading={false}
                 />
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar />
                      Appointment Volume
                    </CardTitle>
                    <CardDescription>
                      Appointment volume over the last 7 days.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AppointmentTrendChart />
                  </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity />
                      Peak Hours Heatmap
                    </CardTitle>
                    <CardDescription>
                      Most popular times for appointments throughout the week.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center h-64 bg-muted rounded-md">
                     <p className="text-muted-foreground">[Peak Hours Heatmap Component Placeholder]</p>
                  </CardContent>
                </Card>
             </div>
        </div>
      </div>
    </div>
  );
}
