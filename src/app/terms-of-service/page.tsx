'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PolicySection = ({ title, children }) => (
  <div className="space-y-2">
    <h2 className="text-xl font-semibold text-foreground">{title}</h2>
    <div className="text-muted-foreground space-y-4">{children}</div>
  </div>
);

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <PolicySection title="1. Agreement to Terms">
            <p>
              By using our services, you agree to be bound by these Terms. If you don’t agree to be bound by these Terms, do not use the Services. Our services are for informational purposes only and are not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </PolicySection>

          <PolicySection title="2. User Accounts">
            <p>
              You are responsible for safeguarding your account, so use a strong password and limit its use to this account. We cannot and will not be liable for any loss or damage arising from your failure to comply with the above. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
          </PolicySection>
          
          <PolicySection title="3. AI-Generated Content">
            <p>
              The application may use artificial intelligence to provide health suggestions, analyze prescriptions, and answer questions. This content is provided for informational purposes only. It is not medical advice. You must always consult with a qualified healthcare professional for any medical concerns. We are not liable for any decisions made based on AI-generated content.
            </p>
          </PolicySection>

          <PolicySection title="4. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, Swasthya shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the services.
            </p>
          </PolicySection>

           <PolicySection title="5. Contact Us">
            <p>
              If you have any questions about these Terms, please contact us at: legal@swasthya.example.com.
            </p>
          </PolicySection>
        </CardContent>
      </Card>
    </div>
  );
}
