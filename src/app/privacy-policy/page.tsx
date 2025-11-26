'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PolicySection = ({ title, children }) => (
  <div className="space-y-2">
    <h2 className="text-xl font-semibold text-foreground">{title}</h2>
    <div className="text-muted-foreground space-y-4">{children}</div>
  </div>
);

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <PolicySection title="1. Introduction">
            <p>
              Welcome to Swasthya. We are committed to protecting your privacy and handling your personal health information with the utmost care and respect. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you use our application.
            </p>
          </PolicySection>

          <PolicySection title="2. Information We Collect">
            <p>We may collect information about you in a variety of ways. The information we may collect on the Service includes:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Service.</li>
              <li><strong>Health Data:</strong> Information related to your health, such as medical history, prescriptions, lab reports, and vaccination records, which you provide or is provided by your linked healthcare professionals.</li>
              <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Service, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Service.</li>
            </ul>
          </PolicySection>
          
          <PolicySection title="3. Use of Your Information">
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:</p>
             <ul className="list-disc list-inside space-y-2">
                <li>Create and manage your account.</li>
                <li>Email you regarding your account or order.</li>
                <li>Enable user-to-user communications.</li>
                <li>Generate a personal profile about you to make future visits to the Service more personalized.</li>
                <li>Increase the efficiency and operation of the Service.</li>
            </ul>
          </PolicySection>

          <PolicySection title="4. Security of Your Information">
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </PolicySection>

           <PolicySection title="5. Contact Us">
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at: privacy@swasthya.example.com.
            </p>
          </PolicySection>
        </CardContent>
      </Card>
    </div>
  );
}
