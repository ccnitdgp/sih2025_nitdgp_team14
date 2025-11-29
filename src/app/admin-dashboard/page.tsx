
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Users, Syringe, Calendar, User, Activity, FileDown, Tent, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiseaseTrendChart } from '@/components/admin/disease-trend-chart';
import { AppointmentTrendChart } from '@/components/admin/appointment-trend-chart';
import { VaccinationCoverageChart } from '@/components/admin/vaccination-coverage-chart';
import { DoctorLoadChart } from '@/components/admin/doctor-load-chart';
import { AgeDistributionChart } from '@/components/admin/age-distribution-chart';
import { OutbreakHeatmap } from '@/components/admin/outbreak-heatmap';
import Link from 'next/link';

const StatCard = ({ title, value, icon: Icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function AdminDashboardPage() {
    
  const handleExport = () => {
    const headers = "Category,Value,Description\n";
    const rows = [
        "Total Patients,10245,+5.2% from last month",
        "Appointments (This Month),1890,+12% from last month",
        "Vaccinations (This Month),4321,2 new drives started",
        "Active Outbreak Signals,2,Flu & Dengue in Sector-15"
    ].join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "public_health_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Analytics Dashboard</h1>
              <p className="text-muted-foreground">Aggregated public health insights and operational statistics.</p>
            </div>
            <Button onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />
                Export Report
            </Button>
          </div>

           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <StatCard title="Total Patients" value="10,245" icon={Users} description="+5.2% from last month" />
             <StatCard title="Appointments (This Month)" value="1,890" icon={Calendar} description="+12% from last month" />
             <StatCard title="Vaccinations (This Month)" value="4,321" icon={Syringe} description="2 new drives started" />
             <StatCard title="Active Outbreak Signals" value="2" icon={TrendingUp} description="Flu & Dengue in Sector-15" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg"><Syringe/> Manage Drives</CardTitle>
                      <CardDescription>Add, edit, or remove vaccination drives.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button asChild><Link href="/admin-dashboard/vaccination-drives">Go to Drives</Link></Button>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg"><Tent/> Manage Camps</CardTitle>
                      <CardDescription>Add, edit, or remove health camps.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button asChild><Link href="/admin-dashboard/health-camps">Go to Camps</Link></Button>
                  </CardContent>
              </Card>
               <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg"><Users/> User Management</CardTitle>
                      <CardDescription>View and manage patient & doctor accounts.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button disabled>Manage Users</Button>
                  </CardContent>
              </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Activity /> Disease & Symptom Trends</CardTitle>
                    <CardDescription>Reported cases of Influenza over the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DiseaseTrendChart />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar /> Appointment Volume</CardTitle>
                    <CardDescription>Appointment volume over the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AppointmentTrendChart />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Syringe /> Vaccination Coverage</CardTitle>
                    <CardDescription>Total vaccination coverage by age group.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <VaccinationCoverageChart />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> Patient Demographics</CardTitle>
                    <CardDescription>Age distribution of registered patients.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AgeDistributionChart />
                </CardContent>
            </Card>
             <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User /> Doctor Workload</CardTitle>
                    <CardDescription>Appointments handled per doctor this week.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DoctorLoadChart />
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Outbreak Heatmap</CardTitle>
                    <CardDescription>Geographic distribution of recent flu cases.</CardDescription>
                </Header>
                <CardContent>
                    <OutbreakHeatmap />
                </CardContent>
            </Card>
           </div>
        </div>
      </div>
    </div>
  );
}
