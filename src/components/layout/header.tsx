"use client";

import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleRedirect } from "@/components/auth/role-redirect";
import { doc } from 'firebase/firestore';

const patientNavLinks = [
  { href: "/patient-dashboard", label: "Home" },
  { href: "#", label: "Assistant" },
  { href: "/records", label: "Records" },
  { href: "/notifications", label: "Notifications" },
  { href: "/appointments", label: "Appointment" },
  { href: "/billing", label: "Bills" },
];

const doctorNavLinks = [
    { href: "/doctor-dashboard", label: "Dashboard" },
    { href: "#", label: "Patients" },
    { href: "/records", label: "Records" },
    { href: "#", label: "Appointments" },
];


export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.push('/');
    });
  };
  
  const navLinks = userProfile?.role === 'doctor' ? doctorNavLinks : patientNavLinks;
  const publicNavLinks =  [
    { href: "/vaccination", label: "Vaccination Drive" },
    { href: "/camps", label: "Visiting Camps" },
    { href: "/notifications", label: "Medical Notification" },
  ];

  return (
    <>
    <RoleRedirect />
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <div className="mr-4 flex">
          <Logo />
        </div>
        
        <nav className="hidden md:flex md:items-center md:gap-6 text-sm font-medium">
          {(user ? navLinks : publicNavLinks).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
          {isUserLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? `https://picsum.photos/seed/${user.uid}/200`} alt={user.displayName ?? "User"} />
                    <AvatarFallback>
                      {userProfile?.firstName?.charAt(0).toUpperCase() ?? user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
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
              <AuthDialog trigger={<Button variant="outline">Login</Button>} />
              <AuthDialog trigger={<Button>Sign Up</Button>} defaultTab="signup" />
            </>
          )}
        </div>
      </div>
    </header>
    </>
  );
}
