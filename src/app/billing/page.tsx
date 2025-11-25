
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BillingPage() {
  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <div className="space-y-8">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
            Pay a Bill
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            This feature is coming soon.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The billing and payment system is under construction. Please check back later.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
