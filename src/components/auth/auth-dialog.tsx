
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Eye, EyeOff, User, Stethoscope } from "lucide-react";
import { useAuth } from "@/firebase";
import { initiateEmailSignIn, initiateEmailSignUp, sendPasswordReset } from "@/firebase/non-blocking-login";
import { setDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc, collection } from 'firebase/firestore';
import { useFirestore } from "@/firebase";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const signupSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  role: z.enum(["patient", "doctor"], {
    required_error: "You need to select a role.",
  }),
  dateOfBirth: z.date({
    required_error: "A date of birth is required.",
  }),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  maritalStatus: z.string().optional(),
  address: z.string().min(1, { message: "Address is required." }),
  emergencyContactName: z.string().min(1, { message: "Emergency contact name is required." }),
  emergencyContactPhone: z.string().min(1, { message: "Emergency contact phone is required." }),
  emergencyContactRelation: z.string().min(1, { message: "Emergency contact relation is required." }),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  doctorId: z.string().optional(),
});

type AuthDialogProps = {
  trigger: React.ReactNode;
  defaultTab?: "login" | "signup";
};

// This is a placeholder. In a real app, you'd have a system to assign doctors.
const HARDCODED_DOCTOR_ID = "Y43GFgpcD3QY6xGM3f83hTzYV5i2";

