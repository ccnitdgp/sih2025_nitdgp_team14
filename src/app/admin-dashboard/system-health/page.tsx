
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Server,
  Activity,
  AlertTriangle,
  Clock,
  Mail,
  MessageCircle,
  Database
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/layout/back-button';
import { DashboardFilters } from '@/components/admin/dashboard-filters';

const ServiceStatusCard = ({ serviceName, status, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{serviceName}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <Badge variant={status === 'Operational' ? 'default' : 'destructive'} className={status === 'Operational' ? 'bg-green-500 hover:bg-green-600' : ''}>
        {status}
      </Badge>
      <p className="text-xs text-muted-foreground mt-2">
        {status === 'Operational' ? 'No issues reported' : 'Experiencing issues'}
      </p>
    </CardContent>
  </Card>
);

const QueueStatCard = ({ title, value, description }) => (
    <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export default function SystemHealthPage() {
  
  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <BackButton />
        <div className="space-y-8 mt-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                System Health &amp; Operations
              </h1>
              <p className="text-muted-foreground">
                Live status of platform services, queues, and error rates.
              </p>
            </div>
            
            <DashboardFilters />

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">API &amp; Service Status</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <ServiceStatusCard serviceName="EHR API" status="Operational" icon={Server} />
                    <ServiceStatusCard serviceName="Lab Service" status="Operational" icon={Server} />
                    <ServiceStatusCard serviceName="SMS Gateway" status="Operational" icon={MessageCircle} />
                    <ServiceStatusCard serviceName="Email Service" status="Degraded" icon={Mail} />
                </div>
            </div>

             <div className="space-y-4">
                <h2 className="text-xl font-semibold">Live Queues &amp; Processing</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <QueueStatCard title="Notification Queue" value="12" description="Pending push/email alerts" />
                    <QueueStatCard title="Report Generation" value="4" description="Diagnostic reports being processed" />
                    <QueueStatCard title="Database Connections" value="89" description="Active Firestore connections" />
                    <QueueStatCard title="API Latency" value="120ms" description="Average response time" />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity />
                        Error Rate (Last Hour)
                    </CardTitle>
                    <CardDescription>
                        Summary of critical errors and warnings across the system.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-64 bg-muted rounded-md">
                    <p className="text-muted-foreground">[Error Rate Time Series Chart Placeholder]</p>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle />
                        Top 3 Errors Today
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="p-2 border rounded-md">
                        <p className="font-mono text-sm">`FirestorePermissionError` at `/users/[userId]`</p>
                        <p className="text-xs text-muted-foreground">Count: 42</p>
                    </div>
                     <div className="p-2 border rounded-md">
                        <p className="font-mono text-sm">`TypeError: Cannot read properties of undefined`</p>
                        <p className="text-xs text-muted-foreground">Count: 15</p>
                    </div>
                     <div className="p-2 border rounded-md">
                        <p className="font-mono text-sm">`AuthError: token-expired`</p>
                        <p className="text-xs text-muted-foreground">Count: 8</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
