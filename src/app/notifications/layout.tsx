'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = [
    {
        name: 'All Notifications',
        href: '/notifications',
    },
    {
        name: 'Medical Advisories',
        href: '/notifications/medical-advisories',
    }
]

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
                Notifications
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                A complete list of your reminders and alerts.
            </p>
        </div>

        <div className="flex flex-col items-center gap-8">
            <Tabs value={pathname} className="w-full max-w-md">
                <TabsList className="grid w-full grid-cols-2">
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.href} value={tab.href} asChild>
                            <Link href={tab.href}>{tab.name}</Link>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
            <div className="w-full">
                {children}
            </div>
        </div>
    </div>
  );
}
