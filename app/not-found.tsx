'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">404</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold">This page isn&apos;t here</h1>
        <p className="mt-3 text-muted-foreground">The link may be old, or the page moved. Your streak is still on the dashboard.</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full gradient-hero px-6 text-sm font-bold text-primary-foreground"
        >
          Back to FitTribe
        </Link>
      </div>
    </div>
  );
}

