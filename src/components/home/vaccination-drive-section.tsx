import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { vaccinationDrives } from "@/lib/data";
import { MapPin, CalendarDays, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export function VaccinationDriveSection() {
  return (
    <section id="vaccination" className="bg-card py-12 sm:py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between mb-12">
            <div className="text-left">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                    Vaccination Drives
                </h2>
                <p className="mt-4 text-muted-foreground">
                    Find and register for upcoming vaccination drives in your area.
                </p>
            </div>
            <Button asChild variant="outline">
                <Link href="/vaccination">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {vaccinationDrives.slice(0, 3).map((drive) => (
            <Card key={drive.id} className="flex flex-col transition-shadow hover:shadow-xl">
              <CardHeader>
                <CardTitle>{drive.name}</CardTitle>
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
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
