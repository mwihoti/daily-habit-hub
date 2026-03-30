'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Users, CheckCircle, BarChart3, MessageCircle,
  User, LogOut, Target, ListTodo, TrendingUp, Dumbbell, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
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

// 4 primary items always visible in the mobile bottom bar
const mobileNavItems = [
  { href: "/",          icon: Home,         label: "Home"      },
  { href: "/check-in",  icon: CheckCircle,  label: "Check-in"  },
  { href: "/community", icon: Users,        label: "Community" },
  { href: "/dashboard", icon: BarChart3,    label: "Dashboard" },
];

// Items shown in the "More" bottom sheet
const moreNavItems = [
  { href: "/messages",  icon: MessageCircle, label: "Messages"  },
  { href: "/goals",     icon: Target,        label: "Goals"     },
  { href: "/profile",   icon: User,          label: "Profile"   },
  { href: "/progress",  icon: TrendingUp,    label: "Progress"  },
  { href: "/tasks",     icon: ListTodo,      label: "Tasks"     },
  { href: "/trainers",  icon: Dumbbell,      label: "Coaches"   },
];

export function MobileNav() {
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

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
    setOpen(false);
    router.push("/login");
    toast.success("See you tomorrow 💪");
  };

  const moreIsActive = moreNavItems.some(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
  );

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

        {/* More — opens bottom sheet with remaining nav items */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[56px]",
                open || moreIsActive
                  ? "text-white gradient-hero shadow-glow scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Menu className="w-5 h-5" />
              <span className="text-[9px] font-semibold tracking-wide">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
            <div className="grid grid-cols-3 gap-3 pt-4 pb-2">
              {moreNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all",
                        isActive
                          ? "text-white gradient-hero shadow-glow"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      )}
                    >
                      <item.icon className="w-6 h-6" />
                      <span className="text-xs font-semibold">{item.label}</span>
                    </Link>
                  </SheetClose>
                );
              })}
            </div>
            <div className="border-t border-border pt-3 mt-1">
              {user ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 h-12 rounded-xl"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </Button>
              ) : (
                <SheetClose asChild>
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 h-12 rounded-xl gradient-hero text-white font-semibold"
                  >
                    Sign In
                  </Link>
                </SheetClose>
              )}
            </div>
          </SheetContent>
        </Sheet>
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
