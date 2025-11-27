
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity, Pill, Stethoscope, FileDown, CreditCard, DollarSign, ArrowLeft } from 'lucide-react';
import { billingHistory, type Bill } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { dummyPdfContent } from '@/lib/dummy-pdf';
import Link from 'next/link';


const languageFiles = { hi, bn, ta, te, mr };

const categoryIcons = {
  Radiology: <Activity className="h-6 w-6 text-primary" />,
  Pharmacy: <Pill className="h-6 w-6 text-primary" />,
  Consultation: <Stethoscope className="h-6 w-6 text-primary" />,
};

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>(billingHistory);
  const { user } = useUser();
  const firestore = useFirestore();
  const [translations, setTranslations] = useState({});
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('outstanding');
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);

  useEffect(() => {
    if (userProfile?.preferredLanguage && languageFiles[userProfile.preferredLanguage]) {
      setTranslations(languageFiles[userProfile.preferredLanguage]);
    } else {
      setTranslations({});
    }
  }, [userProfile]);

  const t = (key: string, fallback: string) => translations[key] || fallback;

  const handlePayNow = (bill: Bill) => {
    setSelectedBill(bill);
    setIsPaymentDialogOpen(true);
  };
  
  const handleConfirmPayment = () => {
    if (!selectedBill) return;

    setBills(currentBills =>
      currentBills.map(b =>
        b.id === selectedBill.id ? { ...b, status: 'Paid' } : b
      )
    );
    
    toast({
      title: "Payment Successful",
      description: `Payment of ${t('currency_symbol', 'Rs.')} ${selectedBill.amount} for "${selectedBill.title}" was successful.`
    });

    setIsPaymentDialogOpen(false);
    setSelectedBill(null);
    setActiveTab('paid');
  };

  const handleDownloadInvoice = (bill: Bill) => {
    const link = document.createElement('a');
    link.href = dummyPdfContent;
    link.download = `invoice-${bill.id}-${bill.title.replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const outstandingBills = bills.filter((bill) => bill.status === 'Due');
  const paidBills = bills.filter((bill) => bill.status === 'Paid');

  const totalOutstanding = outstandingBills.reduce((acc, bill) => acc + bill.amount, 0);

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
       <Button variant="ghost" asChild className="mb-4">
            <Link href="/patient-dashboard">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Dashboard
            </Link>
        </Button>
      <div className="space-y-8">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
            {t('billing_history_page_title', "Patient's Billing History")}
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t('billing_history_page_desc', 'View, manage, and pay your medical bills with ease.')}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{t('total_outstanding_title', 'Total Outstanding')}</CardTitle>
              <CardDescription>
                {t('unpaid_bills_desc', `You have ${outstandingBills.length} unpaid bill(s).`)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-2xl font-bold text-destructive">
                {t('currency_symbol', 'Rs.')} {totalOutstanding.toLocaleString('en-IN')}
              </span>
              <Button size="lg" disabled={outstandingBills.length === 0}>
                <CreditCard className="mr-2 h-5 w-5" /> {t('pay_all_outstanding_button', 'Pay All Outstanding')}
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="outstanding">
              {t('outstanding_bills_tab', 'Outstanding Bills')} ({outstandingBills.length})
            </TabsTrigger>
            <TabsTrigger value="paid">
              {t('paid_history_tab', 'Paid History')} ({paidBills.length})
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
                        <p className="text-sm text-muted-foreground">{t(bill.category.toLowerCase(), bill.category)} - {bill.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-auto shrink-0">
                         <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{t('currency_symbol', 'Rs.')} {bill.amount.toLocaleString('en-IN')}</span>
                            <Badge variant="destructive">{t('bill_status_due', bill.status)}</Badge>
                         </div>
                         <div className="flex items-center gap-2 mt-2">
                            <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(bill)}>
                                <FileDown className="mr-2 h-4 w-4"/> {t('download_invoice_button', 'Download Invoice')}
                            </Button>
                            <Button onClick={() => handlePayNow(bill)}>
                                <DollarSign className="mr-2 h-4 w-4"/> {t('pay_now_button', 'Pay Now')}
                            </Button>
                         </div>
                    </div>
                </Card>
                ))
            ) : (
              <Card className="text-center p-8">
                <CardTitle>{t('all_clear_title', 'All Clear!')}</CardTitle>
                <CardDescription>{t('no_outstanding_bills_desc', 'You have no outstanding bills.')}</CardDescription>
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
                        <p className="text-sm text-muted-foreground">{t(bill.category.toLowerCase(), bill.category)} - {bill.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-auto shrink-0">
                         <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{t('currency_symbol', 'Rs.')} {bill.amount.toLocaleString('en-IN')}</span>
                            <Badge variant="secondary">{t('bill_status_paid', bill.status)}</Badge>
                         </div>
                         <div className="flex items-center gap-2 mt-2">
                            <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(bill)}>
                                <FileDown className="mr-2 h-4 w-4"/> {t('download_invoice_button', 'Download Invoice')}
                            </Button>
                         </div>
                    </div>
                </Card>
                ))
            ) : (
                <Card className="text-center p-8">
                    <CardTitle>{t('no_paid_bills_title', 'No Paid Bills')}</CardTitle>
                    <CardDescription>{t('no_paid_bills_desc', 'Your payment history will appear here.')}</CardDescription>
                </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

       <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Payment</DialogTitle>
                    <DialogDescription>
                        You are about to pay {t('currency_symbol', 'Rs.')}{selectedBill?.amount.toLocaleString('en-IN')} for "{selectedBill?.title}".
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    This is a simulated payment gateway. In a real application, you would be redirected to a payment processor.
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmPayment}>Confirm Payment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
