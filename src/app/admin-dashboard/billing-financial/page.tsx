
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import BillingFinancialClientPage from './client-page';

const StatCardSkeleton = () => (
    <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-40" />
    </div>
);

const ChartSkeleton = () => (
    <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-64 w-full mt-2" />
    </div>
);

export default function BillingFinancialPage() {
    return (
        <div className="bg-muted/40 min-h-screen">
            <div className="container mx-auto max-w-7xl px-6 py-12">
                <Suspense fallback={
                    <div className="space-y-8 mt-4">
                        <div>
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-80 mt-2" />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <ChartSkeleton />
                            <ChartSkeleton />
                        </div>
                    </div>
                }>
                    <BillingFinancialClientPage />
                </Suspense>
            </div>
        </div>
    );
}
