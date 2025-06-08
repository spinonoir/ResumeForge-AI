
"use client";

import React, { useState, useRef, useMemo } from 'react';
import { useUserProfileStore } from '@/lib/store';
import type { EmploymentEntry, SkillEntry, ProjectEntry } from '@/types';
import { EditableList, type EditableListRef } from '@/components/EditableList';
import { BackgroundBuilder } from '@/components/profile/BackgroundBuilder';
import { BriefcaseIcon, LightbulbIcon, SparklesIcon, PlusCircleIcon, Loader2Icon, XIcon, ListChecksIcon, BrainIcon, CheckIcon, FileTextIcon, EditIcon, ClipboardListIcon, FilterIcon } from 'lucide-react';
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
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const employmentFields = [
  { name: 'title', label: 'Job Title', type: 'text' as 'text', placeholder: 'e.g., Software Engineer' },
  { name: 'company', label: 'Company', type: 'text' as 'text', placeholder: 'e.g., Tech Solutions Inc.' },
  { name: 'dates', label: 'Dates', type: 'text' as 'text', placeholder: 'e.g., Jan 2020 - Present' },
  { name: 'jobSummary', label: 'Job Summary (1-2 sentences)', type: 'textarea' as 'textarea', placeholder: 'Brief overview of your role and core responsibilities.' },
  { name: 'description', label: 'Detailed Responsibilities & Achievements', type: 'textarea' as 'textarea', placeholder: 'List all key duties, functions, and accomplishments.' },
];

const projectFields = [
  { name: 'name', label: 'Project Name', type: 'text' as 'text', placeholder: 'e.g., My Awesome App' },
  { name: 'association', label: 'Association', type: 'text' as 'text', placeholder: 'e.g., Personal, School, Work' },
  { name: 'dates', label: 'Dates Active', type: 'text' as 'text', placeholder: 'e.g., Jan 2023 - Mar 2023' },
  { name: 'skillsUsed', label: 'Skills Used (comma-separated)', type: 'textarea' as 'textarea', placeholder: 'e.g., React, Node.js, Python' },
  { name: 'roleDescription', label: 'Your Role & Contributions', type: 'textarea' as 'textarea', placeholder: 'Describe your duties, contributions, and tasks.' },
  { name: 'link', label: 'Link (Optional)', type: 'text' as 'text', placeholder: 'e.g., https://github.com/yourproject' },
];

interface ParsedSkillFromAI {
  name: string;
  category: string;
}

