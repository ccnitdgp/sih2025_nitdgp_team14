'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Activity, Pill, Stethoscope, FileDown, CreditCard, DollarSign } from 'lucide-react';
import { billingHistory, type Bill } from '@/lib/data';
import { cn } from '@/lib/utils';

const categoryIcons = {
  Radiology: <Activity className="h-6 w-6 text-primary" />,
  Pharmacy: <Pill className="h-6 w-6 text-primary" />,
  Consultation: <Stethoscope className="h-6 w-6 text-primary" />,
};

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>(billingHistory);

  const outstandingBills = bills.filter((bill) => bill.status === 'Due');
  const paidBills = bills.filter((bill) => bill.status === 'Paid');

  const totalOutstanding = outstandingBills.reduce((acc, bill) => acc + bill.amount, 0);

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
      <div className="space-y-8">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
            Patient's Billing History
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            View, manage, and pay your medical bills with ease.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Total Outstanding</CardTitle>
              <CardDescription>
                You have {outstandingBills.length} unpaid bill(s).
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-2xl font-bold text-destructive">
                Rs. {totalOutstanding.toLocaleString('en-IN')}
              </span>
              <Button size="lg" disabled={outstandingBills.length === 0}>
                <CreditCard className="mr-2 h-5 w-5" /> Pay All Outstanding
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="outstanding" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="outstanding">
              Outstanding Bills ({outstandingBills.length})
            </TabsTrigger>
            <TabsTrigger value="paid">
              Paid History ({paidBills.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="outstanding" className="mt-6 space-y-4">
            {outstandingBills.length > 0 ? (
                outstandingBills.map((bill) => (
                <Card key={bill.id} className="p-4 flex flex-col sm:flex-row items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-full mt-1">
                        {categoryIcons[bill.category]}
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-lg">{bill.title}</h3>
                        <p className="text-sm text-muted-foreground">{bill.category} - {bill.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-auto shrink-0">
                         <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">Rs. {bill.amount.toLocaleString('en-IN')}</span>
                            <Badge variant="destructive">{bill.status}</Badge>
                         </div>
                         <div className="flex items-center gap-2 mt-2">
                            <Button variant="ghost" size="sm">
                                <FileDown className="mr-2 h-4 w-4"/> Download Invoice
                            </Button>
                            <Button>
                                <DollarSign className="mr-2 h-4 w-4"/> Pay Now
                            </Button>
                         </div>
                    </div>
                </Card>
                ))
            ) : (
              <Card className="text-center p-8">
                <CardTitle>All Clear!</CardTitle>
                <CardDescription>You have no outstanding bills.</CardDescription>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="paid" className="mt-6 space-y-4">
             {paidBills.length > 0 ? (
                paidBills.map((bill) => (
                 <Card key={bill.id} className="p-4 flex flex-col sm:flex-row items-start gap-4">
                    <div className="p-3 bg-muted rounded-full mt-1">
                        {categoryIcons[bill.category]}
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-lg">{bill.title}</h3>
                        <p className="text-sm text-muted-foreground">{bill.category} - {bill.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-auto shrink-0">
                         <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">Rs. {bill.amount.toLocaleString('en-IN')}</span>
                            <Badge variant="secondary">{bill.status}</Badge>
                         </div>
                         <div className="flex items-center gap-2 mt-2">
                            <Button variant="ghost" size="sm">
                                <FileDown className="mr-2 h-4 w-4"/> Download Invoice
                            </Button>
                         </div>
                    </div>
                </Card>
                ))
            ) : (
                <Card className="text-center p-8">
                    <CardTitle>No Paid Bills</CardTitle>
                    <CardDescription>Your payment history will appear here.</CardDescription>
                </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
