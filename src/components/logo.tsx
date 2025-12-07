import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt="Swasthya Logo"
        width={120}
        height={30}
        priority
      />
    </Link>
  );
}
