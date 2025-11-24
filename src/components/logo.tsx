import { HeartPulse } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <HeartPulse className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold tracking-tight text-foreground">
        Swasthya
      </span>
    </Link>
  );
}
