'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, CheckCircle, Dumbbell, BarChart3, MessageCircle, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/community", icon: Users, label: "Community" },
  { href: "/check-in", icon: CheckCircle, label: "Check-in" },
  { href: "/trainers", icon: Dumbbell, label: "Trainers" },
  { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { href: "/progress", icon: BarChart3, label: "Progress" },
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
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    toast.success("Logged out successfully");
  };

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
          
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200",
                  pathname === "/profile"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
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
