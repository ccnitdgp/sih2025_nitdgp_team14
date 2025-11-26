
"use client";

import Link from "next/link";
import { LogOut, Settings, LayoutDashboard, Menu, FileText, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { doc } from 'firebase/firestore';
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const generalNavLinks = [
    { href: "/", label: "Home" },
    { href: "/vaccination", label: "Vaccination Drive" },
    { href: "/camps", label: "Visiting Camps" },
    { href: "/announcements", label: "Announcements" },
];

const doctorNavLinks = [
    { href: "/doctor-dashboard", label: "Dashboard" },
    { href: "/doctor-dashboard/patients", label: "Patients" },
    { href: "/doctor-dashboard/appointments", label: "Appointments" },
    { href: "/doctor-dashboard/prescriptions", label: "Prescriptions" },
    { href: "/doctor-dashboard/medical-info", label: "Medical Info"},
    { href: "/doctor-dashboard/upload-documents", label: "Upload Document" },
];

export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);
  
  const isDoctor = userProfile?.role === 'doctor';
  const navLinks = isDoctor ? doctorNavLinks : generalNavLinks;

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
          key={link.label}
          href={link.href}
          className="text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center">
        <div className="mr-auto flex items-center">
          <Logo />
        </div>
        
        <div className="flex items-center justify-end gap-2 sm:gap-4 ml-auto">
           <NavContent />
           
          {isUserLoading ? (
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ) : user ? (
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
                 <DropdownMenuItem onClick={() => router.push(userProfile?.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
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
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {isClient && 
                <div className="hidden sm:flex items-center gap-2">
                  <AuthDialog trigger={<Button variant="outline">Login</Button>} />
                  <AuthDialog trigger={<Button>Sign Up</Button>} defaultTab="signup" />
                </div>
              }
            </>
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
                          {!user && !isUserLoading && (
                            <div className="mt-6 flex flex-col gap-3">
                                <AuthDialog trigger={<Button variant="outline" className="w-full">Login</Button>} onOpenChange={setIsMobileMenuOpen} />
                              <AuthDialog trigger={<Button className="w-full">Sign Up</Button>} defaultTab="signup" onOpenChange={setIsMobileMenuOpen} />
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
