import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { vaccinationDrives } from '@/lib/data';
import { Calendar, MapPin, Syringe } from 'lucide-react';

export default function VaccinationPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Accordion type="single" collapsible className="w-full col-span-1 md:col-span-2 space-y-8">
            {vaccinationDrives.map((drive) => (
              <Card key={drive.id} className="w-full">
                <AccordionItem value={`item-${drive.id}`} className="border-b-0">
                  <AccordionTrigger className="p-6 hover:no-underline">
                    <div className="flex items-start text-left w-full gap-4">
                      <div className="p-3 bg-accent/20 rounded-full">
                        <Syringe className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-lg">{drive.name}</h3>
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
                    <div className="pl-16">
                      <p className="text-muted-foreground">{drive.details}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            ))}
          </Accordion>
        </div>
      </div>
      <div className="fixed bottom-4 right-1/2 translate-x-1/2">
        <Button size="lg" className="bg-gray-800 text-white shadow-lg hover:bg-gray-700">Get Vaccination Updates</Button>
      </div>
    </div>
  );
}
