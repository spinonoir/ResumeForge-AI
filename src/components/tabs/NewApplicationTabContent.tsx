"use client";
import { generateResume, generateCoverLetter as refineCoverLetterFlow } from "@/lib/scoring-service";
import type {
  GenerateResumeRequest as GenerateResumeInput,
  GenerateResumeResponse as GenerateResumeOutput,
  GenerateCoverLetterRequest as GenerateCoverLetterInput,
  GenerateCoverLetterResponse as GenerateCoverLetterOutput,
} from "../../../services/shared/types";

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useUserProfileStore, useApplicationsStore } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2Icon, FileTextIcon, MailIcon, BarChart3Icon, CheckCircleIcon, SaveIcon, Wand2Icon, ClipboardListIcon, CodeIcon, Settings2Icon } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { v4 as uuidv4 } from 'uuid';

const generateUniqueId = uuidv4;

interface GeneratedData extends GenerateResumeOutput {
  jobDescriptionUsed: string;
  // resumeMarkdown, jobTitleFromJD, companyNameFromJD are already part of GenerateResumeOutput
}

type ResumeTemplateType = "regular" | "compact" | "ultraCompact";

export function NewApplicationTabContent() {
  const { getAIEmploymentHistory, getAISkills, getAIProjects, backgroundInformation, getAIPersonalDetails, getAIEducationHistory } = useUserProfileStore();
  const { addSavedApplication } = useApplicationsStore();

  const [jobDescription, setJobDescription] = useState('');
  const [companyInfo, setCompanyInfo] = useState('');
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [jobTitleForSaving, setJobTitleForSaving] = useState('');
  const [companyNameForSaving, setCompanyNameForSaving] = useState('');

  // New state for customization options
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateType>("regular");
  const [accentColorInput, setAccentColorInput] = useState('#64B5F6'); // Default to soft blue
  const [pageLimitInput, setPageLimitInput] = useState<number>(2);


  const resumeMutation = useMutation<GenerateResumeOutput, Error, GenerateResumeInput>({
    mutationFn: generateResume,
    onSuccess: (data) => {
      setGeneratedData({...data, jobDescriptionUsed: jobDescription});
      setJobTitleForSaving(data.jobTitleFromJD || '');
      setCompanyNameForSaving(data.companyNameFromJD || '');
      toast({ title: "Content Generated", description: "Resume, cover letter, and analysis are ready." });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Generation Failed", description: error.message });
    }
  });

  const coverLetterRefineMutation = useMutation<GenerateCoverLetterOutput, Error, GenerateCoverLetterInput>({
    mutationFn: refineCoverLetterFlow,
    onSuccess: (data) => {
      if (generatedData) {
        setGeneratedData({ ...generatedData, coverLetter: data.coverLetter });
        toast({ title: "Cover Letter Refined", description: "Your cover letter has been updated with company information." });
      }
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Refinement Failed", description: error.message });
    }
  });

  const handleGenerate = () => {
    if (!jobDescription.trim()) {
      toast({ variant: "destructive", title: "Job Description Missing", description: "Please provide a job description." });
      return;
    }
    const profileDataCheck = getAIEmploymentHistory().length > 0 || getAISkills().length > 0 || getAIProjects().length > 0 || backgroundInformation.trim() !== '' || getAIPersonalDetails().name || getAIEducationHistory().length > 0;
    if (!profileDataCheck) {
        toast({ variant: "destructive", title: "Profile Incomplete", description: "Please fill out your profile (personal details, education, employment, skills, projects, or background info)." });
        return;
    }

    const finalAccentColor = accentColorInput.trim(); // Pass with # if hex, AI flow handles it

    resumeMutation.mutate({
      jobDescription,
      personalDetails: getAIPersonalDetails(),
      educationHistory: getAIEducationHistory(),
      employmentHistory: getAIEmploymentHistory(),
      skills: getAISkills(), // Make sure this provides ALL skills for ATS
      projects: getAIProjects(),
      backgroundInformation,
      resumeTemplate: selectedTemplate,
      accentColor: finalAccentColor || undefined, 
      pageLimit: pageLimitInput,
    });
  };

  const handleRefineCoverLetter = () => {
    if (!companyInfo.trim() || !generatedData) {
       toast({ variant: "destructive", title: "Missing Information", description: "Please provide company information to refine the cover letter." });
      return;
    }
    coverLetterRefineMutation.mutate({
      jobDescription: generatedData.jobDescriptionUsed,
      userBackground: backgroundInformation,
      companyInformation: companyInfo,
    });
  };

  const handleSaveApplication = async () => {
    if (!generatedData) {
      toast({ variant: "destructive", title: "Nothing to Save", description: "Please generate content first." });
      return;
    }
    if (!jobTitleForSaving.trim() || !companyNameForSaving.trim()) {
      toast({ variant: "destructive", title: "Missing Details", description: "Please provide a job title and company name for saving." });
      return;
    }

    const personalDetails = getAIPersonalDetails();
    const lastName = personalDetails.name?.split(' ').pop() || 'user';
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const success = await addSavedApplication({
      jobTitle: jobTitleForSaving,
      companyName: companyNameForSaving,
      jobDescription: generatedData.jobDescriptionUsed,
      generatedCoverLetter: generatedData.coverLetter,
      generatedSummary: generatedData.summary,
      matchAnalysis: generatedData.matchAnalysis,
      resumes: [
        {
          id: generateUniqueId(),
          name: `${formattedDate}-${lastName}-${companyNameForSaving}-${selectedTemplate}-resume`.toLowerCase(),
          createdAt: new Date().toISOString(),
          templateUsed: selectedTemplate,
          accentColorUsed: accentColorInput.trim() || '#64B5F6',
          pageLimitUsed: pageLimitInput,
          generatedResumeLatex: generatedData.resume,
          generatedResumeMarkdown: generatedData.resumeMarkdown || '',
          isStarred: true,
        }
      ]
    });

    if (success) {
      setJobTitleForSaving('');
      setCompanyNameForSaving('');
    }
  };

  const renderOutputSection = (title: string, content: string, icon: React.ReactNode) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-headline">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-60 w-full rounded-md border p-3 bg-secondary/20">
          <pre className="text-sm whitespace-pre-wrap break-all font-code">{content}</pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline">
            <ClipboardListIcon className="mr-2 h-6 w-6 text-primary" />
            Job Description
          </CardTitle>
          <CardDescription>Paste the job description below. The AI will use this to tailor your resume and cover letter.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            className="w-full p-2 border rounded-md"
          />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline">
            <Settings2Icon className="mr-2 h-6 w-6 text-primary" />
            Resume Customization
          </CardTitle>
          <CardDescription>Choose your LaTeX resume template and customization options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="resume-template">Resume Template</Label>
              <Select value={selectedTemplate} onValueChange={(value: ResumeTemplateType) => setSelectedTemplate(value)}>
                <SelectTrigger id="resume-template">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="ultraCompact">Ultra-compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-1">
              <Label htmlFor="accent-color-picker">Accent Color</Label>
              <div className="flex items-center gap-2 mt-1">
                 <Input
                    id="accent-color-picker"
                    type="color"
                    value={accentColorInput.startsWith('#') ? accentColorInput : '#64B5F6'} // Ensure valid hex for picker
                    onChange={(e) => setAccentColorInput(e.target.value)}
                    className="h-10 w-12 p-1 rounded-md border"
                  />
                  <Input
                    id="accent-color-text"
                    type="text"
                    placeholder="Or type name (e.g., Blue)"
                    value={accentColorInput}
                    onChange={(e) => setAccentColorInput(e.target.value)}
                    className="flex-grow h-10"
                  />
              </div>
               <p className="text-xs text-muted-foreground mt-1">
                Default: Soft Blue ({`#64B5F6`}).
              </p>
            </div>

            <div>
              <Label htmlFor="page-limit">Page Limit</Label>
              <Input
                id="page-limit"
                type="number"
                value={pageLimitInput}
                onChange={(e) => setPageLimitInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                min="1"
                max="5"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerate} disabled={resumeMutation.isPending} className="w-full sm:w-auto">
            {resumeMutation.isPending ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2Icon className="mr-2 h-4 w-4" />
            )}
            Generate Resume & Analysis
          </Button>
        </CardFooter>
      </Card>


      {resumeMutation.isError && (
        <Alert variant="destructive">
          <AlertTitle>Error Generating Resume</AlertTitle>
          <AlertDescription>{resumeMutation.error.message}</AlertDescription>
        </Alert>
      )}

      {generatedData && (
        <div className="space-y-6">
          {renderOutputSection("Generated Summary", generatedData.summary, <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />)}
          {renderOutputSection("Match Analysis", generatedData.matchAnalysis, <BarChart3Icon className="mr-2 h-5 w-5 text-blue-500" />)}

          {/* {renderOutputSection("LaTeX Resume", generatedData.resume, <FileTextIcon className="mr-2 h-5 w-5 text-purple-500" />)} */}

          {renderOutputSection("Markdown Resume", generatedData.resumeMarkdown || '', <CodeIcon className="mr-2 h-5 w-5 text-teal-500" />)}

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-headline">
                <MailIcon className="mr-2 h-5 w-5 text-orange-500" />
                Cover Letter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-60 w-full rounded-md border p-3 bg-secondary/20">
                <pre className="text-sm whitespace-pre-wrap break-all font-code">{generatedData.coverLetter}</pre>
              </ScrollArea>
              <div className="mt-4 space-y-2">
                <Input
                  placeholder="Enter company information for refinement (optional)"
                  value={companyInfo}
                  onChange={(e) => setCompanyInfo(e.target.value)}
                />
                <Button onClick={handleRefineCoverLetter} disabled={coverLetterRefineMutation.isPending} variant="outline" className="w-full sm:w-auto">
                  {coverLetterRefineMutation.isPending ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Refine Cover Letter
                </Button>
              </div>
            </CardContent>
          </Card>
          {coverLetterRefineMutation.isError && (
            <Alert variant="destructive">
              <AlertTitle>Error Refining Cover Letter</AlertTitle>
              <AlertDescription>{coverLetterRefineMutation.error.message}</AlertDescription>
            </Alert>
          )}

          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center text-xl font-headline">
                    <SaveIcon className="mr-2 h-6 w-6 text-primary" />
                    Save Application
                </CardTitle>
                <CardDescription>Save this generated application package for future reference. Job title and company name will be auto-filled if extracted by AI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Input
                    placeholder="Job Title (e.g., Senior Software Engineer)"
                    value={jobTitleForSaving}
                    onChange={(e) => setJobTitleForSaving(e.target.value)}
                />
                <Input
                    placeholder="Company Name (e.g., Google)"
                    value={companyNameForSaving}
                    onChange={(e) => setCompanyNameForSaving(e.target.value)}
                />
            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveApplication} className="w-full sm:w-auto">
                    <SaveIcon className="mr-2 h-4 w-4" /> Save Application
                </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
