
"use client";

import { useState } from 'react';
import { useApplicationsStore } from '@/lib/store';
import type { SavedApplication } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ArchiveIcon, EyeIcon, Trash2Icon, FileTextIcon, MailIcon, BarChart3Icon, CheckCircleIcon, CodeIcon, ClipboardListIcon as JobDescIcon, PaletteIcon, FileCogIcon, StickyNoteIcon } from 'lucide-react';
import { format } from 'date-fns';
import { CopyButton } from '@/components/CopyButton';

export function SavedApplicationsTabContent() {
  const { savedApplications, removeSavedApplication } = useApplicationsStore();
  const [selectedApp, setSelectedApp] = useState<SavedApplication | null>(null);

  if (savedApplications.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline">
            <ArchiveIcon className="mr-2 h-6 w-6 text-primary" />
            Saved Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You haven't saved any applications yet. Create and save an application from the "New Application" tab.</p>
        </CardContent>
      </Card>
    );
  }

  const renderDetailSection = (title: string, content: string, icon: React.ReactNode) => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <h4 className="flex items-center text-md font-semibold font-headline">
          {icon}
          {title}
        </h4>
        <CopyButton textToCopy={content || ""} />
      </div>
      <ScrollArea className="h-40 w-full rounded-md border p-2 bg-secondary/20">
        <pre className="text-xs whitespace-pre-wrap break-all font-code">{content || "Not available"}</pre>
      </ScrollArea>
    </div>
  );

  const renderCustomizationInfo = (app: SavedApplication) => {
    if (!app.resumeTemplateUsed && !app.accentColorUsed && !app.pageLimitUsed) {
      return null;
    }
    return (
      <div className="mt-3 mb-2 p-3 border rounded-md bg-secondary/20">
        <h5 className="text-sm font-semibold mb-2 flex items-center">
          <PaletteIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          Resume Customization Used:
        </h5>
        <ul className="list-disc list-inside pl-2 text-xs space-y-1 text-muted-foreground">
          {app.resumeTemplateUsed && <li>Template: <span className="font-medium text-foreground">{app.resumeTemplateUsed}</span></li>}
          {app.accentColorUsed && <li>Accent Color: <span className="font-medium text-foreground">{app.accentColorUsed}</span></li>}
          {app.pageLimitUsed !== undefined && <li>Page Limit: <span className="font-medium text-foreground">{app.pageLimitUsed}</span></li>}
        </ul>
      </div>
    );
  };


  return (
    <div className="space-y-6">
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline">
            <ArchiveIcon className="mr-2 h-6 w-6 text-primary" />
            Saved Applications
          </CardTitle>
          <CardDescription>Review your previously generated and saved application packages.</CardDescription>
        </CardHeader>
        <CardContent>
           <ul className="space-y-4">
            {savedApplications.map(app => (
              <li key={app.id}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg font-headline">{app.jobTitle} at {app.companyName}</CardTitle>
                    <CardDescription>
                      Saved on: {format(new Date(app.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => removeSavedApplication(app.id)}>
                        <Trash2Icon className="mr-2 h-4 w-4" /> Delete
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setSelectedApp(app)}>
                            <EyeIcon className="mr-2 h-4 w-4" /> View Details
                        </Button>
                      </DialogTrigger>
                       <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] max-h-[90vh] flex flex-col">
                         <DialogHeader>
                           <DialogTitle className="font-headline text-2xl">{selectedApp?.jobTitle} at {selectedApp?.companyName}</DialogTitle>
                           <DialogDescription>
                             Saved on: {selectedApp && format(new Date(selectedApp.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                           </DialogDescription>
                           {selectedApp && renderCustomizationInfo(selectedApp)}
                         </DialogHeader>
                         {selectedApp && (
                            <ScrollArea className="flex-grow pr-6 -mr-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                                  {renderDetailSection("Job Description", selectedApp.jobDescription, <JobDescIcon className="mr-2 h-4 w-4 text-gray-500" />)}
                                  {renderDetailSection("Summary", selectedApp.generatedSummary, <CheckCircleIcon className="mr-2 h-4 w-4 text-green-500" />)}
                                  {renderDetailSection("Match Analysis", selectedApp.matchAnalysis, <BarChart3Icon className="mr-2 h-4 w-4 text-blue-500" />)}
                                  {/* {renderDetailSection("LaTeX Resume", selectedApp.generatedResumeLatex, <FileTextIcon className="mr-2 h-4 w-4 text-purple-500" />)} */}
                                  {renderDetailSection("Markdown Resume", selectedApp.generatedResumeMarkdown, <CodeIcon className="mr-2 h-4 w-4 text-teal-500" />)}
                                  {renderDetailSection("Cover Letter", selectedApp.generatedCoverLetter, <MailIcon className="mr-2 h-4 w-4 text-orange-500" />)}
                                </div>
                            </ScrollArea>
                         )}
                         <DialogClose asChild>
                            <Button type="button" variant="secondary" className="mt-4">
                              Close
                            </Button>
                          </DialogClose>
                       </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
