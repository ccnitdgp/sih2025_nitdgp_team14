
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { vaccinationDrives } from '@/lib/data';
import { Calendar as CalendarIcon, MapPin, Syringe, User, Phone, CheckCircle, QrCode as QrCodeIcon, Download, Loader2 } from 'lucide-react';
import { Highlight } from '@/components/ui/highlight';
import { useUser, useDoc, useFirestore, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { useToast } from '@/hooks/use-toast';
import { doc, collection } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import en from '@/lib/locales/en.json';
import { BackButton } from '@/components/layout/back-button';
import { format, differenceInYears, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import QRCode from 'react-qr-code';

const languageFiles = { hi, bn, ta, te, mr, en };

type Drive = typeof vaccinationDrives[0];

const timeSlots = {
  Morning: ['09:00 AM', '10:00 AM', '11:00 AM'],
  Afternoon: ['01:00 PM', '02:00 PM', '03:00 PM'],
  Evening: ['05:00 PM', '06:00 PM'],
};

export default function VaccinationPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const { user } = useUser();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [translations, setTranslations] = useState(en);
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [age, setAge] = useState<number | string>('');
  const [location, setLocation] = useState('');
  const [doseType, setDoseType] = useState('Dose 1');
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [finalBookingDetails, setFinalBookingDetails] = useState<any>(null);


  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile } = useDoc(userDocRef);
  
  const isEligible = useMemo(() => {
      const parsedAge = typeof age === 'string' ? parseInt(age, 10) : age;
      return parsedAge >= 18 && location.trim() !== '';
  }, [age, location]);

  useEffect(() => {
    const lang = userProfile?.preferredLanguage || 'en';
    setTranslations(languageFiles[lang] || en);
    if (userProfile?.dateOfBirth) {
        setAge(differenceInYears(new Date(), userProfile.dateOfBirth.toDate()));
    }
    if (userProfile?.address) {
        setLocation(`${userProfile.address.city}, ${userProfile.address.pinCode}`);
    }

  }, [userProfile]);

  const t = (key: string, fallback: string) => translations[key] || fallback;

  const handleOpenDialog = (drive: Drive) => {
    if (!user) {
        // Handled by RegisterButton's AuthDialog
        return;
    }
    setSelectedDrive(drive);
    setStep(1);
    setIsSubmitting(false);
    setFinalBookingDetails(null);
    // Reset other states
    setSelectedCenter(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
  };
  
  const handleCloseDialog = () => {
    setSelectedDrive(null);
  }

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);
  
  const handleSubmitBooking = () => {
      if (!user || !userProfile || !firestore || !selectedDrive || !selectedCenter || !selectedDate || !selectedTime) return;
      
      setIsSubmitting(true);
      const registrationColRef = collection(firestore, 'vaccinationRegistrations');
      const newDocRef = doc(registrationColRef); // Generate a new doc ref with a unique ID

      const registrationData = {
          id: newDocRef.id,
          driveId: selectedDrive.id,
          driveName: selectedDrive.name,
          userId: user.uid,
          userName: `${userProfile.firstName} ${userProfile.lastName}`,
          userAge: age,
          userLocation: location,
          doseType: doseType,
          vaccineCenter: selectedCenter,
          appointmentSlot: `${format(selectedDate, 'yyyy-MM-dd')} ${selectedTime}`,
          registeredAt: new Date(),
          status: "Scheduled"
      };
      
      // Use setDocumentNonBlocking with the new document reference
      setDocumentNonBlocking(newDocRef, registrationData, {});
      
      setFinalBookingDetails(registrationData);
      setIsSubmitting(false);
      handleNextStep(); // Move to confirmation screen
  };
  
  const RegisterButton = ({ drive }) => {
    if (user) {
      return <Button onClick={() => handleOpenDialog(drive)}>{t('register_now_button', 'Register Now')}</Button>;
    }
    return (
      <AuthDialog 
        trigger={
           <Button>{t('register_now_button', 'Register Now')}</Button>
        }
      />
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1: // Eligibility Check
        return (
          <div>
            <DialogTitle>Step 1: Eligibility Check</DialogTitle>
            <DialogDescription>Please provide some details to check your eligibility.</DialogDescription>
             <div className="space-y-4 py-4">
                <div>
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Enter your age" />
                </div>
                 <div>
                    <Label htmlFor="location">Location (Pincode)</Label>
                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter your pincode" />
                </div>
                <div>
                    <Label>Dose Type</Label>
                    <RadioGroup value={doseType} onValueChange={setDoseType} className="flex gap-4 pt-2">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="Dose 1" id="dose1" /><Label htmlFor="dose1">Dose 1</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="Dose 2" id="dose2" /><Label htmlFor="dose2">Dose 2</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="Booster" id="booster" /><Label htmlFor="booster">Booster</Label></div>
                    </RadioGroup>
                </div>
            </div>
             <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                <Button onClick={handleNextStep} disabled={!isEligible}>{isEligible ? "Next: Select Center" : "Please fill details"}</Button>
            </DialogFooter>
          </div>
        );
      case 2: // Select Center & Slot
        return (
          <div>
            <DialogTitle>Step 2: Select Center & Time Slot</DialogTitle>
            <DialogDescription>Choose a vaccination center and your preferred time.</DialogDescription>
            <div className="space-y-4 py-4">
                <div>
                    <Label>Select Center</Label>
                    <RadioGroup value={selectedCenter || ''} onValueChange={setSelectedCenter} className="space-y-2 pt-2">
                        {[selectedDrive?.location, "Sector 18 Community Center", "Govt. Primary School, Phase 3"].map(center => (
                            <Label key={center} className={cn("flex items-center rounded-md border p-4 cursor-pointer", selectedCenter === center && "border-primary")}>
                                <RadioGroupItem value={center!} id={center!} className="mr-2" />
                                {center}
                            </Label>
                        ))}
                    </RadioGroup>
                </div>
                {selectedCenter && (
                    <div className="flex flex-col sm:flex-row gap-4">
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus disabled={(date) => date < new Date() || date > addDays(new Date(), 30)} />
                            </PopoverContent>
                        </Popover>
                         <Select onValueChange={setSelectedTime} value={selectedTime || ''} disabled={!selectedDate}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a time slot" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(timeSlots).map(([session, times]) => (
                                    <React.Fragment key={session}>
                                        <h4 className="px-2 py-1.5 text-sm font-semibold">{session}</h4>
                                        {times.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                                    </React.Fragment>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
             <DialogFooter>
                <Button variant="outline" onClick={handlePrevStep}>Back</Button>
                <Button onClick={handleNextStep} disabled={!selectedCenter || !selectedDate || !selectedTime}>Next: Confirm Details</Button>
            </DialogFooter>
          </div>
        );
      case 3: // Auto-fill Info
        return (
           <div>
            <DialogTitle>Step 3: Confirm Your Information</DialogTitle>
            <DialogDescription>Please review your details. They will be used for the registration.</DialogDescription>
            <div className="space-y-4 py-4">
                <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground"/><span>{userProfile?.firstName} {userProfile?.lastName}</span></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground"/><span>{userProfile?.phoneNumber}</span></div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground"/><span>{userProfile?.address?.fullAddress}</span></div>
            </div>
             <DialogFooter>
                <Button variant="outline" onClick={handlePrevStep}>Back</Button>
                <Button onClick={handleSubmitBooking} disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Confirming...</> : "Confirm Registration"}
                </Button>
            </DialogFooter>
           </div>
        );
        case 4: // Confirmation
        const qrCodeValue = JSON.stringify({
            appointmentId: finalBookingDetails?.id,
            name: finalBookingDetails?.userName,
            center: finalBookingDetails?.vaccineCenter,
            slot: finalBookingDetails?.appointmentSlot
        });
        return (
             <div>
            <DialogTitle className="flex items-center gap-2 text-green-600"><CheckCircle /> Registration Successful!</DialogTitle>
            <DialogDescription>Your vaccination appointment is confirmed. Please show this QR code at the center.</DialogDescription>
            <div className="py-4 space-y-6">
                <div className="bg-white p-4 rounded-lg flex justify-center">
                    <QRCode value={qrCodeValue} size={192} />
                </div>
                <div className="text-sm space-y-2">
                    <p><strong>Appointment ID:</strong> {finalBookingDetails.id}</p>
                    <p><strong>Center:</strong> {finalBookingDetails.vaccineCenter}</p>
                    <p><strong>Slot:</strong> {format(new Date(finalBookingDetails.appointmentSlot.split(' ')[0]), 'PPP')} at {finalBookingDetails.appointmentSlot.split(' ')[1]}</p>
                </div>
            </div>
             <DialogFooter>
                 <Button variant="outline"><Download className="mr-2"/> Download</Button>
                <Button onClick={handleCloseDialog}>Done</Button>
            </DialogFooter>
           </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <BackButton />
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
            {t('vaccination_page_title', 'Vaccination Drives')}
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t('vaccination_page_desc', 'Stay protected. Find information about upcoming vaccination drives near you.')}
          </p>
        </div>
        {vaccinationDrives.length > 0 ? (
          <div className="space-y-8">
              {vaccinationDrives.map((drive) => {
                const driveName = t(drive.name_key, drive.name);
                const driveDetails = t(drive.details_key, drive.details);
                const driveLocation = t(drive.location_key, drive.location);

                return (
                <Card key={drive.id} className="w-full transition-shadow hover:shadow-lg">
                  <Accordion type="single" collapsible className="w-full" defaultValue={searchQuery && (driveName.toLowerCase().includes(searchQuery) || driveDetails.toLowerCase().includes(searchQuery)) ? `item-${drive.id}` : undefined}>
                    <AccordionItem value={`item-${drive.id}`} className="border-b-0">
                      <AccordionTrigger className="p-6 hover:no-underline text-left">
                        <div className="flex items-start w-full gap-4">
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Syringe className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <h3 className="font-semibold text-lg">
                              <Highlight text={driveName} query={searchQuery} />
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{driveLocation}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                <span>{drive.date}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="pl-16 space-y-4">
                          <p className="text-muted-foreground">
                            <Highlight text={driveDetails} query={searchQuery} />
                          </p>
                          <RegisterButton drive={drive} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              )})}
          </div>
        ) : (
          <Card className="text-center p-8">
            <CardTitle>No Vaccination Drives Scheduled</CardTitle>
            <CardDescription>Please check back later for information on upcoming drives.</CardDescription>
          </Card>
        )}
      </div>

       <Dialog open={!!selectedDrive} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  {renderStepContent()}
                </DialogHeader>
            </DialogContent>
        </Dialog>
    </div>
  );
}
