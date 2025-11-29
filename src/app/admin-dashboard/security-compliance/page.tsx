
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  LogIn,
  AlertTriangle,
  FileDown,
  Eye,
  UserCog
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/layout/back-button';

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

const loginActivity = [
    { role: 'Patient', logins: 1254, trend: '+15%' },
    { role: 'Doctor', logins: 128, trend: '+8%' },
    { role: 'Admin', logins: 12, trend: '-5%' },
];

const recentActions = [
    { timestamp: '2 minutes ago', user: 'admin@swasthya.com', action: 'Exported patient data report', ip: '10.0.1.5' },
    { timestamp: '15 minutes ago', user: 'Dr. Sharma', action: 'Viewed patient record PT-102938', ip: '192.168.1.101' },
    { timestamp: '1 hour ago', user: 'patient.one@test.com', action: 'Failed login attempt', ip: '203.0.113.25' },
    { timestamp: '3 hours ago', user: 'admin@swasthya.com', action: 'Changed role for user doc-new@test.com', ip: '10.0.1.5' },
];

export default function SecurityCompliancePage() {
  
  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <BackButton />
        <div className="space-y-8 mt-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Security &amp; Compliance
              </h1>
              <p className="text-muted-foreground">
                Monitor login activity, sensitive actions, and access logs.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Failed Logins Today"
                    value="12"
                    icon={AlertTriangle}
                    description="Attempts from 5 unique IPs"
                    isLoading={false}
                />
                <StatCard
                    title="Records Exported (24h)"
                    value="3"
                    icon={FileDown}
                    description="Last export by admin@swasthya.com"
                    isLoading={false}
                />
                <StatCard
                    title="Role Changes (7d)"
                    value="1"
                    icon={UserCog}
                    description="1 user promoted to 'doctor'"
                    isLoading={false}
                />
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <LogIn />
                        Login Activity by Role (24h)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role</TableHead>
                                <TableHead>Logins</TableHead>
                                <TableHead>Trend</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loginActivity.map(activity => (
                                <TableRow key={activity.role}>
                                    <TableCell className="font-medium">{activity.role}</TableCell>
                                    <TableCell>{activity.logins}</TableCell>
                                    <TableCell>
                                        <Badge variant={activity.trend.startsWith('+') ? 'default' : 'destructive'}>{activity.trend}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye />
                      Recent Audit Trail
                    </CardTitle>
                    <CardDescription>
                      A log of recent security-sensitive actions across the platform.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>IP Address</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                             {recentActions.map((action, i) => (
                                 <TableRow key={i}>
                                    <TableCell className="font-medium">{action.timestamp}</TableCell>
                                    <TableCell>{action.user}</TableCell>
                                    <TableCell>{action.action}</TableCell>
                                    <TableCell>{action.ip}</TableCell>
                                </TableRow>
                             ))}
                        </TableBody>
                     </Table>
                  </CardContent>
                </Card>
             </div>
        </div>
      </div>
    </div>
  );
}
