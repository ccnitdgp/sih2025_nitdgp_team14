
"use client";

import Link from "next/link";
import { LogOut, Settings, LayoutDashboard, Menu, FileText, UserPlus, User, CalendarPlus, Receipt, Bot, BookUser, Sparkles, Shield, MessageSquare, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { doc } from 'firebase/firestore';
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { ModeToggle } from "../mode-toggle";

const languageFiles = { hi, bn, ta, te, mr };

const generalNavLinks = [
    { href: "/", label: "Home", i18n_key: "home_link" },
    { href: "/vaccination", label: "Vaccination Drive", i18n_key: "vaccination_drive_link" },
    { href: "/camps", label: "Visiting Camps", i18n_key: "visiting_camps_link" },
    { href: "/announcements", label: "Announcements", i18n_key: "announcements_link" },
];

const patientNavLinks = [
    { href: "/patient-dashboard", label: "Dashboard", i18n_key: "dashboard_link" },
    { href: "/appointments", label: "Book Appointment", i18n_key: "book_appointment_link" },
    { href: "/records", label: "Records", i18n_key: "records_link" },
    { href: "/billing", label: "Pay Bill", i18n_key: "pay_bill_link" },
    { href: "/patient-dashboard#health-assistant", label: "Health Assistant", i18n_key: "health_assistant_link" },
    { href: "/notifications", label: "Notifications", i18n_key: "my_notifications_page_title" },
    { href: "/forum", label: "Forum", i18n_key: "forum_link" },
]

const doctorNavLinks = [
    { href: "/doctor-dashboard", label: "Dashboard", i18n_key: "dashboard_link" },
    { href: "/doctor-dashboard/profile", label: "Profile", i18n_key: "profile_link" },
    { href: "/doctor-dashboard/appointments", label: "Appointments", i18n_key: "appointments_link" },
    { href: "/doctor-dashboard/patients", label: "Patients", i18n_key: "patients_link" },
    { href: "/doctor-dashboard/prescriptions", label: "Prescriptions", i18n_key: "prescriptions_link" },
    { href: "/doctor-dashboard/medical-info", label: "Medical Info", i18n_key: "medical_info_link"},
    { href: "/doctor-dashboard/upload-documents", label: "Upload Documents", i18n_key: "upload_documents_link" },
    { href: "/forum", label: "Forum", i18n_key: "forum_link" },
];

const adminNavLinks = [
    { href: "/admin-dashboard", label: "Dashboard", i18n_key: "dashboard_link" },
];


export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [translations, setTranslations] = useState({});

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);

  const t = (key: string, fallback: string) => translations[key] || fallback;

  useEffect(() => {
    setIsClient(true);
    if (userProfile?.preferredLanguage && languageFiles[userProfile.preferredLanguage]) {
      setTranslations(languageFiles[userProfile.preferredLanguage]);
    } else {
      setTranslations({}); // Default to English
    }
  }, [userProfile]);
  
  const isDoctor = userProfile?.role === 'doctor';
  const isPatient = userProfile?.role === 'patient';
  const isAdmin = userProfile?.role === 'admin';

  let navLinks = generalNavLinks;
  if (user) {
    if (isDoctor) {
      navLinks = doctorNavLinks;
    } else if (isPatient) {
      navLinks = patientNavLinks;
    } else if (isAdmin) {
      navLinks = adminNavLinks;
    }
  }


  const handleLogout = () => {
    signOut(auth).then(() => {
      router.push('/');
    });
  };

  const NavContent = ({isMobile = false}: {isMobile?: boolean}) => (
    <nav className={cn(
      "items-center text-sm font-medium",
      isMobile ? "flex flex-col gap-4 p-4" : "hidden md:flex gap-6"
    )}>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          {t(link.i18n_key, link.label)}
        </Link>
      ))}
    </nav>
  );

  const getDashboardPath = () => {
    if (isAdmin) return '/admin-dashboard';
    if (isDoctor) return '/doctor-dashboard';
    if (isPatient) return '/patient-dashboard';
    return '/';
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center">
        <div className="mr-auto flex items-center">
          <Logo />
        </div>
        
        <div className="flex items-center justify-end gap-2 sm:gap-4 ml-auto">
           <NavContent />
           
          {isClient ? (
            isUserLoading ? (
              <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ) : user ? (
              <>
                <ModeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? "User"} />
                        <AvatarFallback>
                          {userProfile?.firstName?.charAt(0).toUpperCase() ?? user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem onClick={() => router.push(getDashboardPath())}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>{t('dashboard_link', 'Dashboard')}</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => router.push('/admin-dashboard')}>
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : 'Welcome'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t('settings_link', 'Settings')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('logout_link', 'Log out')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <ModeToggle />
                  <AuthDialog trigger={<Button variant="outline">{t('login_button', 'Login')}</Button>} />
                  <AuthDialog trigger={<Button>{t('signup_button', 'Sign Up')}</Button>} defaultTab="signup" />
                </div>
            )
          ) : (
             <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          )}

          {isClient && (
            <div className="md:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Open navigation menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                     <SheetHeader>
                        <SheetTitle><Logo /></SheetTitle>
                        <SheetDescription className="sr-only">
                          Main navigation menu
                        </SheetDescription>
                     </SheetHeader>
                    <div className="py-4">
                        <div className="mt-8">
                          <NavContent isMobile />
                           <div className="mt-4">
                            <ModeToggle />
                          </div>
                          {!user && !isUserLoading && (
                            <div className="mt-6 flex flex-col gap-3">
                                <AuthDialog trigger={<Button variant="outline" className="w-full">{t('login_button', 'Login')}</Button>} onOpenChange={(isOpen) => !isOpen && setIsMobileMenuOpen(false)} />
                                <AuthDialog trigger={<Button className="w-full">{t('signup_button', 'Sign Up')}</Button>} defaultTab="signup" onOpenChange={(isOpen) => !isOpen && setIsMobileMenuOpen(false)} />
                            </div>
                          )}
                        </div>
                    </div>
                  </SheetContent>
                </Sheet>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}

    