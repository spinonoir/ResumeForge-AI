"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApplicationsStore } from '@/lib/store';
import type { SavedApplication, ApplicationStatus } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ArchiveIcon, EyeIcon, Trash2Icon, FileTextIcon, MailIcon, BarChart3Icon, CheckCircleIcon, CodeIcon, ClipboardListIcon as JobDescIcon, PaletteIcon, FileCogIcon, StickyNoteIcon, ChevronDownIcon, ChevronUpIcon, ArrowLeftIcon } from 'lucide-react';
import { format } from 'date-fns';
import { CopyButton } from '@/components/CopyButton';
import { ResumeManager } from '@/components/applications/ResumeManager';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CorrespondenceCard } from '@/components/applications/CorrespondenceCard';
import { DatesCard } from '@/components/applications/DatesCard';
import { SkillUpCard } from '@/components/applications/SkillUpCard';
import { InterviewDetailDialog } from '@/components/applications/InterviewDetailDialog';
import { OfferDetailDialog } from '@/components/applications/OfferDetailDialog';
import { RejectionDetailDialog } from '@/components/applications/RejectionDetailDialog';
import { ArchiveDetailDialog } from '@/components/applications/ArchiveDetailDialog';

const statusConfig: Record<ApplicationStatus, { color: string; label: string }> = {
    saved: { color: 'bg-gray-500', label: 'Saved' },
    submitted: { color: 'bg-blue-500', label: 'Submitted' },
    interviewing: { color: 'bg-yellow-500', label: 'Interviewing' },
    offer: { color: 'bg-green-500', label: 'Offer' },
    rejected: { color: 'bg-red-500', label: 'Rejected' },
    archived: { color: 'bg-purple-500', label: 'Archived' },
};

