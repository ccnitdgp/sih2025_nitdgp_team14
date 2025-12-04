
'use client';

import { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity, Pill, Stethoscope, FileDown, CreditCard, DollarSign, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useFirestore, useMemoFirebase, useCollection, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where, getDoc } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';


const languageFiles = { hi, bn, ta, te, mr };

const categoryIcons = {
  Radiology: <Activity className="h-6 w-6 text-primary" />,
  Pharmacy: <Pill className="h-6 w-6 text-primary" />,
  Consultation: <Stethoscope className="h-6 w-6 text-primary" />,
  'Lab Tests': <Activity className="h-6 w-6 text-primary" />,
};

const paymentSchema = z.object({
  cardName: z.string().min(1, 'Name on card is required.'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits.'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format.'),
  cvc: z.string().regex(/^\d{3,4}$/, 'CVC must be 3 or 4 digits.'),
});


export default function BillingPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [translations, setTranslations] = useState({});
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('outstanding');
  const { toast } = useToast();

  const billsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, `users/${user.uid}/healthRecords`),
        where('recordType', '==', 'bill')
    );
  }, [user, firestore]);
  
  const { data: bills, isLoading } = useCollection(billsQuery);

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
        cardName: '',
        cardNumber: '',
        expiryDate: '',
        cvc: '',
    },
  });

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

  const handlePayNow = (bill: any) => {
    setSelectedBill(bill);
    form.reset();
    setIsPaymentDialogOpen(true);
  };
  
  const handleConfirmPayment = (values: z.infer<typeof paymentSchema>) => {
    if (!selectedBill || !firestore || !user) return;

    // In a real app, you would integrate with a payment gateway here.
    // For now, we simulate a successful payment.
    console.log("Processing payment for:", values);
    
    const billRef = doc(firestore, 'users', user.uid, 'healthRecords', selectedBill.id);
    
    // Non-blocking update to Firestore
    updateDocumentNonBlocking(billRef, {
        'details.status': 'Paid',
        'details.paymentDate': new Date().toISOString().split('T')[0],
    });
    
    toast({
      title: "Payment Successful",
      description: `Payment of ${t('currency_symbol', 'Rs.')} ${selectedBill.details.amount} for "${selectedBill.details.title}" was successful.`
    });

    setIsPaymentDialogOpen(false);
    setSelectedBill(null);
    // Switch to the 'paid' tab to show the user their updated history
    setActiveTab('paid');
  };

  const handleDownloadInvoice = async (bill: any) => {
    if (!firestore || !userProfile) return;

    let doctorName = "N/A";
    if (bill.addedBy) {
        try {
            const doctorRef = doc(firestore, 'doctors', bill.addedBy);
            const doctorSnap = await getDoc(doctorRef);
            if (doctorSnap.exists()) {
                const doctorData = doctorSnap.data();
                doctorName = `Dr. ${doctorData.firstName} ${doctorData.lastName}`;
            }
        } catch (error) {
            console.error("Error fetching doctor details:", error);
        }
    }

    const docPDF = new jsPDF();
    const pageWidth = docPDF.internal.pageSize.getWidth();
    const margin = 14;

    // Header
    docPDF.setFontSize(22);
    docPDF.setFont('helvetica', 'bold');
    docPDF.text("Medical Bill Receipt", margin, 22);

    // Clinic Info
    docPDF.setFontSize(10);
    docPDF.setFont('helvetica', 'normal');
    docPDF.text("Swasthya Clinic", pageWidth - margin, 22, { align: 'right' });
    docPDF.text("123 Health St, Wellness City", pageWidth - margin, 28, { align: 'right' });
    docPDF.text("contact@swasthya.example.com", pageWidth - margin, 34, { align: 'right' });

    // Billing & Invoice Info
    docPDF.setLineWidth(0.5);
    docPDF.line(margin, 45, pageWidth - margin, 45);

    docPDF.setFontSize(11);
    docPDF.setFont('helvetica', 'bold');
    docPDF.text("Invoice Details", pageWidth / 2 + 20, 52);

    docPDF.setFont('helvetica', 'normal');
    docPDF.text(userProfile?.firstName + ' ' + userProfile?.lastName || 'N/A', margin, 58);
    docPDF.text(userProfile?.address?.fullAddress || '', margin, 64);
    docPDF.text(`${userProfile?.address?.city || ''}, ${userProfile?.address?.state || ''} ${userProfile?.address?.pinCode || ''}`.replace(/^, |, $/g, ''), margin, 70);
    docPDF.text(userProfile?.phoneNumber || 'N/A', margin, 76);

    const rightColX = pageWidth - margin;
    docPDF.text(bill.id, rightColX, 58, { align: 'right' });
    
    docPDF.text(`Date Issued:`, pageWidth / 2 + 20, 64);
    docPDF.text(bill.details.date, rightColX, 64, { align: 'right' });

    if (bill.details.status === 'Paid' && bill.details.paymentDate) {
        docPDF.text(`Date Paid:`, pageWidth / 2 + 20, 70);
        docPDF.text(bill.details.paymentDate, rightColX, 70, { align: 'right' });
    }
    
    docPDF.text(`Doctor:`, pageWidth / 2 + 20, 76);
    docPDF.text(doctorName, rightColX, 76, { align: 'right' });

    // Bill Table
    (docPDF as any).autoTable({
        startY: 85,
        head: [['Date of Service', 'Description of Service', 'Amount']],
        body: [
            [
                bill.details.date,
                bill.details.title,
                `${t('currency_symbol', 'Rs.')} ${bill.details.amount.toLocaleString('en-IN')}`
            ]
        ],
        theme: 'striped',
        headStyles: { fillColor: [93, 114, 110] },
        didDrawPage: (data) => {
            // Summary
            const finalY = data.cursor.y;
            const amount = bill.details.amount;
            const tax = amount * 0.18; // Assuming 18% GST
            const total = amount + tax;
            
            docPDF.setFontSize(10);
            docPDF.text("Subtotal:", pageWidth - margin - 30, finalY + 10, { align: 'right' });
            docPDF.text(`Rs. ${amount.toLocaleString('en-IN')}`, pageWidth - margin, finalY + 10, { align: 'right' });
            
            docPDF.text("GST (18%):", pageWidth - margin - 30, finalY + 15, { align: 'right' });
            docPDF.text(`Rs. ${tax.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, pageWidth - margin, finalY + 15, { align: 'right' });
            
            docPDF.setFont('helvetica', 'bold');
            docPDF.text("Grand Total:", pageWidth - margin - 30, finalY + 22, { align: 'right' });
            docPDF.text(`Rs. ${total.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, pageWidth - margin, finalY + 22, { align: 'right' });

            // Payment Information
            docPDF.setFont('helvetica', 'bold');
            docPDF.text("Payment Information", margin, finalY + 35);
            docPDF.setFont('helvetica', 'normal');
            docPDF.text(`Payment Status: ${bill.details.status}`, margin, finalY + 41);

            // Footer
            docPDF.setFontSize(8);
            docPDF.text("Thank you for choosing Swasthya Clinic. For any billing questions, please contact support.", margin, docPDF.internal.pageSize.getHeight() - 10);
        }
    });

    docPDF.save(`invoice-${bill.id}.pdf`);
  };


  const outstandingBills = useMemo(() => bills?.filter((bill) => bill.details.status === 'Due') || [], [bills]);
  const paidBills = useMemo(() => bills?.filter((bill) => bill.details.status === 'Paid') || [], [bills]);
  const totalOutstanding = useMemo(() => outstandingBills.reduce((acc, bill) => acc + bill.details.amount, 0), [outstandingBills]);

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
       <Button variant="ghost" asChild className="mb-4 -ml-4">
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
            {isLoading ? <p>Loading bills...</p> : outstandingBills.length > 0 ? (
                outstandingBills.map((bill) => (
                <Card key={bill.id} className="p-4 flex flex-col sm:flex-row items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-full mt-1">
                        {categoryIcons[bill.details.category]}
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-lg">{bill.details.title}</h3>
                        <p className="text-sm text-muted-foreground">{t(bill.details.category.toLowerCase(), bill.details.category)} - {bill.details.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-auto shrink-0">
                         <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{t('currency_symbol', 'Rs.')} {bill.details.amount.toLocaleString('en-IN')}</span>
                            <Badge variant="destructive">{t('bill_status_due', bill.details.status)}</Badge>
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
             {isLoading ? <p>Loading bills...</p> : paidBills.length > 0 ? (
                paidBills.map((bill) => (
                 <Card key={bill.id} className="p-4 flex flex-col sm:flex-row items-start gap-4">
                    <div className="p-3 bg-muted rounded-full mt-1">
                        {categoryIcons[bill.details.category]}
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-lg">{bill.details.title}</h3>
                        <p className="text-sm text-muted-foreground">{t(bill.details.category.toLowerCase(), bill.details.category)} - {bill.details.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-auto shrink-0">
                         <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{t('currency_symbol', 'Rs.')} {bill.details.amount.toLocaleString('en-IN')}</span>
                            <Badge variant="secondary">{t('bill_status_paid', bill.details.status)}</Badge>
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Complete Your Payment</DialogTitle>
                    <DialogDescription>
                        Paying {t('currency_symbol', 'Rs.')}{selectedBill?.details.amount.toLocaleString('en-IN')} for "{selectedBill?.details.title}".
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleConfirmPayment)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="cardName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name on Card</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="cardNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Card Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="0000 0000 0000 0000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="expiryDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expiry Date</FormLabel>
                                        <FormControl>
                                            <Input placeholder="MM/YY" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="cvc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CVC</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                         <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Pay {t('currency_symbol', 'Rs.')}{selectedBill?.details.amount.toLocaleString('en-IN')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </div>
  );
}