export function ProfileTabContent() {
  const { 
    employmentHistory, addEmploymentEntry, updateEmploymentEntry, removeEmploymentEntry,
    skills, addSkill: storeAddSkill, removeSkill,
    projects, addProjectEntry: storeAddProjectEntry, updateProjectEntry: storeUpdateProjectEntry, removeProjectEntry
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
  const [pendingProjectAIData, setPendingProjectAIData] = useState<ParseProjectTextOutput | null>(null);
  const [projectAISkillsEditText, setProjectAISkillsEditText] = useState('');

  // State for skills section enhancements
  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>("All Categories");
  const SKILLS_COLLAPSED_LIMIT = 8;


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
      setPendingProjectAIData(data);
      setProjectAISkillsEditText((data.projectSkillsUsed || []).join(', '));
      toast({ title: "Project Parsing Successful", description: "Review the extracted details below and edit if needed." });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Project Parsing Failed", description: error.message });
      setPendingProjectAIData(null);
    }
  });

  const handleProceedWithAIParsedProjectData = () => {
    if (!pendingProjectAIData) return;
    
    projectListRef.current?.initiateAddItem({
      name: pendingProjectAIData.projectName,
      association: pendingProjectAIData.projectAssociation,
      dates: pendingProjectAIData.projectDates,
      skillsUsed: projectAISkillsEditText.split(',').map(s => s.trim()).filter(s => s),
      roleDescription: pendingProjectAIData.projectRoleDescription,
      link: pendingProjectAIData.projectLink,
    });

    setIsAIProjectParsingDialogOpen(false);
    setProjectTextToParse('');
    setPendingProjectAIData(null);
    setProjectAISkillsEditText('');
  };

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
    setPendingProjectAIData(null); 
    projectParseMutation.mutate({ textBlock: projectTextToParse });
  };

  const handleAddAllSuggestedSkills = async () => {
    if (suggestedSkills.length === 0) {
      toast({ variant: "destructive", title: "No Skills to Add", description: "No skills were suggested." });
      return;
    }
    let skillsAddedCount = 0;
    for (const skill of suggestedSkills) {
      // Check if skill already exists (case-insensitive) before attempting to add
      const existingGlobalSkill = useUserProfileStore.getState().skills.find(s => s.name.toLowerCase() === skill.name.toLowerCase());
      if (!existingGlobalSkill) {
        await storeAddSkill({ name: skill.name, category: skill.category });
        skillsAddedCount++; 
      }
    }
    if (skillsAddedCount > 0) {
        toast({ title: "Skills Processed", description: `${skillsAddedCount} new skills added to your profile.` });
    } else {
        toast({ title: "Skills Processed", description: "No new skills were added (existing skills might have been updated or matched)." });
    }
    setSuggestedSkills([]);
    setSkillsTextToParse('');
    setIsAISkillsDialogOpen(false);
  };

  const findOrAddSkillAndGetCanonicalName = async (skillNameFromProject: string): Promise<string> => {
    const { skills: globalSkills, addSkill: globalAddSkill } = useUserProfileStore.getState();
    const trimmedProjectSkillName = skillNameFromProject.trim();
    if (!trimmedProjectSkillName) return ""; 
    const lcTrimmedProjectSkillName = trimmedProjectSkillName.toLowerCase();
  
    const exactMatch = globalSkills.find(gs => gs.name.toLowerCase() === lcTrimmedProjectSkillName);
    if (exactMatch) {
      return exactMatch.name; 
    }
  
    const generalParentSkill = globalSkills.find(gs => {
      const lcGSName = gs.name.toLowerCase();
      return lcTrimmedProjectSkillName.startsWith(lcGSName) && 
             lcTrimmedProjectSkillName.length > lcGSName.length && 
             (lcTrimmedProjectSkillName.charAt(lcGSName.length) === ' ' || 
              lcTrimmedProjectSkillName.charAt(lcGSName.length) === '.' || 
              !isNaN(parseInt(lcTrimmedProjectSkillName.charAt(lcGSName.length))) );
    });

    if (generalParentSkill) {
      return generalParentSkill.name; 
    }
    
    // If no match, add it (storeAddSkill internally checks for exact duplicates before adding)
    await globalAddSkill({ name: trimmedProjectSkillName, category: "Uncategorized" });
    // Re-fetch to get the potentially newly added skill's canonical name or the existing one if addSkill deduped
    const updatedGlobalSkills = useUserProfileStore.getState().skills;
    const finalMatch = updatedGlobalSkills.find(gs => gs.name.toLowerCase() === lcTrimmedProjectSkillName);
    return finalMatch ? finalMatch.name : trimmedProjectSkillName; 
  };
  
  const processProjectSkillsForGlobalStore = async (skillsUsedStringOrArray: string | string[]): Promise<string[]> => {
    const skillNamesInput = Array.isArray(skillsUsedStringOrArray)
      ? skillsUsedStringOrArray.map(s => s.trim()).filter(s => s)
      : skillsUsedStringOrArray.split(',').map(s => s.trim()).filter(s => s);
  
    const canonicalSkillNamesForProject: string[] = [];
    for (const name of skillNamesInput) {
      if (name) { 
          const canonicalName = await findOrAddSkillAndGetCanonicalName(name);
          if (canonicalName && !canonicalSkillNamesForProject.some(cn => cn.toLowerCase() === canonicalName.toLowerCase())) {
            canonicalSkillNamesForProject.push(canonicalName);
          }
      }
    }
    return canonicalSkillNamesForProject;
  };

  const handleAddProject = async (projectItem: Omit<ProjectEntry, 'id'>) => {
    const skillsForProject = await processProjectSkillsForGlobalStore((projectItem as any).skillsUsed);
    await storeAddProjectEntry({ ...projectItem, skillsUsed: skillsForProject });
  };
  
  const handleUpdateProject = async (id: string, projectItem: Partial<Omit<ProjectEntry, 'id'>>) => {
    let skillsForProject = projectItem.skillsUsed || []; 
    if (projectItem.skillsUsed && (typeof projectItem.skillsUsed === 'string' || Array.isArray(projectItem.skillsUsed))) { 
        skillsForProject = await processProjectSkillsForGlobalStore(projectItem.skillsUsed as string | string[]);
    }
    await storeUpdateProjectEntry(id, { ...projectItem, skillsUsed: skillsForProject as string[] });
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
     <div className="space-y-1.5">
      <h4 className="font-semibold text-md">{item.name}</h4>
      <p className="text-sm text-muted-foreground">
        {item.association} | {item.dates}
      </p>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">Role & Contributions:</p>
        <p className="text-sm whitespace-pre-wrap">{item.roleDescription}</p>
      </div>
      {item.skillsUsed && item.skillsUsed.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Skills Used:</p>
          <div className="flex flex-wrap gap-1.5">
            {item.skillsUsed.map(skillName => (
              <span 
                key={skillName} 
                className="bg-accent text-accent-foreground px-2.5 py-1 rounded-full text-xs font-medium"
              >
                {skillName}
              </span>
            ))}
          </div>
        </div>
      )}
      {item.link && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-0.5">Link:</p>
          <a 
              href={item.link.startsWith('http') ? item.link : `https://${item.link}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-primary hover:underline break-all"
          >
              {item.link}
          </a>
        </div>
      )}
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
            onClick={() => {
              setProjectTextToParse('');
              setPendingProjectAIData(null);
              setProjectAISkillsEditText('');
              setIsAIProjectParsingDialogOpen(true);
            }}
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

  const isSkillVerified = (skillNameToCheck: string): boolean => {
    const nameLower = skillNameToCheck.toLowerCase();
    return projects.some(p => p.skillsUsed && p.skillsUsed.some(s => s.toLowerCase() === nameLower));
  };

  // Derived state for skills display
  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    skills.forEach(skill => {
      if (skill.category) {
        categories.add(skill.category);
      }
    });
    return ["All Categories", ...Array.from(categories).sort()];
  }, [skills]);

  const skillsInCurrentCategory = useMemo(() => {
    if (selectedSkillCategory === "All Categories") {
      return skills;
    }
    return skills.filter(skill => skill.category === selectedSkillCategory);
  }, [skills, selectedSkillCategory]);

  const displayedSkills = useMemo(() => {
    if (!skillsExpanded && skillsInCurrentCategory.length > SKILLS_COLLAPSED_LIMIT) {
      return skillsInCurrentCategory.slice(0, SKILLS_COLLAPSED_LIMIT);
    }
    return skillsInCurrentCategory;
  }, [skillsInCurrentCategory, skillsExpanded, SKILLS_COLLAPSED_LIMIT]);


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
          <CardDescription>Manage your professional skills. Filter by category and expand to see all. Skills used in projects are marked with a check.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div className="flex-grow">
              <Label htmlFor="skill-category-filter" className="text-xs font-medium text-muted-foreground flex items-center mb-1">
                <FilterIcon className="h-3 w-3 mr-1.5" />
                Filter by Category
              </Label>
              <Select
                value={selectedSkillCategory}
                onValueChange={(value) => {
                  setSelectedSkillCategory(value);
                  setSkillsExpanded(false); // Reset expansion when category changes
                }}
              >
                <SelectTrigger id="skill-category-filter" className="w-full sm:w-[280px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => { setSuggestedSkills([]); setSkillsTextToParse(''); setIsAISkillsDialogOpen(true); }} 
              className="w-full sm:w-auto shrink-0"
            >
              <BrainIcon className="mr-2 h-4 w-4" /> Import & Categorize Skills with AI
            </Button>
          </div>
          
          {(() => {
            if (skills.length === 0) {
              return <p className="text-muted-foreground mt-2">No skills added yet. Click the "Import & Categorize Skills with AI" button to add skills.</p>;
            }
            if (skillsInCurrentCategory.length === 0 && selectedSkillCategory !== "All Categories") {
              return <p className="text-muted-foreground mt-2">No skills found in the category "{selectedSkillCategory}". Try selecting "All Categories".</p>;
            }
            if (displayedSkills.length === 0 && skillsInCurrentCategory.length > 0) {
                 // This case implies skillsExpanded is false and limit is 0, or some other edge case.
                 // Primarily, if skillsInCurrentCategory has items, displayedSkills should too unless limit is 0.
                 // For safety, let's message if displayedSkills is empty but underlying filtered list is not.
                return <p className="text-muted-foreground mt-2">Skills available. Click "Show More" if applicable.</p>;
            }
             if (displayedSkills.length === 0 && skillsInCurrentCategory.length === 0 && selectedSkillCategory === "All Categories") {
                 // This should be caught by skills.length === 0, but as a safeguard
                return <p className="text-muted-foreground mt-2">No skills added yet.</p>;
            }


            return (
              <>
                <div className="flex flex-wrap gap-2 mt-2 min-h-[36px]"> {/* min-h to prevent layout shift when empty */}
                  {displayedSkills.map(skill => (
                    <span key={skill.id} className="flex items-center bg-accent text-accent-foreground pl-3 pr-1 py-1 rounded-full text-sm">
                      {skill.name}
                      {skill.category && <span className="text-xs opacity-80 ml-1.5 mr-1">({skill.category})</span>}
                      {isSkillVerified(skill.name) && <CheckIcon className="h-4 w-4 ml-0.5 text-green-300" />}
                      <Button variant="ghost" size="icon" className="ml-1 h-5 w-5 hover:bg-accent/80 text-accent-foreground/70 hover:text-accent-foreground" onClick={() => removeSkill(skill.id)} aria-label={`Remove skill ${skill.name}`}>
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </span>
                  ))}
                </div>
                {skillsInCurrentCategory.length > SKILLS_COLLAPSED_LIMIT && (
                  <Button 
                    variant="link" 
                    onClick={() => setSkillsExpanded(!skillsExpanded)} 
                    className="mt-2 pl-0 text-sm"
                  >
                    {skillsExpanded ? "Show Less" : `Show ${skillsInCurrentCategory.length - SKILLS_COLLAPSED_LIMIT} More`}
                  </Button>
                )}
              </>
            );
          })()}
        </CardContent>
      </Card>

      <EditableList<ProjectEntry>
        ref={projectListRef}
        title="Projects"
        items={projects}
        fields={projectFields}
        onAddItem={handleAddProject}
        onUpdateItem={handleUpdateProject}
        onRemoveItem={removeProjectEntry}
        renderItem={renderProjectItem}
        itemToString={(item) => item.name}
        icon={<LightbulbIcon className="h-6 w-6 text-primary" />}
        customAddButton={projectCustomAddButton}
        transformInitialDataForForm={(initialData) => {
          if (initialData && Array.isArray(initialData.skillsUsed)) {
            return { ...initialData, skillsUsed: (initialData.skillsUsed as string[]).join(', ') };
          }
          return initialData;
        }}
      />
      
      <BackgroundBuilder />

      {/* Employment AI Parsing Dialog */}
      <Dialog open={isAIParsingDialogOpen} onOpenChange={setIsAIParsingDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl flex items-center"><ClipboardListIcon className="mr-2 h-5 w-5"/>Parse Employment Details</DialogTitle>
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

      {/* Skills AI Parsing Dialog */}
      <Dialog open={isAISkillsDialogOpen} onOpenChange={(isOpen) => {
          setIsAISkillsDialogOpen(isOpen);
          if (!isOpen) {
            setSuggestedSkills([]); 
            setSkillsTextToParse('');
          }
      }}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl flex items-center"><BrainIcon className="mr-2 h-5 w-5"/>Import & Categorize Skills</DialogTitle>
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

      {/* Project AI Parsing Dialog */}
      <Dialog open={isAIProjectParsingDialogOpen} onOpenChange={(isOpen) => {
        setIsAIProjectParsingDialogOpen(isOpen);
        if (!isOpen) { 
            setProjectTextToParse('');
            setPendingProjectAIData(null);
            setProjectAISkillsEditText('');
        }
      }}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl flex items-center">
                <FileTextIcon className="mr-2 h-5 w-5" /> Parse Project Details
            </DialogTitle>
            {!pendingProjectAIData ? (
              <DialogDescription>Paste a block of text describing your project. The AI will attempt to extract relevant details.</DialogDescription>
            ) : (
              <DialogDescription>Review the AI-extracted details below. Edit the skills if needed, then proceed.</DialogDescription>
            )}
          </DialogHeader>
          
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {!pendingProjectAIData ? (
              <Textarea
                placeholder="Paste project text here..."
                value={projectTextToParse}
                onChange={(e) => setProjectTextToParse(e.target.value)}
                rows={10}
                className="w-full"
                disabled={projectParseMutation.isPending}
              />
            ) : (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Suggested Project Name:</Label>
                  <p className="text-sm p-2 border rounded-md bg-secondary/30">{pendingProjectAIData.projectName || "Not found"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Suggested Association:</Label>
                  <p className="text-sm p-2 border rounded-md bg-secondary/30">{pendingProjectAIData.projectAssociation || "Not found"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Suggested Dates:</Label>
                  <p className="text-sm p-2 border rounded-md bg-secondary/30">{pendingProjectAIData.projectDates || "Not found"}</p>
                </div>
                 <div>
                  <Label htmlFor="ai-project-skills" className="text-xs text-muted-foreground">Suggested Skills (edit if needed, comma-separated):</Label>
                  <Textarea
                    id="ai-project-skills"
                    value={projectAISkillsEditText}
                    onChange={(e) => setProjectAISkillsEditText(e.target.value)}
                    rows={3}
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Suggested Role & Contributions:</Label>
                  <ScrollArea className="h-28">
                    <p className="text-sm p-2 border rounded-md bg-secondary/30 whitespace-pre-wrap">{pendingProjectAIData.projectRoleDescription || "Not found"}</p>
                  </ScrollArea>
                </div>
                {pendingProjectAIData.projectLink && (
                   <div>
                    <Label className="text-xs text-muted-foreground">Suggested Link:</Label>
                    <p className="text-sm p-2 border rounded-md bg-secondary/30 break-all">{pendingProjectAIData.projectLink}</p>
                  </div>
                )}
              </div>
            )}
             {projectParseMutation.isError && (
                <p className="text-sm text-destructive mt-2">Error: {projectParseMutation.error.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {!pendingProjectAIData ? (
              <>
                <Button type="button" variant="outline" onClick={() => {
                    setIsAIProjectParsingDialogOpen(false);
                    setProjectTextToParse('');
                    setPendingProjectAIData(null);
                    setProjectAISkillsEditText('');
                }}>
                  Cancel
                </Button>
                <Button onClick={handleParseProjectText} disabled={projectParseMutation.isPending || !projectTextToParse.trim()}>
                  {projectParseMutation.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                  Parse Project Details
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => {
                    setPendingProjectAIData(null);
                    setProjectAISkillsEditText(''); 
                }}>
                  Back to Edit Text
                </Button>
                <Button onClick={handleProceedWithAIParsedProjectData}>
                  <CheckIcon className="mr-2 h-4 w-4" /> Use Details & Continue to Form
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

