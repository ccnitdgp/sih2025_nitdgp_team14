'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShieldCheck, PlusCircle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { vaccinationRecords } from '@/lib/data';

export default function VaccinationRecordsPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6" />
                <CardTitle className="text-2xl">Vaccination Records</CardTitle>
            </div>
            <CardDescription>
            Your history of vaccinations and immunizations.
            </CardDescription>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Add Record
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {vaccinationRecords.map((record) => (
            <Card key={record.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex-1">
                    <h3 className="font-semibold text-lg">{record.vaccine}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Dose {record.dose} - Administered on {record.date} at {record.location}
                    </p>
                </div>
                <Button variant="outline" size="sm">
                    <FileDown className="mr-2 h-4 w-4"/>
                    Download Certificate
                </Button>
            </Card>
        ))}
      </CardContent>
    </Card>
  );
}
