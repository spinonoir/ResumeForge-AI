"use client";
import { generateResume } from "@/lib/scoring-service";
import type { 
  GenerateResumeRequest as GenerateResumeInput,
  GenerateResumeResponse as GenerateResumeOutput
} from "../../../services/shared/types";

import { useState } from 'react';
import type { Resume, SavedApplication } from '@/types';
import { useApplicationsStore, useUserProfileStore } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarIcon, Trash2Icon, EditIcon, PlusCircleIcon, EyeIcon, DownloadIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ResumeCustomizationDialog } from './ResumeCustomizationDialog';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { CopyButton } from '../CopyButton';

type ResumeTemplateType = "regular" | "compact" | "ultraCompact";

interface ResumeManagerProps {
  application: SavedApplication;
}

export function ResumeManager({ application }: ResumeManagerProps) {
  const { id: applicationId, resumes, jobDescription, companyName } = application;
  const { starResume, removeResumeFromApplication, updateResumeInApplication, addResumeToApplication } = useApplicationsStore();
  const { getAIEmploymentHistory, getAISkills, getAIProjects, backgroundInformation, getAIPersonalDetails, getAIEducationHistory } = useUserProfileStore();
  
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [newName, setNewName] = useState("");
  const [isCustomizationDialogOpen, setIsCustomizationDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const resumeMutation = useMutation<GenerateResumeOutput, Error, GenerateResumeInput>({
    mutationFn: generateResume,
    onSuccess: (data, variables) => {
      const personalDetails = getAIPersonalDetails();
      const lastName = personalDetails.name?.split(' ').pop() || 'user';
      const date = new Date();
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const newResume: Omit<Resume, 'id' | 'createdAt' | 'isStarred'> = {
        name: `${formattedDate}-${lastName}-${companyName}-${variables.resumeTemplate || 'regular'}-resume`.toLowerCase(),
        templateUsed: variables.resumeTemplate || 'regular',
        accentColorUsed: variables.accentColor || '#000000',
        pageLimitUsed: variables.pageLimit || 1,
        generatedResumeLatex: data.resume,
        generatedResumeMarkdown: data.resumeMarkdown || '',
      };
      addResumeToApplication(applicationId, newResume);
      toast({ title: "New Resume Generated", description: "A new resume has been added to this application." });
      setIsCustomizationDialogOpen(false);
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Generation Failed", description: error.message });
    }
  });

  const handleGenerate = (template: ResumeTemplateType, color: string, pageLimit: number) => {
    resumeMutation.mutate({
      jobDescription,
      personalDetails: getAIPersonalDetails(),
      educationHistory: getAIEducationHistory(),
      employmentHistory: getAIEmploymentHistory(),
      skills: getAISkills(),
      projects: getAIProjects(),
      backgroundInformation,
      resumeTemplate: template,
      accentColor: color, 
      pageLimit: pageLimit,
    });
  };

  const handleDownload = (content: string, fileName: string) => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEditClick = (resume: Resume) => {
    setEditingResume(resume);
    setNewName(resume.name);
  };

  const handleSaveName = () => {
    if (editingResume && newName.trim()) {
      updateResumeInApplication(applicationId, editingResume.id, { name: newName.trim() });
      setEditingResume(null);
      setNewName("");
    }
  };

  if (!resumes || resumes.length === 0) {
    return (
      <div>
        <h4 className="font-semibold mb-2">Resumes</h4>
        <p className="text-sm text-muted-foreground">No resumes generated for this application yet.</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsCustomizationDialogOpen(true)}>
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Generate First Resume
        </Button>
        <ResumeCustomizationDialog
            isOpen={isCustomizationDialogOpen}
            onOpenChange={setIsCustomizationDialogOpen}
            onGenerate={handleGenerate}
            isGenerating={resumeMutation.isPending}
        />
      </div>
    );
  }

  const renderDetailSection = (title: string, content: string, icon: React.ReactNode) => {
    const fileExtension = title.toLowerCase().includes('latex') ? 'tex' : 'md';
    const fileName = `${selectedResume?.name?.replace(/\s+/g, '_') || 'resume'}-${title.split(' ')[0].toLowerCase()}.${fileExtension}`;

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
                <h4 className="flex items-center text-md font-semibold font-headline">
                    {icon}
                    {title}
                </h4>
                <div className="flex items-center">
                    <CopyButton textToCopy={content || ""} />
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(content || "", fileName)} title={`Download ${title}`}>
                        <DownloadIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <ScrollArea className="h-40 w-full rounded-md border p-2 bg-secondary/20">
                <pre className="text-xs whitespace-pre-wrap break-all font-code">{content || "Not available"}</pre>
            </ScrollArea>
        </div>
    );
  };

  return (
    <div>
      <h4 className="text-lg font-semibold mb-2">Generated Resumes</h4>
      <div className="space-y-3">
        {resumes.map(resume => (
          <Card key={resume.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold flex items-center">
                  {resume.isStarred && <StarIcon className="h-4 w-4 text-yellow-400 mr-2" />}
                  <button
                    className="text-left hover:underline bg-transparent border-none p-0 font-semibold cursor-pointer"
                    onClick={() => {
                      setSelectedResume(resume);
                      setIsViewDialogOpen(true);
                    }}
                  >
                    {resume.name}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Template: {resume.templateUsed} | Color: 
                  <span
                    className="inline-block w-3 h-3 rounded-sm ml-1 mr-1 border"
                    style={{ backgroundColor: resume.accentColorUsed }}
                  />
                  {resume.accentColorUsed}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => {
                    setSelectedResume(resume);
                    setIsViewDialogOpen(true);
                }}>
                    <EyeIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEditClick(resume)}>
                  <EditIcon className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => removeResumeFromApplication(applicationId, resume.id)}>
                  <Trash2Icon className="h-4 w-4" />
                </Button>
                 <Button variant={"outline"} size="sm" onClick={() => starResume(applicationId, resume.id)}>
                  <StarIcon className="h-4 w-4"/>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={(isOpen) => { setIsViewDialogOpen(isOpen); if (!isOpen) setSelectedResume(null); }}>
          <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">{selectedResume?.name}</DialogTitle>
              <DialogDescription>
                Template: {selectedResume?.templateUsed}, Accent Color: {selectedResume?.accentColorUsed}
              </DialogDescription>
            </DialogHeader>
            {selectedResume && (
              <ScrollArea className="flex-grow pr-6 -mr-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  {renderDetailSection("LaTeX Resume", selectedResume.generatedResumeLatex, <EyeIcon className="mr-2 h-4 w-4 text-purple-500" />)}
                  {renderDetailSection("Markdown Resume", selectedResume.generatedResumeMarkdown, <EyeIcon className="mr-2 h-4 w-4 text-teal-500" />)}
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

      <Dialog open={!!editingResume} onOpenChange={(isOpen) => !isOpen && setEditingResume(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Resume Name</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogClose asChild>
            <Button onClick={handleSaveName}>Save</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

       <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsCustomizationDialogOpen(true)}>
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Generate Another Resume
        </Button>
        <ResumeCustomizationDialog
            isOpen={isCustomizationDialogOpen}
            onOpenChange={setIsCustomizationDialogOpen}
            onGenerate={handleGenerate}
            isGenerating={resumeMutation.isPending}
        />
    </div>
  );
} 