
'use client';

import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  BarChart,
  Calendar,
  Heart,
  Shield,
  FlaskConical,
  GanttChart,
  Wallet,
  Server,
  Tent,
  Megaphone,
  UserCheck,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import Link from 'next/link';

const adminNavLinks = [
  { href: "/admin-dashboard", label: "Dashboard Overview" },
  { href: "/admin-dashboard/kpi-cards", label: "KPIs", icon: BarChart },
  { href: "/admin-dashboard/appointments-utilization", label: "Appointments", icon: Calendar },
  { href: "/admin-dashboard/patient-disease-insights", label: "Patient & Disease", icon: Heart },
  { href: "/admin-dashboard/vaccination-preventive-care", label: "Preventive Care", icon: Shield },
  { href: "/admin-dashboard/labs-reports", label: "Labs & Reports", icon: FlaskConical },
  { href: "/admin-dashboard/billing-financial", label: "Billing", icon: Wallet },
  { href: "/admin-dashboard/security-compliance", label: "Security", icon: GanttChart },
  { href: "/admin-dashboard/system-health", label: "System Health", icon: Server },
  { href: "/admin-dashboard/manage-events", label: "Manage Events", icon: Tent },
  { href: "/admin-dashboard/manage-announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin-dashboard/verify-doctors", label: "Verify Doctors", icon: UserCheck },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {adminNavLinks.map((link) => (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  isActive={pathname === link.href}
                  asChild
                >
                  <Link href={link.href}>
                    {link.icon && <link.icon />}
                    <span>{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarTrigger />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
