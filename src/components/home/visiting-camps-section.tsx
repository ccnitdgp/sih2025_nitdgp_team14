import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { visitingCamps } from "@/lib/data";
import { MapPin, CalendarDays, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export function VisitingCampsSection() {
  return (
    <section id="camps" className="py-12 sm:py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between mb-12">
            <div className="text-left">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                    Visiting Camps
                </h2>
                <p className="mt-4 text-muted-foreground">
                    Get details about upcoming health camps near you.
                </p>
            </div>
            <Button asChild variant="outline">
                <Link href="/camps">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visitingCamps.slice(0,3).map((camp) => (
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
