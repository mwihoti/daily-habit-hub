import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Users, Calendar, MessageCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const trainersData: Record<string, any> = {
  "1": {
    id: "1",
    name: "Coach Michael O.",
    location: "Nairobi, Kenya",
    avatar: "👨‍🏫",
    specialties: ["Weight Loss", "Beginners", "Lifestyle Coaching"],
    rating: 4.9,
    reviews: 127,
    price: "KES 3,500/mo",
    groupPrice: "KES 1,500/mo",
    clients: 24,
    experience: "8 years",
    bio: "I've been helping beginners build sustainable fitness habits for over 8 years. My approach focuses on consistency over intensity—showing up matters more than being perfect. I lost 25kg myself and understand the mental and physical journey.",
    verified: true,
    languages: ["English", "Swahili"],
    availability: "Mon-Fri, 6am-9pm EAT",
    includes: [
      "Personalized workout plans",
      "Weekly check-ins via WhatsApp",
      "Nutrition guidance",
      "24/7 messaging support",
      "Progress tracking",
      "Monthly video call",
    ],
    testimonials: [
      {
        name: "Sarah M.",
        text: "Coach Michael helped me lose 15kg in 4 months. His patience and understanding made all the difference!",
        rating: 5,
      },
      {
        name: "James K.",
        text: "Finally found a coach who gets beginners. No judgment, just support. Highly recommend!",
        rating: 5,
      },
    ],
  },
  "2": {
    id: "2",
    name: "Coach Faith W.",
    location: "Nairobi, Kenya",
    avatar: "👩‍🏫",
    specialties: ["Home Workouts", "Women's Fitness", "Post-Pregnancy"],
    rating: 4.8,
    reviews: 89,
    price: "KES 2,800/mo",
    groupPrice: "KES 1,200/mo",
    clients: 31,
    experience: "5 years",
    bio: "No gym? No problem! I specialize in effective home workout programs that require minimal or no equipment. As a mother of two, I understand the challenges of finding time for fitness and design programs that fit into busy lives.",
    verified: true,
    languages: ["English", "Swahili"],
    availability: "Mon-Sat, 5am-8pm EAT",
    includes: [
      "Home workout plans (no equipment needed)",
      "Daily motivation messages",
      "Nutrition tips for busy people",
      "WhatsApp group support",
      "Weekly progress reviews",
      "Flexible scheduling",
    ],
    testimonials: [
      {
        name: "Grace N.",
        text: "As a working mom, Coach Faith's home programs changed my life. I can finally exercise!",
        rating: 5,
      },
      {
        name: "Mary W.",
        text: "Her post-pregnancy program helped me regain my confidence. So supportive!",
        rating: 5,
      },
    ],
  },
};

export default function TrainerProfilePage() {
  const { id } = useParams();
  const trainer = trainersData[id || "1"] || trainersData["1"];

  const handleRequestCoaching = () => {
    toast.success("Request sent! 🎉", {
      description: `${trainer.name} will respond within 24 hours.`,
    });
  };

  return (
    <Layout>
      <div className="container py-6 md:py-12 max-w-4xl">
        {/* Back Button */}
        <Link 
          to="/trainers" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to trainers
        </Link>

        {/* Profile Header */}
        <Card className="mb-6 animate-slide-up">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl gradient-hero flex items-center justify-center text-5xl md:text-6xl shrink-0 mx-auto md:mx-0">
                {trainer.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{trainer.name}</h1>
                  {trainer.verified && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      ✓ Verified
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-center md:justify-start gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{trainer.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{trainer.experience}</span>
                  </div>
                </div>

                {/* Rating & Clients */}
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-streak fill-streak" />
                    <span className="font-bold text-lg">{trainer.rating}</span>
                    <span className="text-muted-foreground">({trainer.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-5 h-5" />
                    <span>{trainer.clients} active clients</span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {trainer.specialties.map((specialty: string) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed">{trainer.bio}</p>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-4">What's Included</h2>
                <ul className="space-y-3">
                  {trainer.includes.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Testimonials */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-4">What Clients Say</h2>
                <div className="space-y-4">
                  {trainer.testimonials.map((testimonial: any, index: number) => (
                    <div key={index} className="p-4 rounded-xl bg-muted">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-streak fill-streak" />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-2">"{testimonial.text}"</p>
                      <p className="font-medium text-sm">{testimonial.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-4">Coaching Plans</h2>
                
                {/* 1-on-1 */}
                <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 mb-4">
                  <p className="text-sm text-muted-foreground">1-on-1 Coaching</p>
                  <p className="text-2xl font-bold text-primary">{trainer.price}</p>
                  <p className="text-xs text-muted-foreground">Personalized attention</p>
                </div>

                {/* Group */}
                <div className="p-4 rounded-xl border border-border mb-6">
                  <p className="text-sm text-muted-foreground">Group Coaching</p>
                  <p className="text-2xl font-bold">{trainer.groupPrice}</p>
                  <p className="text-xs text-muted-foreground">Join a community</p>
                </div>

                <Button 
                  variant="hero" 
                  className="w-full mb-3"
                  onClick={handleRequestCoaching}
                >
                  Request Coaching
                </Button>
                
                <Button variant="outline" className="w-full">
                  <MessageCircle className="w-4 h-4" />
                  Message First
                </Button>

                {/* Availability */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Availability</p>
                  <p className="font-medium">{trainer.availability}</p>
                  <p className="text-sm text-muted-foreground mt-2">Languages</p>
                  <p className="font-medium">{trainer.languages.join(", ")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
