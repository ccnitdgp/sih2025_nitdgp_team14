
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
import { medicalNotifications } from '@/lib/data';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
            Medical Notifications
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Stay informed with the latest health advisories and public announcements.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {medicalNotifications.map((notification) => (
            <Card key={notification.id} className={cn("w-full border-l-4", notification.borderColor)}>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={`item-${notification.id}`} className="border-b-0">
                  <AccordionTrigger className="p-6 hover:no-underline text-left" hideChevron>
                    <div className="flex items-start w-full gap-4">
                      <notification.Icon className={cn("h-6 w-6 mt-1", notification.color)} />
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-lg">{notification.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className={cn("border-none text-xs font-bold", notification.color, notification.bgColor)}>
                            {notification.category}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{notification.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="pl-10">
                      <p className="text-muted-foreground">{notification.details}</p>
                    </div>
                  </AccordionContent>
                   <div className="px-6 pb-4 flex justify-end">
                      <AccordionTrigger className="p-2 w-auto hover:no-underline text-sm font-medium text-primary" hideChevron={false}>
                          View details
                      </AccordionTrigger>
                   </div>
                  </AccordionItem>
              </Accordion>
            </Card>
          ))}
        </div>
      </div>
      <div className="fixed bottom-4 right-1/2 translate-x-1/2">
        <Button size="lg" className="bg-gray-800 text-white shadow-lg hover:bg-gray-700">Get Medical Notifications</Button>
      </div>
    </div>
  );
}

// Add hideChevron to AccordionTrigger props
declare module "@radix-ui/react-accordion" {
  interface AccordionTriggerProps {
    hideChevron?: boolean;
  }
}

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

const OriginalAccordionTrigger = AccordionPrimitive.Trigger;

const CustomAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {hideChevron?: boolean}
>(({ className, children, hideChevron, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <OriginalAccordionTrigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      {!hideChevron && <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />}
    </OriginalAccordionTrigger>
  </AccordionPrimitive.Header>
));
CustomAccordionTrigger.displayName = "AccordionTrigger";

// @ts-ignore
AccordionPrimitive.Trigger = CustomAccordionTrigger;
