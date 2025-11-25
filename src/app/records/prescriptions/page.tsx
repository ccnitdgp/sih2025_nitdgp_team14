'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookUser, FileDown, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { prescriptions } from '@/lib/data';
import { Badge } from '@/components/ui/badge';

export default function PrescriptionsPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <div className="flex items-center gap-3">
            <BookUser className="h-6 w-6" />
            <CardTitle className="text-2xl">Prescriptions</CardTitle>
            </div>
            <CardDescription>
            Your prescribed medications and their details.
            </CardDescription>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Add Prescription
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {prescriptions.map((item) => (
            <Card key={item.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-lg">{item.medication}</h3>
                        <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>{item.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {item.dosage} - Prescribed by {item.doctor} on {item.date}
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
