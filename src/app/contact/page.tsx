'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

const ContactDetail = ({ icon: Icon, title, value, href }) => (
  <div className="flex items-start gap-4">
    <div className="p-3 bg-primary/10 rounded-full mt-1">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <a href={href} className="text-muted-foreground hover:text-primary transition-colors">
        {value}
      </a>
    </div>
  </div>
);

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
          Get In Touch
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          We'd love to hear from you. Here's how you can reach us.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <ContactDetail 
            icon={Mail} 
            title="General Inquiries" 
            value="support@swasthya.example.com" 
            href="mailto:support@swasthya.example.com"
          />
          <ContactDetail 
            icon={Phone} 
            title="Phone Support" 
            value="+91 98765 43210" 
            href="tel:+919876543210"
          />
          <ContactDetail 
            icon={MapPin} 
            title="Our Office" 
            value="123 Health St, Wellness City, India 400001" 
            href="#"
          />
        </CardContent>
      </Card>
    </div>
  );
}
