'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Card,
} from '@/components/ui/card';
import { vaccinationDrives } from '@/lib/data';
import { Calendar, MapPin, Syringe } from 'lucide-react';
import { Highlight } from '@/components/ui/highlight';


export default function VaccinationPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
            Vaccination Drives
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Stay protected. Find information about upcoming vaccination drives
            near you.
          </p>
        </div>
        <div className="space-y-8">
            {vaccinationDrives.map((drive) => (
              <Card key={drive.id} className="w-full transition-shadow hover:shadow-lg">
                <Accordion type="single" collapsible className="w-full" defaultValue={searchQuery && (drive.name.toLowerCase().includes(searchQuery) || drive.details.toLowerCase().includes(searchQuery)) ? `item-${drive.id}` : undefined}>
                  <AccordionItem value={`item-${drive.id}`} className="border-b-0">
                    <AccordionTrigger className="p-6 hover:no-underline text-left">
                      <div className="flex items-start w-full gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Syringe className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h3 className="font-semibold text-lg">
                            <Highlight text={drive.name} query={searchQuery} />
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{drive.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{drive.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="pl-16 space-y-4">
                        <p className="text-muted-foreground">
                           <Highlight text={drive.details} query={searchQuery} />
                        </p>
                        <Button>Register Now</Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
