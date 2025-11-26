
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { vaccinationDrives } from "@/lib/data";
import { MapPin, CalendarDays, ArrowRight, Syringe } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { AuthDialog } from "@/components/auth/auth-dialog";

export function VaccinationDriveSection() {
  const { user } = useUser();

  const RegisterButton = ({ driveId }) => {
    if (user) {
      // If user is logged in, link to the details page
      return (
         <Button asChild variant="secondary" className="w-full">
            <Link href="/vaccination">
                View Details & Register
            </Link>
        </Button>
      );
    }
    // If user is not logged in, trigger the Auth dialog
    return (
      <AuthDialog 
        trigger={
           <Button variant="secondary" className="w-full">
                View Details & Register
            </Button>
        }
      />
    );
  };

  return (
    <section id="vaccination" className="py-12 sm:py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div className="text-left">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                    Upcoming Vaccination Drives
                </h2>
                <p className="mt-2 text-muted-foreground max-w-2xl">
                    Find and register for vaccination drives in your area to stay protected.
                </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
                <Link href="/vaccination">
                    View All Drives <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {vaccinationDrives.slice(0, 3).map((drive) => (
            <Card key={drive.id} className="flex flex-col transition-shadow hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Syringe className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{drive.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                 <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{drive.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>{drive.date}</span>
                </div>
              </CardContent>
              <CardFooter>
                 <RegisterButton driveId={drive.id} />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
