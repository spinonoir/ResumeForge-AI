"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTabContent } from "@/components/tabs/ProfileTabContent";
import { NewApplicationTabContent } from "@/components/tabs/NewApplicationTabContent";
import { SavedApplicationsTabContent } from "@/components/tabs/SavedApplicationsTabContent";
import { UserCircle2Icon, FilePlus2Icon, ArchiveIcon, BotIcon, LogOutIcon, Loader2Icon } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { Button } from "@/components/ui/button";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import Link from 'next/link';

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginDialog open={true} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 sm:p-6 border-b sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <BotIcon className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-2xl sm:text-3xl font-headline text-primary">
              ResumeForge AI
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/applications">
              <Button variant="outline" size="sm">
                <ArchiveIcon className="mr-2 h-4 w-4" /> Saved Applications
              </Button>
            </Link>
            <ThemeToggleButton />
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOutIcon className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="p-4 sm:p-6 container mx-auto">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-6 rounded-lg p-1">
            <TabsTrigger value="profile" className="py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md">
              <UserCircle2Icon className="mr-2 h-5 w-5" /> My Profile
            </TabsTrigger>
            <TabsTrigger value="new_application" className="py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md">
              <FilePlus2Icon className="mr-2 h-5 w-5" /> New Application
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-2 p-0.5">
            <ProfileTabContent />
          </TabsContent>
          <TabsContent value="new_application" className="mt-2 p-0.5">
            <NewApplicationTabContent />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="py-6 border-t mt-12">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ResumeForge AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
