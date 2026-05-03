import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: trainer } = await supabase
    .from("trainer_profiles")
    .select("full_name, bio, location, specialties, experience_years, rating, review_count")
    .eq("id", id)
    .single();

  if (!trainer) {
    return {
      title: "Trainer Profile | FitTribe Nairobi",
      description: "View personal trainer profile on FitTribe Nairobi.",
      robots: { index: false, follow: false },
    };
  }

  const name = trainer.full_name;
  const location = trainer.location || "Nairobi";
  const specialties = trainer.specialties?.join(", ") || "fitness";
  const cleanBio = trainer.bio?.replace(/<!--qualifications:[\s\S]+-->$/, "").trim();

  return {
    title: `${name} — Personal Trainer in ${location} | FitTribe`,
    description:
      cleanBio?.slice(0, 155) ||
      `${name} is a certified personal trainer in ${location}, Nairobi specialising in ${specialties}. Book a session on FitTribe.`,
    keywords: [
      `personal trainer ${location}`,
      `fitness coach ${location} Nairobi`,
      `${specialties} trainer Nairobi`,
      `certified trainer ${location}`,
      "personal trainer Nairobi",
    ],
    alternates: { canonical: absoluteUrl(`/trainers/${id}`) },
    openGraph: {
      title: `${name} — Personal Trainer in ${location}`,
      description: `${name} offers ${specialties} coaching in ${location}, Nairobi. ${trainer.experience_years} years experience.`,
      url: absoluteUrl(`/trainers/${id}`),
      type: "profile",
      locale: "en_KE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${name} on FitTribe` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — Personal Trainer in ${location}`,
      description: `${name} offers ${specialties} coaching in ${location}, Nairobi.`,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function TrainerProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: trainer } = await supabase
    .from("trainer_profiles")
    .select("full_name, bio, location, specialties, experience_years, rating, review_count, avatar_url")
    .eq("id", id)
    .single();

  const personSchema = trainer
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: trainer.full_name,
        jobTitle: "Personal Trainer",
        description: trainer.bio?.replace(/<!--qualifications:[\s\S]+-->$/, "").trim(),
        image: trainer.avatar_url,
        url: absoluteUrl(`/trainers/${id}`),
        worksFor: { "@type": "Organization", name: "FitTribe" },
        address: {
          "@type": "PostalAddress",
          addressLocality: trainer.location || "Nairobi",
          addressCountry: "KE",
        },
        knowsAbout: trainer.specialties,
        ...(trainer.rating > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: trainer.rating,
            reviewCount: trainer.review_count || 1,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      }
    : null;

  return (
    <>
      {personSchema && <JsonLd schema={personSchema} />}
      {children}
    </>
  );
}
