
import { Twitter, Facebook, Instagram } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
];

const footerLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
];

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              Your health, our priority. Easy access to healthcare services.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 lg:col-span-2 sm:grid-cols-3">
            <div>
              <h3 className="font-semibold text-foreground">Quick Links</h3>
              <ul className="mt-4 space-y-2">
                {footerLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Services</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/vaccination" className="text-sm text-muted-foreground hover:text-foreground">Vaccination Drives</Link></li>
                <li><Link href="/camps" className="text-sm text-muted-foreground hover:text-foreground">Health Camps</Link></li>
                <li><Link href="/notifications" className="text-sm text-muted-foreground hover:text-foreground">Medical Notifications</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Follow Us</h3>
              <div className="flex mt-4 space-x-4">
                {socialLinks.map((social) => (
                  <Link key={social.name} href={social.href} className="text-muted-foreground hover:text-foreground" aria-label={social.name}>
                    <social.icon className="h-6 w-6" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Swasthya. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
