'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Target, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
          About Swasthya
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Our mission is to make healthcare accessible and manageable for everyone, everywhere.
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><Target className="h-6 w-6 text-primary"/> Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              In a world where access to healthcare can be fragmented and complex, Swasthya was born out of a simple idea: to create a unified platform that empowers individuals to take control of their health journey. We aim to bridge the gap between patients and healthcare providers by providing intuitive, accessible, and secure digital health services. From finding local health drives to managing personal medical records, our goal is to put essential healthcare information at your fingertips.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><Info className="h-6 w-6 text-primary"/> What We Do</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              Swasthya is a comprehensive digital health platform designed to serve communities by providing timely information on vaccination drives and health camps. For individuals, we offer a secure space to manage personal and family medical records, book appointments, and interact with healthcare professionals. Our AI-powered tools provide helpful suggestions and analyze prescriptions to make understanding your health easier than ever before. We are committed to leveraging technology to foster a healthier tomorrow for everyone.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><Users className="h-6 w-6 text-primary"/> Our Team</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              We are a passionate team of developers, healthcare professionals, and designers dedicated to revolutionizing the digital health space. We believe in a future where healthcare is not a privilege but a right, and we are working tirelessly to build the tools that will make that future a reality.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
