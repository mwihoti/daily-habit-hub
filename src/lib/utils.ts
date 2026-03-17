import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function getOAuthRedirectTo(): string {
  if (typeof window === "undefined") return "/auth/callback";

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000/auth/callback";
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) return `${appUrl}/auth/callback`;

  return `${window.location.origin}/auth/callback`;
}