export default function ApplicationsPage() {
  const { savedApplications, removeSavedApplication, updateApplication, pendingDialog, setPendingDialog } = useApplicationsStore();
  const router = useRouter();
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [interviewDialogState, setInterviewDialogState] = useState<{isOpen: boolean, appId: string | null}>({isOpen: false, appId: null});
  const [offerDialogState, setOfferDialogState] = useState<{isOpen: boolean, appId: string | null}>({isOpen: false, appId: null});
  const [rejectionDialogState, setRejectionDialogState] = useState<{isOpen: boolean, appId: string | null}>({isOpen: false, appId: null});
  const [archiveDialogState, setArchiveDialogState] = useState<{isOpen: boolean, appId: string | null}>({isOpen: false, appId: null});

  useEffect(() => {
    if (pendingDialog) {
      if (pendingDialog.type === 'offer') {
        setOfferDialogState({ isOpen: true, appId: pendingDialog.appId });
      } else if (pendingDialog.type === 'rejection') {
        setRejectionDialogState({ isOpen: true, appId: pendingDialog.appId });
      }
      setPendingDialog(null);
    }
  }, [pendingDialog, setPendingDialog]);

  const filteredApplications = savedApplications.filter(app => showArchived || app.status !== 'archived');

  const toggleExpand = (appId: string) => {
    setExpandedAppId(prevId => (prevId === appId ? null : appId));
  };

  const handleStatusChange = (appId: string, status: ApplicationStatus) => {
    if (status === 'interviewing') {
        setInterviewDialogState({ isOpen: true, appId });
    } else if (status === 'offer') {
        setOfferDialogState({ isOpen: true, appId });
    } else if (status === 'rejected') {
        setRejectionDialogState({ isOpen: true, appId });
    } else if (status === 'archived') {
        setArchiveDialogState({ isOpen: true, appId });
    } else {
        updateApplication(appId, { status });
    }
  };

  const handleNotesChange = (appId: string, notes: string) => {
    updateApplication(appId, { notes });
  };

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
          <p className="text-muted-foreground">You haven&apos;t saved any applications yet. Create and save an application from the &quot;New Application&quot; tab.</p>
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

  return (
    <div className="space-y-6">
       <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-xl font-headline">
              <ArchiveIcon className="mr-2 h-6 w-6 text-primary" />
              Saved Applications
            </CardTitle>
            <Button variant="outline" onClick={() => router.push('/')}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
          </div>
          <CardDescription>Review and track your saved application packages.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-end mb-4">
            <Label htmlFor="show-archived" className="mr-2">Show Archived</Label>
            <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
          </div>
           <ul className="space-y-4">
            {filteredApplications.map(app => (
              <li key={app.id}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-headline">{app.jobTitle} at {app.companyName}</CardTitle>
                        <CardDescription>
                          Saved on: {format(new Date(app.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                        </CardDescription>
                      </div>
                      <Badge className={`${statusConfig[app.status].color} text-white`}>{statusConfig[app.status].label}</Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => removeSavedApplication(app.id)}>
                        <Trash2Icon className="mr-2 h-4 w-4" /> Delete
                    </Button>
                    <Button size="sm" onClick={() => toggleExpand(app.id)}>
                        {expandedAppId === app.id ? <ChevronUpIcon className="mr-2 h-4 w-4" /> : <ChevronDownIcon className="mr-2 h-4 w-4" />}
                        {expandedAppId === app.id ? 'Hide Details' : 'View Details'}
                    </Button>
                  </CardFooter>
                  {expandedAppId === app.id && (
                    <CardContent>
                      <div className="border-t pt-4 mt-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                           {renderDetailSection("Job Description", app.jobDescription, <JobDescIcon className="mr-2 h-4 w-4 text-gray-500" />)}
                           {renderDetailSection("Summary", app.generatedSummary, <CheckCircleIcon className="mr-2 h-4 w-4 text-green-500" />)}
                           {renderDetailSection("Match Analysis", app.matchAnalysis, <BarChart3Icon className="mr-2 h-4 w-4 text-blue-500" />)}
                           {renderDetailSection("Cover Letter", app.generatedCoverLetter, <MailIcon className="mr-2 h-4 w-4 text-orange-500" />)}
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <div>
                               <h4 className="flex items-center text-md font-semibold font-headline mb-2">
                                <StickyNoteIcon className="mr-2 h-4 w-4 text-yellow-500" />
                                Notes
                               </h4>
                               <Textarea 
                                 placeholder="Add your notes here..."
                                 value={app.notes}
                                 onChange={(e) => handleNotesChange(app.id, e.target.value)}
                                 rows={5}
                               />
                            </div>
                            <div>
                               <h4 className="flex items-center text-md font-semibold font-headline mb-2">
                                <FileCogIcon className="mr-2 h-4 w-4 text-blue-500" />
                                Application Status
                               </h4>
                               <Select value={app.status} onValueChange={(value: ApplicationStatus) => handleStatusChange(app.id, value)}>
                                 <SelectTrigger>
                                   <SelectValue placeholder="Select status" />
                                 </SelectTrigger>
                                 <SelectContent>
                                   {Object.entries(statusConfig).map(([key, {label}]) => (
                                     <SelectItem key={key} value={key}>{label}</SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                            </div>
                         </div>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
                            <DatesCard application={app} />
                            <CorrespondenceCard application={app} />
                         </div>
                         <div className="mt-4">
                            <SkillUpCard application={app} />
                         </div>
                         <div className="mt-4">
                           <ResumeManager application={app} />
                         </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {interviewDialogState.isOpen && interviewDialogState.appId && (
          <InterviewDetailDialog 
            applicationId={interviewDialogState.appId}
            isOpen={interviewDialogState.isOpen}
            onClose={() => setInterviewDialogState({ isOpen: false, appId: null })}
          />
      )}
      {offerDialogState.isOpen && offerDialogState.appId && (
          <OfferDetailDialog
            applicationId={offerDialogState.appId}
            isOpen={offerDialogState.isOpen}
            onClose={() => setOfferDialogState({ isOpen: false, appId: null })}
          />
      )}
      {rejectionDialogState.isOpen && rejectionDialogState.appId && (
          <RejectionDetailDialog
            applicationId={rejectionDialogState.appId}
            isOpen={rejectionDialogState.isOpen}
            onClose={() => setRejectionDialogState({ isOpen: false, appId: null })}
          />
      )}
      {archiveDialogState.isOpen && archiveDialogState.appId && (
          <ArchiveDetailDialog
            applicationId={archiveDialogState.appId}
            isOpen={archiveDialogState.isOpen}
            onClose={() => setArchiveDialogState({ isOpen: false, appId: null })}
          />
      )}
    </div>
  );
} 