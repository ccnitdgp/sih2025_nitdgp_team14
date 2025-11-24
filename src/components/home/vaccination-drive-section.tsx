import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { vaccinationDrives } from "@/lib/data";
import { MapPin, CalendarDays, Clock } from "lucide-react";

export function VaccinationDriveSection() {
  return (
    <section id="vaccination" className="bg-card py-12 sm:py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
            Vaccination Drives
          </h2>
          <p className="mt-4 text-muted-foreground">
            Find and register for upcoming vaccination drives in your area.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {vaccinationDrives.map((drive) => (
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
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{drive.time}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="default">Register</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
