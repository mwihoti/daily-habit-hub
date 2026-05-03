import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { ArrowRight } from "lucide-react";

type Section = {
  title: string;
  body: string[];
};

type LinkCard = {
  href: string;
  title: string;
  description: string;
};

interface SeoLandingPageProps {
  eyebrow: string;
  title: string;
  description: string;
  sections: Section[];
  links: LinkCard[];
}

export function SeoLandingPage({
  eyebrow,
  title,
  description,
  sections,
  links,
}: SeoLandingPageProps) {
  return (
    <Layout>
      <div className="container py-10 md:py-16">
        <div className="max-w-4xl mx-auto space-y-6 mb-12">
          <div className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            {eyebrow}
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">{title}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">{description}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid gap-6">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-bold">{section.title}</h2>
                <div className="space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-5xl mx-auto mt-12">
          <h2 className="text-2xl font-bold mb-6">Related pages on FitTribe</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {links.map((link) => (
              <Card key={link.href} className="h-full">
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-semibold">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={link.href}>
                      Open page <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
