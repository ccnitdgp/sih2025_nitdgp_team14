import Link from "next/link";
import { Bell, Globe, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";

const navLinks = [
  { href: "/vaccination", label: "Vaccination Drive" },
  { href: "/#camps", label: "Visiting Camps" },
  { href: "/records", label: "Medical Notification" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <div className="mr-4 flex">
          <Logo />
        </div>
        
        <nav className="hidden md:flex md:items-center md:gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
          <Button asChild className="hidden md:inline-flex" variant="outline">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="hidden md:inline-flex">
            <Link href="/signup">Sign Up</Link>
          </Button>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-6 p-6">
                  <Logo />
                  <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="flex flex-col gap-2">
                    <Button asChild variant="outline">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
