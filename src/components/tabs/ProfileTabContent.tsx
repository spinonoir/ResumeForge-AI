
"use client";

import React, { useState, useRef } from 'react';
import { useUserProfileStore } from '@/lib/store';
import type { EmploymentEntry, SkillEntry, ProjectEntry } from '@/types';
import { EditableList, type EditableListRef } from '@/components/EditableList';
import { BackgroundBuilder } from '@/components/profile/BackgroundBuilder';
import { BriefcaseIcon, LightbulbIcon, SparklesIcon, UserCircle2Icon, PlusCircleIcon, Loader2Icon, XIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useMutation } from '@tanstack/react-query';
import { parseEmploymentText, type ParseEmploymentTextInput, type ParseEmploymentTextOutput } from '@/ai/flows/employment-text-parser-flow';
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

export function ProfileTabContent() {
  const { 
    employmentHistory, addEmploymentEntry, updateEmploymentEntry, removeEmploymentEntry,
    skills, addSkill, removeSkill,
    projects, addProjectEntry, updateProjectEntry, removeProjectEntry
  } = useUserProfileStore();

  const [newSkill, setNewSkill] = useState('');
  const employmentListRef = useRef<EditableListRef<EmploymentEntry>>(null);
  const [isAIParsingDialogOpen, setIsAIParsingDialogOpen] = useState(false);
  const [textToParse, setTextToParse] = useState('');

  const parseMutation = useMutation<ParseEmploymentTextOutput, Error, ParseEmploymentTextInput>({
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

  const handleParseAndPrefill = () => {
    if (!textToParse.trim()) {
      toast({ variant: "destructive", title: "No Text Provided", description: "Please paste text to parse." });
      return;
    }
    parseMutation.mutate({ textBlock: textToParse });
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      addSkill(newSkill.trim());
      setNewSkill('');
    }
  };
  
  const renderEmploymentItem = (item: EmploymentEntry, onEdit: () => void, onRemove: () => void) => (
    <div>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-md">{item.title}</h4>
          <p className="text-sm text-muted-foreground">{item.company} | {item.dates}</p>
        </div>
        {/* Edit/Remove buttons are handled by EditableList's default rendering or its internal buttons */}
      </div>
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

  const renderProjectItem = (item: ProjectEntry, onEdit: () => void, onRemove: () => void) => (
     <div>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-md">{item.name}</h4>
          {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{item.link}</a>}
        </div>
         {/* Edit/Remove buttons are handled by EditableList's default rendering or its internal buttons */}
      </div>
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
            <SparklesIcon className="mr-2 h-6 w-6 text-primary" />
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input 
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g., Python, Project Management"
              className="flex-grow"
              onKeyPress={(e) => { if (e.key === 'Enter') { handleAddSkill(); e.preventDefault(); }}}
            />
            <Button onClick={handleAddSkill}>Add Skill</Button>
          </div>
          {skills.length === 0 ? (
             <p className="text-muted-foreground">No skills added yet. Type a skill and click "Add Skill".</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill.id} className="flex items-center bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm">
                  {skill.name}
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
        title="Projects"
        items={projects}
        fields={projectFields}
        onAddItem={addProjectEntry}
        onUpdateItem={updateProjectEntry}
        onRemoveItem={removeProjectEntry}
        renderItem={renderProjectItem}
        itemToString={(item) => item.name}
        icon={<LightbulbIcon className="h-6 w-6 text-primary" />}
      />
      
      <BackgroundBuilder />

      <Dialog open={isAIParsingDialogOpen} onOpenChange={setIsAIParsingDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Parse Employment Details from Text</DialogTitle>
            <CardDescription>Paste a block of text from your resume or job history, and we'll try to fill in the fields for you.</CardDescription>
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
            <Button onClick={handleParseAndPrefill} disabled={parseMutation.isPending}>
              {parseMutation.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Parse and Pre-fill Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

