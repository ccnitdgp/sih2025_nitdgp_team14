
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, CalendarDays, ArrowRight, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from "../ui/skeleton";

export function VisitingCampsSection() {
  const firestore = useFirestore();

  const campsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'healthCamps'));
  }, [firestore]);

  const { data: visitingCamps, isLoading } = useCollection(campsQuery);

  const CampSkeleton = () => (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-6 w-3/4" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-1/3" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );

  return (
    <section id="camps" className="py-12 sm:py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div className="text-left">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                    Free Health Check-up Camps
                </h2>
                <p className="mt-2 text-muted-foreground max-w-2xl">
                    Get details about upcoming health camps near you for free consultations and check-ups.
                </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
                <Link href="/camps">
                    View All Camps <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoading && !visitingCamps ? (
            <>
              <CampSkeleton />
              <CampSkeleton />
              <CampSkeleton />
            </>
          ) : visitingCamps && visitingCamps.length > 0 ? (
            visitingCamps.slice(0, 3).map((camp) => (
              <Card key={camp.id} className="flex flex-col transition-shadow hover:shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Stethoscope className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{camp.description}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{camp.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>{new Date(camp.startTime).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="secondary" className="w-full">
                      <Link href="/camps">
                        Learn More
                      </Link>
                    </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
             <Card className="md:col-span-3">
                <CardHeader>
                <CardTitle>No Health Camps</CardTitle>
                <CardDescription>There are no upcoming health camps scheduled at this time.</CardDescription>
                </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
