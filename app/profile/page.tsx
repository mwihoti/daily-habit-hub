'use client';

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  User as UserIcon, Settings as SettingsIcon, LogOut as LogOutIcon,
  Camera as CameraIcon, Trophy as TrophyIcon,
  Calendar as CalendarIcon, Flame as FlameIcon,
  Mail as MailIcon, AtSign as AtSignIcon, Coins, Key
} from "lucide-react";
import { useEmbeddedWallet } from "@/hooks/useEmbeddedWallet";

import { format } from "date-fns";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return null;
      }
      return user;
    }
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (data) {
        setDisplayName(data.full_name || "");
        setUsername(data.username || "");
      }
      return data;
    }
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', user?.id);
      return data || [];
    }
  });

  // Must be after user query so user?.id is in scope
  const { walletType, activeAddress, getExportKey } = useEmbeddedWallet(user?.id);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: displayName,
        username,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    router.push("/login");
    toast.success("Logged out successfully");
  };

  if (userLoading || profileLoading) {
    return (
      <Layout>
        <div className="container py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 md:py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-24 h-24 border-4 border-primary/20">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-2xl gradient-hero text-white">
                      {displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform">
                    <CameraIcon className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-bold">{displayName || "Your Name"}</h2>
                <p className="text-sm text-muted-foreground mb-4">@{username || "username"}</p>
                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold">{profile?.streak || 0}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Streak</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <p className="text-xl font-bold">{workouts.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Workouts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-2">
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl">
                  <UserIcon className="w-5 h-5 text-primary" />
                  Edit Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl text-muted-foreground">
                  <SettingsIcon className="w-5 h-5" />
                  Account Settings
                </Button>
                <div className="my-2 border-t border-border" />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-12 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOutIcon className="w-5 h-5" />
                  Log Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <SettingsIcon className="w-5 h-5 text-primary" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" value={user?.email} disabled className="pl-10 bg-muted/50" />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="display-name" 
                      placeholder="Enter your name" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10 focus-visible:ring-primary" 
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="username" 
                      placeholder="Choose a username" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 focus-visible:ring-primary" 
                    />
                  </div>
                </div>

                <Button 
                  variant="hero" 
                  className="w-full md:w-auto"
                  onClick={handleUpdateProfile}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="overflow-hidden border-orange-100 dark:border-orange-950">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                    <FlameIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Daily Streak</p>
                    <p className="text-2xl font-bold text-orange-600">{profile?.streak || 0} Days</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden border-blue-100 dark:border-blue-950">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                    <TrophyIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Workouts Done</p>
                    <p className="text-2xl font-bold text-blue-600">{workouts.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Joined At</span>
                  <span className="font-medium">
                    {user?.created_at ? format(new Date(user.created_at), "MMMM d, yyyy") : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Coins className="w-4 h-4 text-blue-500" />
                    Avalanche Wallet
                    {walletType === 'embedded' && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                        In-App
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {(activeAddress || profile?.wallet_address)
                        ? `${(activeAddress || profile!.wallet_address).slice(0, 6)}...${(activeAddress || profile!.wallet_address).slice(-4)}`
                        : "Not set up"}
                    </span>
                    {walletType === 'embedded' && user?.id && (
                      <button
                        title="Export private key to clipboard"
                        onClick={() => {
                          const key = getExportKey(user.id)
                          if (key) {
                            navigator.clipboard.writeText(key)
                            toast.success("Private key copied — keep it safe!", { duration: 6000 })
                          }
                        }}
                        className="p-1 rounded hover:bg-muted transition-colors"
                      >
                        <Key className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Account Type</span>
                  <span className="font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">Free Plan</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
