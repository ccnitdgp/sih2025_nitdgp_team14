
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

import {
  Bell,
  Fingerprint,
  Languages,
  Lock,
  Mail,
  Palette,
  ShieldCheck,
  Smartphone,
  User,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});


const SettingItem = ({ icon: Icon, title, description, control }) => (
  <>
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-muted rounded-md">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0">{control}</div>
    </div>
    <Separator />
  </>
);

const ComingSoonTooltip = ({ children }) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent>
                <p>Coming soon!</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);


export default function SettingsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading } = useDoc(userDocRef);
    
    const [preferredLanguage, setPreferredLanguage] = useState(userProfile?.preferredLanguage || 'en');
    const [dateFormat, setDateFormat] = useState(userProfile?.dateFormat || 'dd-mm-yyyy');
    const [notificationSettings, setNotificationSettings] = useState(userProfile?.notificationSettings || {});
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false});

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        }
    });

    useEffect(() => {
        if (userProfile) {
            setPreferredLanguage(userProfile.preferredLanguage || 'en');
            setDateFormat(userProfile.dateFormat || 'dd-mm-yyyy');
            setNotificationSettings(userProfile.notificationSettings || {});
        }
    }, [userProfile]);

    const handlePreferenceChange = (key: string, value: any) => {
        if (!userDocRef) return;

        if (key === 'preferredLanguage') {
            setPreferredLanguage(value);
        } else if (key === 'dateFormat') {
            setDateFormat(value);
        }

        updateDocumentNonBlocking(userDocRef, { [key]: value });
        toast({ title: 'Preference Saved', description: `Your ${key === 'preferredLanguage' ? 'language' : 'date format'} preference has been updated.` });
    };

    const handleNotificationChange = (key: string, value: boolean) => {
        if (!userDocRef) return;
        
        const newSettings = { ...notificationSettings, [key]: value };
        setNotificationSettings(newSettings);
        
        updateDocumentNonBlocking(userDocRef, { [`notificationSettings.${key}`]: value });
    };

    const handleChangePassword = async (values: z.infer<typeof passwordSchema>) => {
        if (!user || !user.email) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to change your password.' });
            return;
        }

        const auth = getAuth();
        const credential = EmailAuthProvider.credential(user.email, values.currentPassword);

        try {
            await reauthenticateWithCredential(auth.currentUser!, credential);
            await updatePassword(auth.currentUser!, values.newPassword);
            toast({ title: 'Success', description: 'Your password has been changed successfully.' });
            setIsPasswordDialogOpen(false);
            passwordForm.reset();
        } catch (error: any) {
            let description = 'An unexpected error occurred.';
            if (error.code === 'auth/wrong-password') {
                description = 'The current password you entered is incorrect. Please try again.';
                passwordForm.setError('currentPassword', { type: 'manual', message: 'Incorrect password' });
            } else if (error.code === 'auth/too-many-requests') {
                description = 'Too many failed attempts. Please try again later.';
            }
             toast({ variant: 'destructive', title: 'Password Change Failed', description });
        }
    };
    
    if (isLoading) {
        return <SettingsSkeleton />
    }

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <div className="space-y-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
            Settings
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Manage your account, privacy, and notification preferences.
          </p>
        </div>

        {/* Account & Personal Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account & Personal Settings</CardTitle>
            <CardDescription>
              Update your personal information and application preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingItem
              icon={User}
              title="Edit Profile"
              description="Update your name, contact details, and address."
              control={<Button variant="outline" asChild><Link href="/patient-profile">Edit</Link></Button>}
            />
             <SettingItem
              icon={Palette}
              title="Change Profile Photo"
              description="Upload a new profile picture."
              control={<ComingSoonTooltip><Button variant="outline" disabled>Upload</Button></ComingSoonTooltip>}
            />
            <SettingItem
              icon={Lock}
              title="Change Password"
              description="Set a new password for your account."
              control={<Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>Change</Button>}
            />
            <SettingItem
              icon={User}
              title="Manage Linked Accounts"
              description="Connect or disconnect your Google login."
              control={<ComingSoonTooltip><Button variant="outline" disabled>Manage</Button></ComingSoonTooltip>}
            />
            <SettingItem
              icon={Languages}
              title="Language Selection"
              description="Choose your preferred language for the app."
              control={
                <Select 
                    value={preferredLanguage} 
                    onValueChange={(value) => handlePreferenceChange('preferredLanguage', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
            <SettingItem
              icon={Languages}
              title="Date & Time Format"
              description="Select your preferred date and time display format."
              control={
                <Select 
                    value={dateFormat} 
                    onValueChange={(value) => handlePreferenceChange('dateFormat', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Date Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                    <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy & Security</CardTitle>
            <CardDescription>
              Control your privacy, data sharing, and security settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingItem
              icon={ShieldCheck}
              title="Two-Factor Authentication (2FA)"
              description="Add an extra layer of security to your account."
              control={<ComingSoonTooltip><Switch id="2fa" disabled /></ComingSoonTooltip>}
            />
             <SettingItem
              icon={User}
              title="Manage Consent & Data Sharing"
              description="e.g., Allow Doctor to View Records for 24 Hours"
              control={<ComingSoonTooltip><Button variant="outline" disabled>Manage</Button></ComingSoonTooltip>}
            />
            <SettingItem
              icon={Fingerprint}
              title="App Lock"
              description="Secure the app with a PIN, fingerprint, or Face ID."
              control={<ComingSoonTooltip><Switch id="app-lock" disabled /></ComingSoonTooltip>}
            />
             <SettingItem
              icon={User}
              title="Session & Login Activity"
              description="Review recent login locations and active sessions."
              control={<ComingSoonTooltip><Button variant="outline" disabled>View Activity</Button></ComingSoonTooltip>}
            />
            <SettingItem
              icon={User}
              title="Download My Data"
              description="Get a copy of your personal data."
              control={<ComingSoonTooltip><Button variant="outline" disabled>Download</Button></ComingSoonTooltip>}
            />
             <SettingItem
              icon={User}
              title="Delete/Deactivate Account"
              description="Permanently delete or temporarily deactivate your account."
              control={
                <ComingSoonTooltip>
                    <Button variant="destructive" disabled>
                        Manage Account
                    </Button>
                </ComingSoonTooltip>
              }
            />
          </CardContent>
        </Card>

        {/* Notifications & Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications & Alerts</CardTitle>
            <CardDescription>
              Choose which alerts you want to receive and how.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <SettingItem
              icon={Bell}
              title="Appointment Reminders"
              description="Get notified about your upcoming appointments."
              control={<Switch id="appointment-reminders" checked={notificationSettings?.appointmentReminders ?? true} onCheckedChange={(checked) => handleNotificationChange('appointmentReminders', checked)} />}
            />
            <SettingItem
              icon={Bell}
              title="Prescription / Medicine Reminders"
              description="Receive alerts to take your medication on time."
              control={<Switch id="prescription-reminders" checked={notificationSettings?.prescriptionReminders ?? false} onCheckedChange={(checked) => handleNotificationChange('prescriptionReminders', checked)} />}
            />
            <SettingItem
              icon={Bell}
              title="Vaccination Reminders"
              description="Stay updated on vaccine schedules."
              control={<Switch id="vaccination-reminders" checked={notificationSettings?.vaccinationReminders ?? true} onCheckedChange={(checked) => handleNotificationChange('vaccinationReminders', checked)} />}
            />
            <SettingItem
              icon={Bell}
              title="Health Tips / AI Suggestions"
              description="Receive occasional wellness tips and suggestions."
              control={<Switch id="health-tips" checked={notificationSettings?.healthTips ?? false} onCheckedChange={(checked) => handleNotificationChange('healthTips', checked)} />}
            />

            <div className="pt-6">
              <h4 className="font-semibold mb-2">Delivery Methods</h4>
              <div className="space-y-4">
                <SettingItem
                  icon={Mail}
                  title="Email Preferences"
                  description="Receive notifications via email."
                  control={<Switch id="email-prefs" checked={notificationSettings?.email ?? true} onCheckedChange={(checked) => handleNotificationChange('email', checked)} />}
                />
                <SettingItem
                  icon={Smartphone}
                  title="SMS Preferences"
                  description="Receive critical alerts via text message."
                  control={<Switch id="sms-prefs" checked={notificationSettings?.sms ?? false} onCheckedChange={(checked) => handleNotificationChange('sms', checked)} />}
                />
                <SettingItem
                  icon={Bell}
                  title="Push Preferences"
                  description="Get notifications directly on your device."
                  control={<Switch id="push-prefs" checked={notificationSettings?.push ?? true} onCheckedChange={(checked) => handleNotificationChange('push', checked)} />}
                />
              </div>
            </div>
            <div className="pt-6">
               <SettingItem
                icon={Bell}
                title="Mute Notifications"
                description="Temporarily pause all notifications."
                control={<ComingSoonTooltip><Button variant="outline" disabled>Mute for 1 hour</Button></ComingSoonTooltip>}
              />
            </div>
          </CardContent>
        </Card>
      </div>

       <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Your Password</DialogTitle>
                    <DialogDescription>
                        Enter your current password and a new password below.
                    </DialogDescription>
                </DialogHeader>
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                        <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input type={showPasswords.current ? 'text' : 'password'} {...field} />
                                        <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPasswords(p => ({...p, current: !p.current}))}>
                                          {showPasswords.current ? <EyeOff /> : <Eye />}
                                        </Button>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input type={showPasswords.new ? 'text' : 'password'} {...field} />
                                        <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPasswords(p => ({...p, new: !p.new}))}>
                                          {showPasswords.new ? <EyeOff /> : <Eye />}
                                        </Button>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input type={showPasswords.confirm ? 'text' : 'password'} {...field} />
                                        <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPasswords(p => ({...p, confirm: !p.confirm}))}>
                                          {showPasswords.confirm ? <EyeOff /> : <Eye />}
                                        </Button>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                                {passwordForm.formState.isSubmitting ? 'Changing...' : 'Change Password'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </div>
  );
}

const SettingsSkeleton = () => (
    <div className="container mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-12">
             <div className="text-center mb-12">
                <Skeleton className="h-10 w-64 mx-auto" />
                <Skeleton className="h-4 w-96 mx-auto mt-4" />
            </div>

            {[...Array(3)].map((_, cardIndex) => (
                <Card key={cardIndex}>
                    <CardHeader>
                        <Skeleton className="h-7 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        {[...Array(5)].map((_, itemIndex) => (
                            <div key={itemIndex} className="py-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 w-full">
                                        <Skeleton className="h-10 w-10 rounded-md" />
                                        <div className="w-full space-y-2">
                                            <Skeleton className="h-5 w-1/3" />
                                            <Skeleton className="h-4 w-2/3" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-10 w-24" />
                                </div>
                                <Separator className="mt-4"/>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
)

    