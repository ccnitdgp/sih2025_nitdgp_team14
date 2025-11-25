'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FlaskConical, PlusCircle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { labReports } from '@/lib/data';


export default function LabReportsPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
         <div>
            <div className="flex items-center gap-3">
            <FlaskConical className="h-6 w-6" />
            <CardTitle className="text-2xl">Lab Reports</CardTitle>
            </div>
            <CardDescription>
                View and manage your diagnostic lab reports.
            </CardDescription>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Upload Report
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {labReports.map((report) => (
            <Card key={report.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex-1">
                    <h3 className="font-semibold text-lg">{report.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Date: {report.date} - Issued by: {report.issuer}
                    </p>
                </div>
                 <Button variant="outline" size="sm">
                    <FileDown className="mr-2 h-4 w-4"/>
                    Download
                </Button>
            </Card>
        ))}
      </CardContent>
    </Card>
  );
}
