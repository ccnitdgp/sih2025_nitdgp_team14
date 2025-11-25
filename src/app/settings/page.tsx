'use client';

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
      <div>{control}</div>
    </div>
    <Separator />
  </>
);

export default function SettingsPage() {
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
              control={<Button variant="outline">Edit</Button>}
            />
            <SettingItem
              icon={Palette}
              title="Change Profile Photo"
              description="Upload a new profile picture."
              control={<Button variant="outline">Upload</Button>}
            />
            <SettingItem
              icon={Lock}
              title="Change Password"
              description="Set a new password for your account."
              control={<Button variant="outline">Change</Button>}
            />
            <SettingItem
              icon={User}
              title="Manage Linked Accounts"
              description="Connect or disconnect your Google login."
              control={<Button variant="outline">Manage</Button>}
            />
            <SettingItem
              icon={Languages}
              title="Language Selection"
              description="Choose your preferred language for the app."
              control={
                <Select defaultValue="en">
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
                <Select defaultValue="dd-mm-yyyy">
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
              control={<Switch id="2fa" />}
            />
            <SettingItem
              icon={User}
              title="Manage Consent & Data Sharing"
              description="e.g., Allow Doctor to View Records for 24 Hours"
              control={<Button variant="outline">Manage</Button>}
            />
            <SettingItem
              icon={Fingerprint}
              title="App Lock"
              description="Secure the app with a PIN, fingerprint, or Face ID."
              control={<Switch id="app-lock" />}
            />
            <SettingItem
              icon={User}
              title="Session & Login Activity"
              description="Review recent login locations and active sessions."
              control={<Button variant="outline">View Activity</Button>}
            />
            <SettingItem
              icon={User}
              title="Download My Data"
              description="Get a copy of your personal data."
              control={<Button variant="outline">Download</Button>}
            />
            <SettingItem
              icon={User}
              title="Delete/Deactivate Account"
              description="Permanently delete or temporarily deactivate your account."
              control={
                <Button variant="destructive">
                  Manage Account
                </Button>
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
              control={<Switch id="appointment-reminders" defaultChecked />}
            />
            <SettingItem
              icon={Bell}
              title="Prescription / Medicine Reminders"
              description="Receive alerts to take your medication on time."
              control={<Switch id="prescription-reminders" />}
            />
            <SettingItem
              icon={Bell}
              title="Vaccination Reminders"
              description="Stay updated on vaccine schedules."
              control={<Switch id="vaccination-reminders" defaultChecked />}
            />
            <SettingItem
              icon={Bell}
              title="Health Tips / AI Suggestions"
              description="Receive occasional wellness tips and suggestions."
              control={<Switch id="health-tips" />}
            />

            <div className="pt-6">
              <h4 className="font-semibold mb-2">Delivery Methods</h4>
              <div className="space-y-4">
                <SettingItem
                  icon={Mail}
                  title="Email Preferences"
                  description="Receive notifications via email."
                  control={<Switch id="email-prefs" defaultChecked />}
                />
                <SettingItem
                  icon={Smartphone}
                  title="SMS Preferences"
                  description="Receive critical alerts via text message."
                  control={<Switch id="sms-prefs" />}
                />
                <SettingItem
                  icon={Bell}
                  title="Push Preferences"
                  description="Get notifications directly on your device."
                  control={<Switch id="push-prefs" defaultChecked />}
                />
              </div>
            </div>
            <div className="pt-6">
              <SettingItem
                icon={Bell}
                title="Mute Notifications"
                description="Temporarily pause all notifications."
                control={<Button variant="outline">Mute for 1 hour</Button>}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
