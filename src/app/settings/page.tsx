

'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { useTheme } from "next-themes"


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
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { ModeToggle } from '@/components/mode-toggle';
import { BackButton } from '@/components/layout/back-button';


const languageFiles = {
    hi,
    bn,
    ta,
    te,
    mr
};

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

const ComingSoonTooltip = ({ children, t }) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent>
                <p>{t('coming_soon')}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);


export default function SettingsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading } = useDoc(userDocRef);
    
    const [preferredLanguage, setPreferredLanguage] = useState('en');
    const [dateFormat, setDateFormat] = useState('dd-mm-yyyy');
    const [notificationSettings, setNotificationSettings] = useState({});
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false});
    const [translations, setTranslations] = useState({});
    const [is2faEnabled, setIs2faEnabled] = useState(false);
    const [muteUntil, setMuteUntil] = useState<Date | null>(null);
    const [remainingMuteTime, setRemainingMuteTime] = useState('');

    const isMuted = muteUntil && muteUntil > new Date();

    const t = (key: string, fallback: string) => translations[key] || fallback;

    useEffect(() => {
        if (userProfile?.preferredLanguage && languageFiles[userProfile.preferredLanguage]) {
            setTranslations(languageFiles[userProfile.preferredLanguage]);
            setPreferredLanguage(userProfile.preferredLanguage);
        } else {
            setTranslations({}); // Default to English (empty object means use keys)
            setPreferredLanguage('en');
        }
        if (userProfile) {
            setDateFormat(userProfile.dateFormat || 'dd-mm-yyyy');
            setNotificationSettings(userProfile.notificationSettings || {});
        }
    }, [userProfile]);
    
     useEffect(() => {
        if (!isMuted) return;

        const updateTimer = () => {
            const now = new Date();
            const diff = muteUntil.getTime() - now.getTime();
            if (diff <= 0) {
                setMuteUntil(null);
                setRemainingMuteTime('');
                toast({ title: 'Notifications Unmuted', description: 'You will now receive notifications again.' });
                return;
            }
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setRemainingMuteTime(`${minutes}m ${seconds}s`);
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);
    }, [isMuted, muteUntil, toast]);

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        }
    });

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
            toast({ title: 'Success', description: t('password_change_success', 'Your password has been changed successfully.') });
            setIsPasswordDialogOpen(false);
            passwordForm.reset();
        } catch (error: any) {
            let description = 'An unexpected error occurred.';
            if (error.code === 'auth/wrong-password') {
                description = t('wrong_password_error', 'The current password you entered is incorrect. Please try again.');
                passwordForm.setError('currentPassword', { type: 'manual', message: 'Incorrect password' });
            } else if (error.code === 'auth/too-many-requests') {
                description = t('too_many_requests_error', 'Too many unsuccessful attempts. Please try again later.');
            }
             toast({ variant: 'destructive', title: t('password_change_failed', 'Password Change Failed'), description });
        }
    };
    
    const handleMute = () => {
        const oneHourFromNow = new Date(new Date().getTime() + 60 * 60 * 1000);
        setMuteUntil(oneHourFromNow);
        toast({ title: 'Notifications Muted', description: 'All notifications have been paused for one hour.' });
    };
    
    if (isLoading && !userProfile) {
        return <SettingsSkeleton />
    }

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <BackButton />
      <div className="space-y-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
            {t('settings_title', 'Settings')}
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t('settings_description', 'Manage your account, privacy, and notification preferences.')}
          </p>
        </div>

        {/* Account & Personal Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t('account_settings_title', 'Account & Personal Settings')}</CardTitle>
            <CardDescription>
              {t('account_settings_description', 'Update your personal information and application preferences.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingItem
              icon={User}
              title={t('edit_profile_title', 'Edit Profile')}
              description={t('edit_profile_description', 'Update your name, contact details, and address.')}
              control={<Button variant="outline" asChild><Link href="/patient-profile">{t('edit_profile_button', 'Edit')}</Link></Button>}
            />
            <SettingItem
              icon={Lock}
              title={t('change_password_title', 'Change Password')}
              description={t('change_password_description', 'Set a new password for your account.')}
              control={<Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>{t('change_password_button', 'Change')}</Button>}
            />
             <SettingItem
              icon={Palette}
              title="Theme"
              description="Choose your preferred interface appearance."
              control={<ModeToggle />}
            />
            <SettingItem
              icon={User}
              title={t('manage_linked_accounts_title', 'Manage Linked Accounts')}
              description={t('manage_linked_accounts_description', 'Connect or disconnect your Google login.')}
              control={<ComingSoonTooltip t={t}><Button variant="outline" disabled>{t('manage_button', 'Manage')}</Button></ComingSoonTooltip>}
            />
            <SettingItem
              icon={Languages}
              title={t('language_selection_title', 'Language Selection')}
              description={t('language_selection_description', 'Choose your preferred language for the app.')}
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
                    <SelectItem value="bn">Bengali</SelectItem>
                    <SelectItem value="ta">Tamil</SelectItem>
                    <SelectItem value="te">Telugu</SelectItem>
                    <SelectItem value="mr">Marathi</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle>{t('privacy_security_title', 'Privacy & Security')}</CardTitle>
            <CardDescription>
              {t('privacy_security_description', 'Control your privacy, data sharing, and security settings.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingItem
              icon={ShieldCheck}
              title={t('two_factor_auth_title', 'Two-Factor Authentication (2FA)')}
              description={t('two_factor_auth_description', 'Add an extra layer of security to your account.')}
              control={<Switch id="2fa" checked={is2faEnabled} onCheckedChange={setIs2faEnabled} />}
            />
             <SettingItem
              icon={User}
              title={t('manage_consent_title', 'Manage Consent & Data Sharing')}
              description={t('manage_consent_description', 'E.g., allow a doctor to view records for 24 hours')}
              control={<ComingSoonTooltip t={t}><Button variant="outline" disabled>{t('manage_button', 'Manage')}</Button></ComingSoonTooltip>}
            />
            <SettingItem
              icon={Fingerprint}
              title={t('app_lock_title', 'App Lock')}
              description={t('app_lock_description', 'Secure the app with a PIN, fingerprint, or Face ID.')}
              control={<ComingSoonTooltip t={t}><Switch id="app-lock" disabled /></ComingSoonTooltip>}
            />
             <SettingItem
              icon={User}
              title={t('session_activity_title', 'Session & Login Activity')}
              description={t('session_activity_description', 'Review recent login locations and active sessions.')}
              control={<ComingSoonTooltip t={t}><Button variant="outline" disabled>{t('view_activity_button', 'View Activity')}</Button></ComingSoonTooltip>}
            />
            <SettingItem
              icon={User}
              title={t('download_my_data_title', 'Download My Data')}
              description={t('download_my_data_description', 'Get a copy of your personal data.')}
              control={<ComingSoonTooltip t={t}><Button variant="outline" disabled>{t('download_button', 'Download')}</Button></ComingSoonTooltip>}
            />
          </CardContent>
        </Card>

        {/* Notifications & Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>{t('notifications_alerts_title', 'Notifications & Alerts')}</CardTitle>
            <CardDescription>
              {t('notifications_alerts_description', 'Choose which alerts you want to receive and how.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
             <SettingItem
              icon={Bell}
              title={t('appointment_reminders_title', 'Appointment Reminders')}
              description={t('appointment_reminders_description', 'Get notified about your upcoming appointments.')}
              control={<Switch id="appointment-reminders" disabled={isMuted} checked={notificationSettings?.appointmentReminders ?? true} onCheckedChange={(checked) => handleNotificationChange('appointmentReminders', checked)} />}
            />
            <SettingItem
              icon={Bell}
              title={t('prescription_reminders_title', 'Prescription Reminders')}
              description={t('prescription_reminders_description', 'Receive alerts to take your medication on time.')}
              control={<Switch id="prescription-reminders" disabled={isMuted} checked={notificationSettings?.prescriptionReminders ?? false} onCheckedChange={(checked) => handleNotificationChange('prescriptionReminders', checked)} />}
            />
            <SettingItem
              icon={Bell}
              title={t('vaccination_reminders_title', 'Vaccination Reminders')}
              description={t('vaccination_reminders_description', 'Stay up-to-date on immunization schedules.')}
              control={<Switch id="vaccination-reminders" disabled={isMuted} checked={notificationSettings?.vaccinationReminders ?? true} onCheckedChange={(checked) => handleNotificationChange('vaccinationReminders', checked)} />}
            />
            <SettingItem
              icon={Bell}
              title={t('health_tips_title', 'Health Tips')}
              description={t('health_tips_description', 'Receive occasional wellness tips and suggestions.')}
              control={<Switch id="health-tips" disabled={isMuted} checked={notificationSettings?.healthTips ?? false} onCheckedChange={(checked) => handleNotificationChange('healthTips', checked)} />}
            />

            <div className="pt-6">
               <SettingItem
                icon={Bell}
                title={t('mute_notifications_title', 'Mute Notifications')}
                description={t('mute_notifications_description', 'Temporarily pause all notifications.')}
                control={<Button variant="outline" onClick={handleMute} disabled={isMuted}>{isMuted ? `Muted (${remainingMuteTime})` : t('mute_for_1_hour_button', 'Mute for 1 Hour')}</Button>}
              />
            </div>
          </CardContent>
        </Card>
      </div>

       <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('change_password_dialog_title', 'Change Your Password')}</DialogTitle>
                    <DialogDescription>
                        {t('change_password_dialog_description', 'Enter your current password and a new password below.')}
                    </DialogDescription>
                </DialogHeader>
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                        <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('current_password_label', 'Current Password')}</FormLabel>
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
                                    <FormLabel>{t('new_password_label', 'New Password')}</FormLabel>
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
                                    <FormLabel>{t('confirm_new_password_label', 'Confirm New Password')}</FormLabel>
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
                                <Button type="button" variant="outline">{t('cancel_button', 'Cancel')}</Button>
                            </DialogClose>
                            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                                {passwordForm.formState.isSubmitting ? t('changing_button', 'Changing...') : t('change_password_button', 'Change Password')}
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


    