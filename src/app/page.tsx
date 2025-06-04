"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTabContent } from "@/components/tabs/ProfileTabContent";
import { NewApplicationTabContent } from "@/components/tabs/NewApplicationTabContent";
import { SavedApplicationsTabContent } from "@/components/tabs/SavedApplicationsTabContent";
import { UserCircle2Icon, FilePlus2Icon, ArchiveIcon, BotIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 sm:p-6 border-b sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="container mx-auto flex items-center">
          <BotIcon className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-2xl sm:text-3xl font-headline text-primary">
            ResumeForge AI
          </h1>
        </div>
      </header>
      <main className="p-4 sm:p-6 container mx-auto">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6 rounded-lg p-1">
            <TabsTrigger value="profile" className="py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md">
              <UserCircle2Icon className="mr-2 h-5 w-5" /> My Profile
            </TabsTrigger>
            <TabsTrigger value="new_application" className="py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md">
              <FilePlus2Icon className="mr-2 h-5 w-5" /> New Application
            </TabsTrigger>
            <TabsTrigger value="saved_applications" className="py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md">
              <ArchiveIcon className="mr-2 h-5 w-5" /> Saved Applications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-2 p-0.5">
            <ProfileTabContent />
          </TabsContent>
          <TabsContent value="new_application" className="mt-2 p-0.5">
            <NewApplicationTabContent />
          </TabsContent>
          <TabsContent value="saved_applications" className="mt-2 p-0.5">
            <SavedApplicationsTabContent />
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
