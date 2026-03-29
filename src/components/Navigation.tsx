'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Users, CheckCircle, BarChart3, MessageCircle,
  User, LogOut, Target, ListTodo, TrendingUp, Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const mainNavItems = [
  { href: "/",          icon: Home,         label: "Home"      },
  { href: "/community", icon: Users,        label: "Community" },
  { href: "/check-in",  icon: CheckCircle,  label: "Check-in"  },
  { href: "/trainers",  icon: Dumbbell,     label: "Coaches"   },
  { href: "/dashboard", icon: BarChart3,    label: "Dashboard" },
  { href: "/progress",  icon: TrendingUp,   label: "Progress"  },
  { href: "/tasks",     icon: ListTodo,     label: "Tasks"     },
  { href: "/goals",     icon: Target,       label: "Goals"     },
];

// Smaller subset shown in the mobile bottom bar (max 5 for comfort)
const mobileNavItems = [
  { href: "/",          icon: Home,        label: "Home"      },
  { href: "/community", icon: Users,       label: "Community" },
  { href: "/check-in",  icon: CheckCircle, label: "Check-in"  },
  { href: "/trainers",  icon: Dumbbell,    label: "Coaches"   },
  { href: "/dashboard", icon: BarChart3,   label: "Me"        },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border md:hidden">
      <div className="flex items-center justify-around py-1 px-1 safe-area-bottom">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[56px]",
                isActive
                  ? "text-white gradient-hero shadow-glow scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[9px] font-semibold tracking-wide">{item.label}</span>
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
  const [unreadMessages, setUnreadMessages] = useState(0);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    toast.success("See you tomorrow 💪");
  };

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-16 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
            <span className="text-lg">💪</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight">FitTribe</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-0.5 overflow-x-auto">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap",
                  isActive
                    ? "text-white gradient-hero shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right — messages + user */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/messages"
            className={cn(
              "relative p-2.5 rounded-xl transition-colors",
              pathname === "/messages"
                ? "text-white gradient-hero"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <MessageCircle className="w-5 h-5" />
            {unreadMessages > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-white text-[9px] flex items-center justify-center font-bold">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link
                href="/profile"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                  pathname === "/profile"
                    ? "text-white gradient-hero"
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
                className="text-muted-foreground hover:text-destructive rounded-xl"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold gradient-hero text-white shadow-glow hover:opacity-90 transition-opacity"
            >
              Sign In
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
