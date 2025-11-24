import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { visitingCamps } from "@/lib/data";
import { MapPin, CalendarDays, Clock } from "lucide-react";

export function VisitingCampsSection() {
  return (
    <section id="camps" className="py-12 sm:py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
            Visiting Camps
          </h2>
          <p className="mt-4 text-muted-foreground">
            Get details about upcoming health camps near you.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visitingCamps.map((camp) => (
            <Card key={camp.id} className="flex flex-col transition-shadow hover:shadow-xl">
              <CardHeader>
                <CardTitle>{camp.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{camp.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>{camp.date}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{camp.time}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">View Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