export function AuthDialog({ trigger, defaultTab = "login" }: AuthDialogProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: undefined,
      phoneNumber: "",
      email: "",
      password: "",
      address: "",
      bloodGroup: undefined,
      maritalStatus: undefined,
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      doctorId: HARDCODED_DOCTOR_ID,
    },
  });

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    initiateEmailSignIn(auth, values.email, values.password);
    setOpen(false);
  }

  async function onSignupSubmit(values: z.infer<typeof signupSchema>) {
    try {
      const userCredential = await initiateEmailSignUp(auth, values.email, values.password);
      if (userCredential && userCredential.user) {
        const user = userCredential.user;
        const userProfile: any = {
          id: user.uid,
          firstName: values.firstName,
          lastName: values.lastName,
          role: values.role,
          email: user.email,
          dateOfBirth: values.dateOfBirth,
          gender: values.gender,
          phoneNumber: values.phoneNumber,
          bloodGroup: values.bloodGroup,
          maritalStatus: values.maritalStatus,
          address: values.address,
          emergencyContact: {
            name: values.emergencyContactName,
            phone: values.emergencyContactPhone,
            relation: values.emergencyContactRelation,
          },
        };
        
        if (values.role === 'patient') {
          userProfile.doctorId = HARDCODED_DOCTOR_ID;
        }

        const userDocRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(userDocRef, userProfile, { merge: true });

        // If a patient signs up, add them to the doctor's patient list
        if (userProfile.role === 'patient' && userProfile.doctorId) {
          const doctorPatientsColRef = collection(firestore, 'users', userProfile.doctorId, 'patients');
          const patientLinkDoc = {
            patientId: user.uid,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email
          };
          const patientDocInDoctorList = doc(doctorPatientsColRef, user.uid);
          setDocumentNonBlocking(patientDocInDoctorList, patientLinkDoc, {});
        }
      }
      setOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message,
      });
    }
  }
  
  const handleSignUp = async (values: z.infer<typeof signupSchema>) => {
    try {
      await onSignupSubmit(values);
    } catch (error) {
      // The error is already handled and displayed as a toast in onSignupSubmit
    }
  };
  
  const handleForgotPassword = async () => {
    const email = loginForm.getValues("email");
    if (!email) {
      loginForm.setError("email", { type: "manual", message: "Please enter your email to reset password." });
      return;
    }
    try {
      await sendPasswordReset(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: `If an account exists for ${email}, you will receive an email with instructions to reset your password.`,
      });
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setIsForgotPassword(false);
        setShowPassword(false);
      }
    }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-0">
        <ScrollArea className="max-h-[90vh]">
        <div className="p-6">
        <Tabs defaultValue={defaultTab} className="w-full">
          <DialogHeader className="pb-0">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            {!isForgotPassword && (
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" onClick={() => setIsForgotPassword(false)}>Log In</TabsTrigger>
                <TabsTrigger value="signup" onClick={() => setIsForgotPassword(false)}>Sign Up</TabsTrigger>
              </TabsList>
            )}
          </DialogHeader>

          {isForgotPassword ? (
            <div className="pt-6">
              <DialogTitle className="text-xl font-bold text-center mb-1">
                Forgot Password
              </DialogTitle>
              <DialogDescription className="text-center mb-4">
                Enter your email to receive a password reset link.
              </DialogDescription>
              <Form {...loginForm}>
                <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }} className="space-y-4">
                   <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    Send Reset Link
                  </Button>
                  <Button variant="link" className="w-full" onClick={() => setIsForgotPassword(false)}>
                    Back to Login
                  </Button>
                </form>
              </Form>
            </div>
          ) : (
            <>
              <TabsContent value="login" className="pt-6">
                <DialogTitle className="text-xl font-bold text-center mb-1">
                  Welcome Back
                </DialogTitle>
                <DialogDescription className="text-center mb-4">
                  Enter your credentials to access your account.
                </DialogDescription>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="name@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                            </FormControl>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={togglePasswordVisibility}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                      Login
                    </Button>
                    <div className="text-sm text-center">
                      <button type="button" className="text-primary hover:underline" onClick={() => setIsForgotPassword(true)}>
                        Forgot Password?
                      </button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="signup" className="pt-6">
                <DialogTitle className="text-xl font-bold text-center mb-1">
                  Join Swasthya
                </DialogTitle>
                <DialogDescription className="text-center mb-4">
                  Start your journey to better health management.
                </DialogDescription>
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(handleSignUp)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>I am a...</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-2 gap-4"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="patient" id="patient" className="peer sr-only" />
                                </FormControl>
                                <FormLabel htmlFor="patient" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer w-full peer-data-[state=checked]:border-primary [&:has(.peer[data-state=checked])]:border-primary">
                                  <User className="mb-3 h-6 w-6" />
                                  Patient
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="doctor" id="doctor" className="peer sr-only" />
                                </FormControl>
                                <FormLabel htmlFor="doctor" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer w-full peer-data-[state=checked]:border-primary [&:has(.peer[data-state=checked])]:border-primary">
                                  <Stethoscope className="mb-3 h-6 w-6" />
                                  Doctor
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={signupForm.control}
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
                        control={signupForm.control}
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
                      control={signupForm.control}
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

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                        control={signupForm.control}
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
                                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={signupForm.control}
                        name="bloodGroup"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Blood Group</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="A+">A+</SelectItem>
                                    <SelectItem value="A-">A-</SelectItem>
                                    <SelectItem value="B+">B+</SelectItem>
                                    <SelectItem value="B-">B-</SelectItem>
                                    <SelectItem value="AB+">AB+</SelectItem>
                                    <SelectItem value="AB-">AB-</SelectItem>
                                    <SelectItem value="O+">O+</SelectItem>
                                    <SelectItem value="O-">O-</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                     <FormField
                      control={signupForm.control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marital Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your marital status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Single">Single</SelectItem>
                              <SelectItem value="Married">Married</SelectItem>
                              <SelectItem value="Divorced">Divorced</SelectItem>
                              <SelectItem value="Widowed">Widowed</SelectItem>
                              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
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

                    <FormField
                      control={signupForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Address</FormLabel>
                          <FormControl>
                            <Input placeholder="City, State, ZIP" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                        <FormLabel>Emergency Contact</FormLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                             <FormField
                                control={signupForm.control}
                                name="emergencyContactName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                    <Input placeholder="Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={signupForm.control}
                                name="emergencyContactPhone"
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                    <Input type="tel" placeholder="Phone" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={signupForm.control}
                                name="emergencyContactRelation"
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                    <Input placeholder="Relation" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                    </div>


                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="aditijaiswal@gmail.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                              </FormControl>
                              <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={togglePasswordVisibility}>
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                      Create Account
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </>
          )}
        </Tabs>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

    