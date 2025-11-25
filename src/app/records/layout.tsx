'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  BookUser,
  FileScan,
  FlaskConical,
  History,
  ShieldCheck,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const sidebarNavItems = [
  {
    title: 'Medical History',
    href: '/records/medical-history',
    icon: History,
  },
  {
    title: 'Prescriptions',
    href: '/records/prescriptions',
    icon: BookUser,
  },
  {
    title: 'Analyze Prescription',
    href: '/analyze-prescription',
    icon: FileScan,
  },
  {
    title: 'Lab Reports',
    href: '/records/lab-reports',
    icon: FlaskConical,
  },
  {
    title: 'Vaccination Records',
    href: '/records/vaccination-records',
    icon: ShieldCheck,
  },
];

interface RecordsLayoutProps {
  children: React.ReactNode;
}

export default function RecordsLayout({ children }: RecordsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
        <aside className="md:col-span-1">
          <div className="flex flex-col gap-4">
            <Button
              variant="ghost"
              asChild
              className="justify-start text-muted-foreground"
            >
              <Link href="/patient-dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <nav className="flex flex-col gap-2">
              {sidebarNavItems.map((item) => {
                 const isActive = pathname.includes(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </Link>
              )}
              )}
            </nav>
          </div>
        </aside>
        <main className="md:col-span-3">{children}</main>
      </div>
    </div>
  );
}
