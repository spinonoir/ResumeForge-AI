
"use client";

import React, { useState, useRef } from 'react';
import { useUserProfileStore } from '@/lib/store';
import type { EmploymentEntry, SkillEntry, ProjectEntry } from '@/types';
import { EditableList, type EditableListRef } from '@/components/EditableList';
import { BackgroundBuilder } from '@/components/profile/BackgroundBuilder';
import { BriefcaseIcon, LightbulbIcon, SparklesIcon, PlusCircleIcon, Loader2Icon, XIcon, ListChecksIcon, BrainIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from '@tanstack/react-query';
import { parseEmploymentText, type ParseEmploymentTextInput, type ParseEmploymentTextOutput } from '@/ai/flows/employment-text-parser-flow';
import { parseAndCategorizeSkills, type ParseSkillsInput, type ParseSkillsOutput } from '@/ai/flows/skill-parser-categorizer-flow';
import { parseProjectText, type ParseProjectTextInput, type ParseProjectTextOutput } from '@/ai/flows/project-text-parser-flow';
import { toast } from '@/hooks/use-toast';

const employmentFields = [
  { name: 'title', label: 'Job Title', type: 'text' as 'text', placeholder: 'e.g., Software Engineer' },
  { name: 'company', label: 'Company', type: 'text' as 'text', placeholder: 'e.g., Tech Solutions Inc.' },
  { name: 'dates', label: 'Dates', type: 'text' as 'text', placeholder: 'e.g., Jan 2020 - Present' },
  { name: 'jobSummary', label: 'Job Summary (1-2 sentences)', type: 'textarea' as 'textarea', placeholder: 'Brief overview of your role and core responsibilities.' },
  { name: 'description', label: 'Detailed Responsibilities & Achievements', type: 'textarea' as 'textarea', placeholder: 'List all key duties, functions, and accomplishments.' },
];

const projectFields = [
  { name: 'name', label: 'Project Name', type: 'text' as 'text', placeholder: 'e.g., Personal Portfolio Website' },
  { name: 'description', label: 'Description', type: 'textarea' as 'textarea', placeholder: 'Describe the project and your role.' },
  { name: 'link', label: 'Link (Optional)', type: 'text' as 'text', placeholder: 'e.g., https://github.com/yourproject' },
];

interface ParsedSkillFromAI {
  name: string;
  category: string;
}

export function ProfileTabContent() {
  const { 
    employmentHistory, addEmploymentEntry, updateEmploymentEntry, removeEmploymentEntry,
    skills, addSkill, removeSkill,
    projects, addProjectEntry, updateProjectEntry, removeProjectEntry
  } = useUserProfileStore();

  const employmentListRef = useRef<EditableListRef<EmploymentEntry>>(null);
  const projectListRef = useRef<EditableListRef<ProjectEntry>>(null);

  const [isAIParsingDialogOpen, setIsAIParsingDialogOpen] = useState(false);
  const [textToParse, setTextToParse] = useState('');

  const [isAISkillsDialogOpen, setIsAISkillsDialogOpen] = useState(false);
  const [skillsTextToParse, setSkillsTextToParse] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState<ParsedSkillFromAI[]>([]);

  const [isAIProjectParsingDialogOpen, setIsAIProjectParsingDialogOpen] = useState(false);
  const [projectTextToParse, setProjectTextToParse] = useState('');

  const employmentParseMutation = useMutation<ParseEmploymentTextOutput, Error, ParseEmploymentTextInput>({
    mutationFn: parseEmploymentText,
    onSuccess: (data) => {
      employmentListRef.current?.initiateAddItem({
        title: data.jobTitle,
        company: data.company,
        dates: data.employmentDates,
        jobSummary: data.jobSummary,
        description: data.jobDescription,
      });
      toast({ title: "Parsing Successful", description: "Employment form pre-filled. Please review and save." });
      setIsAIParsingDialogOpen(false);
      setTextToParse('');
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Parsing Failed", description: error.message });
    }
  });

  const skillsParseMutation = useMutation<ParseSkillsOutput, Error, ParseSkillsInput>({
    mutationFn: parseAndCategorizeSkills,
    onSuccess: (data) => {
      setSuggestedSkills(data.skills);
      if (data.skills.length > 0) {
        toast({ title: "Skills Parsed", description: "Review the suggested skills and categories below." });
      } else {
        toast({ title: "No Skills Found", description: "The AI couldn't find skills in the provided text." });
      }
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Skill Parsing Failed", description: error.message });
      setSuggestedSkills([]);
    }
  });
  
  const projectParseMutation = useMutation<ParseProjectTextOutput, Error, ParseProjectTextInput>({
    mutationFn: parseProjectText,
    onSuccess: (data) => {
      projectListRef.current?.initiateAddItem({
        name: data.projectName,
        description: data.projectDescription,
        link: data.projectLink,
      });
      toast({ title: "Project Parsing Successful", description: "Project form pre-filled. Please review and save." });
      setIsAIProjectParsingDialogOpen(false);
      setProjectTextToParse('');
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Project Parsing Failed", description: error.message });
    }
  });

  const handleParseEmployment = () => {
    if (!textToParse.trim()) {
      toast({ variant: "destructive", title: "No Text Provided", description: "Please paste text to parse." });
      return;
    }
    employmentParseMutation.mutate({ textBlock: textToParse });
  };

  const handleParseSkills = () => {
    if (!skillsTextToParse.trim()) {
      toast({ variant: "destructive", title: "No Text Provided", description: "Please paste skills text to parse." });
      return;
    }
    setSuggestedSkills([]); 
    skillsParseMutation.mutate({ textBlock: skillsTextToParse });
  };

  const handleParseProjectText = () => {
    if (!projectTextToParse.trim()) {
      toast({ variant: "destructive", title: "No Text Provided", description: "Please paste project text to parse." });
      return;
    }
    projectParseMutation.mutate({ textBlock: projectTextToParse });
  };

  const handleAddAllSuggestedSkills = async () => {
    if (suggestedSkills.length === 0) {
      toast({ variant: "destructive", title: "No Skills to Add", description: "No skills were suggested." });
      return;
    }
    let skillsAddedCount = 0;
    for (const skill of suggestedSkills) {
      await addSkill({ name: skill.name, category: skill.category });
      skillsAddedCount++; 
    }
    if (skillsAddedCount > 0) {
        toast({ title: "Skills Added", description: `${skillsAddedCount} skills/categories added to your profile.` });
    }
    setSuggestedSkills([]);
    setSkillsTextToParse('');
    setIsAISkillsDialogOpen(false);
  };
  
  const renderEmploymentItem = (item: EmploymentEntry) => (
    <div>
      <h4 className="font-semibold text-md">{item.title}</h4>
      <p className="text-sm text-muted-foreground">{item.company} | {item.dates}</p>
      {item.jobSummary && (
        <div className="mt-1">
          <p className="text-xs font-medium text-muted-foreground">Summary:</p>
          <p className="text-sm whitespace-pre-wrap">{item.jobSummary}</p>
        </div>
      )}
      <div className="mt-1">
        <p className="text-xs font-medium text-muted-foreground">Details:</p>
        <p className="text-sm whitespace-pre-wrap">{item.description}</p>
      </div>
    </div>
  );

  const renderProjectItem = (item: ProjectEntry) => (
     <div>
      <h4 className="font-semibold text-md">{item.name}</h4>
      {item.link && <a href={item.link.startsWith('http') ? item.link : `https://${item.link}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">{item.link}</a>}
      <p className="text-sm mt-1 whitespace-pre-wrap">{item.description}</p>
    </div>
  );

  const employmentCustomAddButton = (
    <div className="ml-auto flex items-center gap-1">
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAIParsingDialogOpen(true)}
            aria-label="Add new employment with AI"
            title="Add with AI"
        >
            <SparklesIcon className="h-5 w-5 text-primary" />
        </Button>
        <Button
            variant="ghost"
            size="icon"
            onClick={() => employmentListRef.current?.initiateAddItem()}
            aria-label="Add new employment manually"
            title="Add manually"
        >
            <PlusCircleIcon className="h-5 w-5 text-primary" />
        </Button>
    </div>
  );
  
  const projectCustomAddButton = (
    <div className="ml-auto flex items-center gap-1">
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAIProjectParsingDialogOpen(true)}
            aria-label="Add new project with AI"
            title="Add with AI"
        >
            <SparklesIcon className="h-5 w-5 text-primary" />
        </Button>
        <Button
            variant="ghost"
            size="icon"
            onClick={() => projectListRef.current?.initiateAddItem()}
            aria-label="Add new project manually"
            title="Add manually"
        >
            <PlusCircleIcon className="h-5 w-5 text-primary" />
        </Button>
    </div>
  );


  return (
    <div className="space-y-8">
      <p className="text-muted-foreground">
        Build your professional profile. This information will be used by the AI to generate tailored resumes and cover letters.
      </p>
      
      <EditableList<EmploymentEntry>
        ref={employmentListRef}
        title="Employment History"
        items={employmentHistory}
        fields={employmentFields}
        onAddItem={addEmploymentEntry}
        onUpdateItem={updateEmploymentEntry}
        onRemoveItem={removeEmploymentEntry}
        renderItem={renderEmploymentItem}
        itemToString={(item) => `${item.title} at ${item.company}`}
        icon={<BriefcaseIcon className="h-6 w-6 text-primary" />}
        customAddButton={employmentCustomAddButton}
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline">
            <ListChecksIcon className="mr-2 h-6 w-6 text-primary" />
            Skills
          </CardTitle>
          <CardDescription>Manage your professional skills. Use AI to import and categorize a list of skills.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => { setSuggestedSkills([]); setSkillsTextToParse(''); setIsAISkillsDialogOpen(true); }} className="w-full sm:w-auto">
            <BrainIcon className="mr-2 h-4 w-4" /> Import & Categorize Skills with AI
          </Button>
          {skills.length === 0 && !isAISkillsDialogOpen ? (
             <p className="text-muted-foreground mt-4">No skills added yet. Click the button above to import skills.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-4">
              {skills.map(skill => (
                <span key={skill.id} className="flex items-center bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm">
                  {skill.name} {skill.category && <span className="text-xs opacity-80 ml-1.5">({skill.category})</span>}
                  <Button variant="ghost" size="icon" className="ml-1 h-5 w-5 hover:bg-accent/80 text-accent-foreground/70 hover:text-accent-foreground" onClick={() => removeSkill(skill.id)} aria-label={`Remove skill ${skill.name}`}>
                    <XIcon className="h-3 w-3" />
                  </Button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EditableList<ProjectEntry>
        ref={projectListRef}
        title="Projects"
        items={projects}
        fields={projectFields}
        onAddItem={addProjectEntry}
        onUpdateItem={updateProjectEntry}
        onRemoveItem={removeProjectEntry}
        renderItem={renderProjectItem}
        itemToString={(item) => item.name}
        icon={<LightbulbIcon className="h-6 w-6 text-primary" />}
        customAddButton={projectCustomAddButton}
      />
      
      <BackgroundBuilder />

      <Dialog open={isAIParsingDialogOpen} onOpenChange={setIsAIParsingDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Parse Employment Details from Text</DialogTitle>
            <DialogDescription>Paste a block of text from your resume or job history, and we'll try to fill in the fields for you.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea
              placeholder="Paste employment text here..."
              value={textToParse}
              onChange={(e) => setTextToParse(e.target.value)}
              rows={10}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleParseEmployment} disabled={employmentParseMutation.isPending}>
              {employmentParseMutation.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Parse and Pre-fill Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAISkillsDialogOpen} onOpenChange={(isOpen) => {
          setIsAISkillsDialogOpen(isOpen);
          if (!isOpen) {
            setSuggestedSkills([]); 
            setSkillsTextToParse('');
          }
      }}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Import & Categorize Skills with AI</DialogTitle>
            <DialogDescription>Paste a list or block of text containing your skills. The AI will attempt to extract, clean, and categorize them.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea
              placeholder="Paste your skills here (e.g., Python, JavaScript, Project Management, Team Leadership, Figma, AWS S3)..."
              value={skillsTextToParse}
              onChange={(e) => setSkillsTextToParse(e.target.value)}
              rows={8}
              className="w-full"
              disabled={skillsParseMutation.isPending || suggestedSkills.length > 0}
            />
            {skillsParseMutation.isError && (
                <p className="text-sm text-destructive">Error: {skillsParseMutation.error.message}</p>
            )}
            {suggestedSkills.length > 0 && (
              <div className="mt-4">
                <h3 className="text-md font-semibold mb-2">Suggested Skills & Categories:</h3>
                <ScrollArea className="h-48 border rounded-md p-2">
                  <ul className="space-y-1">
                    {suggestedSkills.map((skill, index) => (
                      <li key={index} className="text-sm p-1 bg-secondary/30 rounded">
                        <strong>{skill.name}</strong> - <span className="text-muted-foreground">{skill.category}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
                <p className="text-xs text-muted-foreground mt-1">Review the suggestions. Click "Add All" to add them to your profile.</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {suggestedSkills.length > 0 ? "Close" : "Cancel"}
              </Button>
            </DialogClose>
            {suggestedSkills.length === 0 ? (
              <Button onClick={handleParseSkills} disabled={skillsParseMutation.isPending || !skillsTextToParse.trim()}>
                {skillsParseMutation.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                Parse and Suggest Skills
              </Button>
            ) : (
              <Button onClick={handleAddAllSuggestedSkills}>
                 Add All Suggested Skills to Profile
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAIProjectParsingDialogOpen} onOpenChange={setIsAIProjectParsingDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Parse Project Details from Text</DialogTitle>
            <DialogDescription>Paste a block of text describing your project, and we'll try to fill in the fields for you.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea
              placeholder="Paste project text here..."
              value={projectTextToParse}
              onChange={(e) => setProjectTextToParse(e.target.value)}
              rows={10}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleParseProjectText} disabled={projectParseMutation.isPending}>
              {projectParseMutation.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Parse and Pre-fill Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
