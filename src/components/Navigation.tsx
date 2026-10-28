'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Users, CheckCircle, BarChart3, MessageCircle,
  User, LogOut, Target, ListTodo, TrendingUp, Dumbbell,
  Trophy, Medal, MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FEATURE_TRAINERS } from "@/lib/featureFlags";

type NavItem = { href: string; icon: typeof Home; label: string };

const primaryItems: NavItem[] = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/community", icon: Users, label: "Community" },
  { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
];

const moreItems: NavItem[] = [
  { href: "/progress", icon: TrendingUp, label: "Progress" },
  { href: "/achievements", icon: Trophy, label: "Achievements" },
  { href: "/leaderboard", icon: Medal, label: "Leaderboard" },
  { href: "/goals", icon: Target, label: "Goals" },
  { href: "/tasks", icon: ListTodo, label: "Tasks" },
  { href: "/profile", icon: User, label: "Profile" },
  ...(FEATURE_TRAINERS
    ? [
        { href: "/messages", icon: MessageCircle, label: "Messages" },
        { href: "/trainers", icon: Dumbbell, label: "Coaches" },
      ]
    : []),
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

function NavGlyph({
  item,
  active,
  compact = false,
}: {
  item: NavItem;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        compact
          ? "min-h-11 min-w-[64px] flex-col gap-0.5 px-2 py-1.5 text-[10px]"
          : "px-3 py-2 text-sm",
        active ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <item.icon className={compact ? "h-5 w-5" : "h-4 w-4"} aria-hidden />
      <span>{item.label}</span>
    </Link>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
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

  const checkInActive = isActivePath(pathname, "/check-in");
  const moreIsActive = moreItems.some((item) => isActivePath(pathname, item.href));

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl md:hidden"
    >
      <div className="safe-area-bottom grid grid-cols-5 items-end px-1 pt-1">
        {primaryItems.slice(0, 2).map((item) => (
          <NavGlyph key={item.href} item={item} active={isActivePath(pathname, item.href)} compact />
        ))}

        <Link
          href="/check-in"
          aria-current={checkInActive ? "page" : undefined}
          aria-label="Check in"
          className="flex -mt-5 flex-col items-center gap-1 focus-visible:outline-none"
        >
          <span
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full gradient-hero text-primary-foreground shadow-glow ring-4 ring-background",
              checkInActive && "ring-primary/40",
            )}
          >
            <CheckCircle className="h-6 w-6" aria-hidden />
          </span>
          <span className={cn("text-[10px] font-bold", checkInActive ? "text-primary" : "text-foreground")}>
            Check-in
          </span>
        </Link>

        <NavGlyph
          item={primaryItems[2]}
          active={isActivePath(pathname, primaryItems[2].href)}
          compact
        />

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="More destinations"
              className={cn(
                "flex min-h-11 min-w-[64px] flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                open || moreIsActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <MoreHorizontal className="h-5 w-5" aria-hidden />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl border-border bg-card pb-8">
            <SheetHeader className="text-left">
              <SheetTitle className="font-display text-base">More</SheetTitle>
              <SheetDescription className="sr-only">Other FitTribe pages</SheetDescription>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {moreItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-2xl border text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-background text-foreground hover:bg-muted",
                      )}
                    >
                      <item.icon className="h-5 w-5" aria-hidden />
                      {item.label}
                    </Link>
                  </SheetClose>
                );
              })}
            </div>
            <div className="mt-4 border-t border-border pt-3">
              {user ? (
                <Button
                  variant="ghost"
                  className="h-12 w-full justify-start gap-3 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  Log Out
                </Button>
              ) : (
                <SheetClose asChild>
                  <Link
                    href="/login"
                    className="flex h-12 items-center justify-center rounded-full gradient-hero text-sm font-bold text-primary-foreground"
                  >
                    Sign in
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
  const [user, setUser] = useState<{ id: string } | null>(null);
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

  const moreActive = moreItems.some((item) => isActivePath(pathname, item.href));
  const checkInActive = isActivePath(pathname, "/check-in");

  return (
    <header className="sticky top-0 z-50 hidden border-b border-border bg-background/85 backdrop-blur-xl md:block">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-hero text-base shadow-glow">
            🔥
          </span>
          <span className="font-display text-lg font-bold tracking-tight">FitTribe</span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-0.5">
          {primaryItems.map((item) => (
            <NavGlyph key={item.href} item={item} active={isActivePath(pathname, item.href)} />
          ))}
          <Link
            href="/check-in"
            aria-current={checkInActive ? "page" : undefined}
            className={cn(
              "ml-1 inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              checkInActive
                ? "gradient-hero text-primary-foreground shadow-glow"
                : "border border-primary/40 bg-primary/10 text-primary hover:bg-primary/15",
            )}
          >
            <CheckCircle className="h-4 w-4" aria-hidden />
            Check in
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "ml-1 inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                moreActive ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              More
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-2xl border-border bg-card p-1.5">
              {moreItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl",
                      isActivePath(pathname, item.href) && "text-primary",
                    )}
                  >
                    <item.icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          {user ? (
            <>
              <Link
                href="/profile"
                aria-current={pathname === "/profile" ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  pathname === "/profile" ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <User className="h-4 w-4" aria-hidden />
                Profile
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="rounded-full text-muted-foreground hover:text-destructive"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center rounded-full gradient-hero px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-90"
            >
              Sign in
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
