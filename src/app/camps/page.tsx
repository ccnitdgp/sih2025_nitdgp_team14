
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { visitingCamps } from '@/lib/data';
import { Calendar, MapPin, Stethoscope } from 'lucide-react';

export default function CampsPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
            Visiting Medical Camps
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Find information about upcoming free health camps organized for your community.
          </p>
        </div>
        <div className="space-y-8">
          {visitingCamps.map((camp) => (
            <Card key={camp.id} className="w-full">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={`item-${camp.id}`} className="border-b-0">
                  <AccordionTrigger className="p-6 hover:no-underline text-left">
                    <div className="flex items-start w-full gap-4">
                      <div className="p-3 bg-accent/20 rounded-full">
                        <Stethoscope className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-lg">{camp.name}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{camp.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{camp.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="pl-16">
                      <p className="text-muted-foreground">{camp.details}</p>
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
