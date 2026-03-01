'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, CheckCircle, Dumbbell, BarChart3, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/community", icon: Users, label: "Community" },
  { href: "/check-in", icon: CheckCircle, label: "Check-in" },
  { href: "/trainers", icon: Dumbbell, label: "Trainers" },
  { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg md:hidden">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "animate-bounce-soft")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border shadow-soft">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
            <span className="text-xl">💪</span>
          </div>
          <span className="font-bold text-xl">FitTribe</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/messages"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <User className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Navigation() {
  return (
    <>
      <DesktopNav />
      <MobileNav />
    </>
  );
}
