
'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFirestore, useUser, setDocumentNonBlocking } from "@/firebase";
import { doc, collection } from 'firebase/firestore';
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarIcon, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const addPatientSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  dateOfBirth: z.date({
    required_error: "A date of birth is required.",
  }),
  gender: z.string().min(1, { message: "Gender is required."}),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  email: z.string().email({ message: "Invalid email address." }),
  fullAddress: z.string().min(1, { message: "Address is required." }),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  country: z.string().min(1, "Country is required."),
  pinCode: z.string().min(1, { message: "Pin Code is required." }),
});

const generatePatientId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'PT-';
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export default function AddPatientPage() {
  const { user: doctorUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof addPatientSchema>>({
    resolver: zodResolver(addPatientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: undefined,
      phoneNumber: "",
      email: "",
      fullAddress: "",
      city: "",
      state: "",
      country: "",
      pinCode: "",
    },
  });

  async function onSubmit(values: z.infer<typeof addPatientSchema>) {
    if (!doctorUser || !firestore) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to add a patient."});
        return;
    }

    setIsLoading(true);

    try {
      // Create a new patient profile document with a new unique ID
      const newPatientDocRef = doc(collection(firestore, 'users'));
      const newPatientFirebaseId = newPatientDocRef.id;
      const customPatientId = generatePatientId();

      const userProfile = {
        id: newPatientFirebaseId,
        patientId: customPatientId,
        firstName: values.firstName,
        lastName: values.lastName,
        role: "patient",
        email: values.email,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
        phoneNumber: values.phoneNumber,
        address: {
            fullAddress: values.fullAddress,
            city: values.city,
            state: values.state,
            country: values.country,
            pinCode: values.pinCode,
        },
        doctorId: doctorUser.uid,
      };

      // 1. Create the patient's user profile document in Firestore.
      setDocumentNonBlocking(newPatientDocRef, userProfile, { merge: true });

      // 2. Add a link to this patient in the doctor's own patient list.
      const doctorPatientsColRef = collection(firestore, 'users', doctorUser.uid, 'patients');
      const patientLinkDoc = {
        patientId: newPatientFirebaseId, // The internal firebase UID
        customPatientId: customPatientId, // The user-facing PT- ID
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email
      };
      // Use the internal firebase UID as the doc ID for the link for consistency.
      const patientDocInDoctorList = doc(doctorPatientsColRef, newPatientFirebaseId);
      setDocumentNonBlocking(patientDocInDoctorList, patientLinkDoc, {});
      
      toast({
        title: "Patient Profile Created",
        description: `${values.firstName} ${values.lastName}'s profile has been created. They can now sign up using their email address to access their account.`,
      });

      router.push('/doctor-dashboard/patients');

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Add Patient",
        description: "An unexpected error occurred while creating the patient profile.",
      });
      console.error("Add patient error:", error);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-6 py-12">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <UserPlus className="h-6 w-6 text-primary"/>
                    <CardTitle>Add a New Patient</CardTitle>
                </div>
                <CardDescription>
                    Enter the patient's details to create their profile. They will be added to your patient list and can create their own login later.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Anjali" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Sharma" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                         <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="patient@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Date of birth</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        captionLayout="dropdown-buttons"
                                        fromYear={1900}
                                        toYear={new Date().getFullYear()}
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Mobile Number</FormLabel>
                                <FormControl>
                                    <Input type="tel" placeholder="9876543210" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-2">
                             <FormLabel>Address</FormLabel>
                             <FormField control={form.control} name="fullAddress" render={({ field }) => (<FormItem><FormControl><Input placeholder="Full Address" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormControl><Input placeholder="City" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormControl><Input placeholder="State" {...field} /></FormControl><FormMessage /></FormItem>)} />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormControl><Input placeholder="Country" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="pinCode" render={({ field }) => (<FormItem><FormControl><Input placeholder="Pin Code" {...field} /></FormControl><FormMessage /></FormItem>)} />
                              </div>
                        </div>
                        <div className="flex justify-end gap-2">
                             <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                             <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Adding Patient..." : "Add Patient"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  )
}

    