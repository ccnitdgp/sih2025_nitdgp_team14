
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Eye, EyeOff, User, Stethoscope } from "lucide-react";
import { useAuth } from "@/firebase";
import { initiateEmailSignIn, initiateEmailSignUp, sendPasswordReset } from "@/firebase/non-blocking-login";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
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
import { useRouter } from "next/navigation";

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
  fullAddress: z.string().min(1, { message: "Full address is required." }),
  city: z.string().min(1, { message: "City is required." }),
  state: z.string().min(1, { message: "State is required." }),
  country: z.string().min(1, { message: "Country is required." }),
  pinCode: z.string().min(1, { message: "Pin Code is required." }),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
  confirmPassword: z.string(),
  doctorId: z.string().optional(),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Passwords do not match.",
            path: ["confirmPassword"],
        });
    }
    if (data.role === 'patient') {
        if (!data.bloodGroup) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Blood group is required.",
                path: ["bloodGroup"],
            });
        }
        if (!data.emergencyContactName) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Emergency contact name is required.",
                path: ["emergencyContactName"],
            });
        }
        if (!data.emergencyContactPhone) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Emergency contact phone is required.",
                path: ["emergencyContactPhone"],
            });
        }
        if (!data.emergencyContactRelation) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Emergency contact relation is required.",
                path: ["emergencyContactRelation"],
            });
        }
    }
});


type AuthDialogProps = {
  trigger: React.ReactNode;
  defaultTab?: "login" | "signup";
  onOpenChange?: (open: boolean) => void;
};

// This is a placeholder. In a real app, you'd have a system to assign doctors.
const HARDCODED_DOCTOR_ID = "Y43GFgpcD3QY6xGM3f83hTzYV5i2";

export function AuthDialog({ trigger, defaultTab = "login", onOpenChange }: AuthDialogProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

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
      confirmPassword: "",
      fullAddress: "",
      city: "",
      state: "",
      country: "",
      pinCode: "",
      bloodGroup: undefined,
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      doctorId: HARDCODED_DOCTOR_ID,
      height: undefined,
      weight: undefined,
    },
  });

  const selectedRole = signupForm.watch("role");

  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    try {
      await initiateEmailSignIn(auth, values.email, values.password);
      setOpen(false);
      onOpenChange?.(false);
      router.push('/login-redirect');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid credentials. Please check your email and password.",
      });
    }
  }

  async function onSignupSubmit(values: z.infer<typeof signupSchema>) {
    try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where("email", "==", values.email));
        const querySnapshot = await getDocs(q);

        let userProfileData: any = {
            id: '', // Will be set later
            firstName: values.firstName,
            lastName: values.lastName,
            role: values.role,
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
        };

        if (values.role === 'patient') {
            Object.assign(userProfileData, {
                doctorId: HARDCODED_DOCTOR_ID,
                bloodGroup: values.bloodGroup,
                emergencyContact: {
                    name: values.emergencyContactName,
                    phone: values.emergencyContactPhone,
                    relation: values.emergencyContactRelation,
                },
                healthMetrics: {
                    height: values.height,
                    weight: values.weight,
                }
            });
        }

        if (!querySnapshot.empty) {
            // Email exists, this user was likely pre-registered by a doctor.
            // We'll update their record with a new auth UID.
            const userCredential = await initiateEmailSignUp(auth, values.email, values.password);
            const user = userCredential.user;
            
            const batch = writeBatch(firestore);

            // Delete the old, un-owned document
            const oldDocRef = querySnapshot.docs[0].ref;
            batch.delete(oldDocRef);

            // Create a new document with the correct UID
            const newDocRef = doc(firestore, 'users', user.uid);
            userProfileData.id = user.uid; // Set the correct ID
            batch.set(newDocRef, userProfileData);

            await batch.commit();

        } else {
            // This is a brand new user.
            const userCredential = await initiateEmailSignUp(auth, values.email, values.password);
            const user = userCredential.user;
            
            userProfileData.id = user.uid; // Set the correct ID
            const newUserDocRef = doc(firestore, 'users', user.uid);
            setDocumentNonBlocking(newUserDocRef, userProfileData, {});
            
             // If the user is a doctor, create their public profile
            if (values.role === 'doctor') {
                const publicDoctorProfile = {
                    id: user.uid,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    specialty: "General Physician", // Placeholder
                    city: values.city,
                    state: values.state,
                    country: values.country,
                };
                const doctorDocRef = doc(firestore, 'doctors', user.uid);
                setDocumentNonBlocking(doctorDocRef, publicDoctorProfile, {});
            }
        }
        
        setOpen(false);
        onOpenChange?.(false);
        router.push('/login-redirect');
        
    } catch (error: any) {
        let errorMessage = error.message;
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "An account with this email already exists. Please log in or use a different email.";
        }
        toast({
            variant: "destructive",
            title: "Sign up failed",
            description: errorMessage,
        });
    }
}
  
  const handleForgotPassword = async () => {
    // Manually trigger validation on the email field.
    const isValid = await loginForm.trigger("email");
    if (!isValid) {
      // If validation fails, react-hook-form will automatically show the error message.
      return;
    }

    const email = loginForm.getValues("email");
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
        description: "Failed to send password reset email. Please try again.",
      });
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    onOpenChange?.(isOpen);
    if (!isOpen) {
      setIsForgotPassword(false);
      setShowPassword(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
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
                        {selectedRole === 'patient' && (
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
                        )}
                    </div>
                    
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

                     <div className="space-y-2">
                        <FormLabel>Address</FormLabel>
                        <FormField control={signupForm.control} name="fullAddress" render={({ field }) => (<FormItem><FormControl><Input placeholder="Full Address" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={signupForm.control} name="city" render={({ field }) => (<FormItem><FormControl><Input placeholder="City" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={signupForm.control} name="state" render={({ field }) => (<FormItem><FormControl><Input placeholder="State" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={signupForm.control} name="country" render={({ field }) => (<FormItem><FormControl><Input placeholder="Country" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={signupForm.control} name="pinCode" render={({ field }) => (<FormItem><FormControl><Input placeholder="Pin Code" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    </div>


                    {selectedRole === 'patient' && (
                      <>
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
                        <div>
                          <FormLabel>Health Metrics</FormLabel>
                           <div className="grid grid-cols-2 gap-4 mt-2">
                              <FormField control={signupForm.control} name="height" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Height (cm)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={signupForm.control} name="weight" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Weight (kg)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                           </div>
                        </div>
                      </>
                    )}


                    <FormField
                      control={signupForm.control}
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
                     <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
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

    