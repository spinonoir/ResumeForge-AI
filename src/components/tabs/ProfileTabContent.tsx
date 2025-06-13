"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useUserProfileStore } from '@/lib/store';
import { categorizeSkill } from '@/lib/store';
import type { EmploymentEntry, ProjectEntry, SkillEntry } from '@/types';
import { EditableList } from '@/components/EditableList';
import { BackgroundBuilder } from '@/components/profile/BackgroundBuilder';
import { PersonalDetailsForm } from '@/components/profile/PersonalDetailsForm';
import { SkillDetailsDialog } from '@/components/profile/SkillDetailsDialog';
import { AITextInput } from '@/components/profile/AITextInput';
import { 
  BriefcaseIcon, 
  SparklesIcon, 
  LightbulbIcon, 
  UserCircle2Icon,
  Link2Icon,
  EditIcon,
  Trash2Icon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  parseEmploymentText, 
  parseAndCategorizeSkills, 
  parseProjectText,
  ParseEmploymentTextInput,
  ParseEmploymentTextOutput,
  ParseProjectTextInput,
  ParseProjectTextOutput
} from '@/lib/profile-management-service';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const employmentFields = [
  { name: 'title', label: 'Job Title', type: 'text' as const, placeholder: 'e.g., Software Engineer' },
  { name: 'company', label: 'Company', type: 'text' as const, placeholder: 'e.g., Tech Solutions Inc.' },
  { name: 'dates', label: 'Dates', type: 'text' as const, placeholder: 'e.g., Jan 2020 - Present' },
  { name: 'description', label: 'Description', type: 'textarea' as const, placeholder: 'Briefly describe your responsibilities and achievements.' },
  { name: 'link', label: 'Link (Optional)', type: 'text' as const, placeholder: 'e.g., https://github.com/yourproject' },
];

const projectFields = [
  { name: 'name', label: 'Project Name', type: 'text' as const, placeholder: 'e.g., Personal Portfolio Website' },
  { name: 'association', label: 'Association', type: 'text' as const, placeholder: 'e.g., Personal, Work, School' },
  { name: 'dates', label: 'Dates', type: 'text' as const, placeholder: 'e.g., Jan 2020 - Mar 2020' },
  { name: 'skillsUsed', label: 'Skills Used', type: 'text' as const, placeholder: 'e.g., React, Node.js, MongoDB' },
  { name: 'roleDescription', label: 'Role Description', type: 'textarea' as const, placeholder: 'Describe your role and contributions.' },
  { name: 'link', label: 'Link (Optional)', type: 'text' as const, placeholder: 'e.g., https://github.com/yourproject' },
];

const getSkillColor = (category: string | undefined): string => {
  switch (category?.toLowerCase()) {
    // Core Development
    case 'programming language': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'web technology': return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200';
    case 'web framework': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
    case 'database': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'state management': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
    
    // DevOps & Infrastructure
    case 'cloud platform': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'devops': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    case 'version control': return 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    case 'ci/cd': return 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200';
    
    // Testing & Quality
    case 'testing': return 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200';

    // Data Science & Machine Learning
    case 'data science': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'machine learning': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    case 'data analysis': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'artificial intelligence': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white dark:from-purple-600 dark:to-pink-600';
    
    // Design & UI/UX
    case 'styling / css': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
    case 'design tool': return 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200';
    
    // Professional & Soft Skills
    case 'soft skill': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    case 'communication': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'project management tool': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
    case 'agile methodology': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';

    // General
    case 'software': return 'bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const allCategories = [
  "Programming Language", "Web Technology", "Web Framework", "Database", "State Management",
  "Cloud Platform", "DevOps", "Version Control", "CI/CD",
  "Testing",
  "Data Science", "Machine Learning", "Data Analysis", "Artificial Intelligence",
  "Styling / CSS", "Design Tool",
  "Soft Skill", "Communication", "Project Management Tool", "Agile Methodology",
  "Software", "Game Development", "Robotics"
].sort();

const skillMigrationMap: { [key: string]: string } = {
  // Game Development
  'unity': 'Game Development',
  'unreal engine': 'Game Development',
  'c#': 'Programming Language', // Often for Unity
  'c++': 'Programming Language', // Often for Unreal

  // Robotics
  'ros': 'Robotics',
  'robotics operating system': 'Robotics',
  'robotics': 'Robotics',
  'computer vision': 'Machine Learning', // Often related to Robotics
  'slam': 'Robotics',
};

const SkillsSection = ({ 
  skills, 
  newSkill, 
  setNewSkill, 
  handleAddSkill, 
  removeSkill,
  usedSkillNames,
  onSkillClick,
  isAddingSkill,
  showAIInput,
  onToggleAI,
  onAISuccess
}: {
  skills: SkillEntry[];
  newSkill: string;
  setNewSkill: (value: string) => void;
  handleAddSkill: () => void;
  removeSkill: (id: string) => void;
  usedSkillNames: Set<string>;
  onSkillClick: (skill: SkillEntry) => void;
  isAddingSkill: boolean;
  showAIInput: boolean;
  onToggleAI: () => void;
  onAISuccess: (data: any) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleSkills = isExpanded ? skills : skills.slice(0, 10);

  return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline">
            <SparklesIcon className="mr-2 h-6 w-6 text-primary" />
            Skills
          </CardTitle>
        </CardHeader>
              <CardContent>
        <div className="mb-4 space-y-4">
          {!showAIInput ? (
            <>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g., Python, Project Management"
                  className="flex-grow"
                  onKeyPress={(e) => { if (e.key === 'Enter') { handleAddSkill(); e.preventDefault(); }}}
                />
                <Button onClick={handleAddSkill} disabled={isAddingSkill}>Add Skill</Button>
              </div>
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={onToggleAI}
                  className="text-primary border-primary hover:bg-primary/10"
                >
                  <SparklesIcon className="mr-2 h-4 w-4" />
                  Use AI to Add Multiple Skills
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <AITextInput
                type="skills"
                onSuccess={onAISuccess}
              />
              <div className="text-center">
                <Button variant="ghost" onClick={onToggleAI}>
                  Cancel AI Input
                </Button>
              </div>
            </div>
          )}
        </div>
          {skills.length === 0 ? (
           <p className="text-muted-foreground">No skills added yet.</p>
          ) : (
          <div>
            <div className="flex flex-wrap gap-2">
              {visibleSkills.map(skill => {
                const isUsed = usedSkillNames.has(skill.name.toLowerCase());
                return (
                  <Badge 
                    key={skill.id} 
                    className={`flex items-center text-sm font-medium transition-all hover:brightness-110 cursor-pointer ${getSkillColor(skill.category)}`}
                    onClick={() => onSkillClick(skill)}
                  >
                    {isUsed && <Link2Icon className="h-3 w-3 mr-1.5" />}
                  {skill.name}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSkill(skill.id);
                      }}
                      className="ml-2 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold hover:bg-black/10 dark:hover:bg-white/20"
                      aria-label={`Remove ${skill.name} skill`}
                    >
                      &#x2715;
                    </button>
                  </Badge>
                );
              })}
            </div>
            {skills.length > 10 && (
              <Button variant="link" onClick={() => setIsExpanded(!isExpanded)} className="p-0 h-auto mt-2">
                {isExpanded ? 'Show Less' : `Show ${skills.length - 10} More...`}
              </Button>
            )}
            </div>
          )}
        </CardContent>
      </Card>
  );
};

export function ProfileTabContent() {
  const { 
    employmentHistory, addEmploymentEntry, updateEmploymentEntry, removeEmploymentEntry,
    skills, addSkill, updateSkill, removeSkill,
    projects, addProjectEntry, updateProjectEntry, removeProjectEntry,
    personalDetails, setPersonalDetails,
    toggleSkillAssociationForJob,
    toggleSkillAssociationForProject
  } = useUserProfileStore();

  useEffect(() => {
    const uncategorizedSkills = skills.filter(s => !s.category);
    if (uncategorizedSkills.length > 0) {
      console.log(`Found ${uncategorizedSkills.length} uncategorized skills. Attempting to categorize...`);
      uncategorizedSkills.forEach(skill => {
        const newCategory = skillMigrationMap[skill.name.toLowerCase()];
        if (newCategory) {
          console.log(`MIGRATING '${skill.name}' to category: ${newCategory}`);
          updateSkill(skill.id, { category: newCategory });
        }
      });
    }
  }, [skills, updateSkill]);

  const [newSkill, setNewSkill] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillEntry | null>(null);
  const [isSkillDetailOpen, setIsSkillDetailOpen] = useState(false);
  
  // Delete confirmation states
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'employment' | 'project' | null;
    id: string | null;
    title: string;
  }>({
    isOpen: false,
    type: null,
    id: null,
    title: ''
  });

  // AI input states
  const [showAIInput, setShowAIInput] = useState<{
    employment: boolean;
    project: boolean;
    skills: boolean;
  }>({
    employment: false,
    project: false,
    skills: false
  });

  const usedSkillNames = useMemo(() => {
    const fromEmployment = employmentHistory.flatMap(job => job.skillsDemonstrated || []);
    const fromProjects = projects.flatMap(proj => proj.skillsUsed || []);
    return new Set([...fromEmployment, ...fromProjects].map(s => s.toLowerCase()));
  }, [employmentHistory, projects]);

  const skillAssociations = useMemo(() => {
    const associations = new Map<string, { employment: EmploymentEntry[], projects: ProjectEntry[] }>();
    skills.forEach(skill => {
      const lowerCaseSkillName = skill.name.toLowerCase();
      const associatedEmployment = employmentHistory.filter(job =>
        job.skillsDemonstrated?.some(s => s.toLowerCase() === lowerCaseSkillName)
      );
      const associatedProjects = projects.filter(proj =>
        proj.skillsUsed?.some(s => s.toLowerCase() === lowerCaseSkillName)
      );

      if (associatedEmployment.length > 0 || associatedProjects.length > 0) {
        associations.set(skill.name, {
          employment: associatedEmployment,
          projects: associatedProjects,
        });
      }
    });
    return associations;
  }, [skills, employmentHistory, projects]);
  
  const handleAddSkill = useCallback(async () => {
    const trimmedName = newSkill.trim();
    if (!trimmedName || skills.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast({
        variant: "destructive",
        title: "Invalid Skill",
        description: trimmedName ? "This skill already exists." : "Please enter a skill name.",
      });
      return;
    }
    
    setIsAddingSkill(true);
    try {
      const { category, isNew } = await categorizeSkill(trimmedName, allCategories);
      
      let finalCategory = category;
      if (isNew && !allCategories.includes(category)) {
        // In a real app, you might want a review step for new categories.
        // For now, we'll just accept it.
        console.log(`New category suggested and accepted: ${category}`);
      }

      await addSkill({ name: trimmedName, category: finalCategory });
      setNewSkill('');
      toast({
        title: "Skill Added",
        description: `'${trimmedName}' was added with category: ${finalCategory}.`,
      });
    } catch (error) {
      console.error("Failed to categorize and add skill:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not add skill." });
    } finally {
      setIsAddingSkill(false);
    }
  }, [newSkill, skills, addSkill]);

  const handleSkillClick = (skillName: string) => {
    const skill = skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    if (skill) {
      setSelectedSkill(skill);
      setIsSkillDetailOpen(true);
    }
  };
  
  // Updated skill category handler that refreshes the selected skill
  const handleUpdateSkillCategory = async (skillId: string, newCategory: string) => {
    await updateSkill(skillId, { category: newCategory });
    
    // Update the selected skill state to reflect the change immediately
    if (selectedSkill && selectedSkill.id === skillId) {
      setSelectedSkill(prev => prev ? { ...prev, category: newCategory } : null);
    }
  };

  // Confirmation handlers
  const handleDeleteConfirmation = (type: 'employment' | 'project', id: string, title: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type,
      id,
      title
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.type === 'employment' && deleteConfirmation.id) {
      await removeEmploymentEntry(deleteConfirmation.id);
      toast({
        title: "Employment Deleted",
        description: `"${deleteConfirmation.title}" has been removed from your profile.`,
      });
    } else if (deleteConfirmation.type === 'project' && deleteConfirmation.id) {
      await removeProjectEntry(deleteConfirmation.id);
      toast({
        title: "Project Deleted", 
        description: `"${deleteConfirmation.title}" has been removed from your profile.`,
      });
    }
    
    setDeleteConfirmation({
      isOpen: false,
      type: null,
      id: null,
      title: ''
    });
  };

  // AI input handlers
  const toggleAIInput = (type: 'employment' | 'project' | 'skills') => {
    setShowAIInput(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleAIEmploymentSuccess = async (data: any) => {
    const employmentData = {
      title: data.jobTitle || '',
      company: data.company || '',
      dates: data.employmentDates || '',
      description: data.jobDescription || '',
      jobSummary: data.jobSummary || '',
      skillsDemonstrated: data.skillsDemonstrated || []
    };
    
    await addEmploymentEntry(employmentData);
    setShowAIInput(prev => ({ ...prev, employment: false }));
    toast({
      title: "Employment Added",
      description: `${employmentData.title} at ${employmentData.company} has been added to your profile.`,
    });
  };

  const handleAIProjectSuccess = async (data: any) => {
    const projectData = {
      name: data.projectName || '',
      association: data.projectAssociation || '',
      dates: data.projectDates || '',
      skillsUsed: data.projectSkillsUsed || [],
      roleDescription: data.projectRoleDescription || '',
      link: data.projectLink || undefined
    };
    
    await addProjectEntry(projectData);
    setShowAIInput(prev => ({ ...prev, project: false }));
    toast({
      title: "Project Added",
      description: `${projectData.name} has been added to your profile.`,
    });
  };

  const handleAISkillsSuccess = async (data: any) => {
    if (data.skills && Array.isArray(data.skills)) {
      const promises = data.skills.map((skill: any) => 
        addSkill({ name: skill.name, category: skill.category })
      );
      await Promise.all(promises);
      setShowAIInput(prev => ({ ...prev, skills: false }));
      toast({
        title: "Skills Added",
        description: `${data.skills.length} skills have been added to your profile.`,
      });
    }
  };

  const renderEmploymentItem = (item: EmploymentEntry, onEdit: () => void, onRemove: () => void) => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={item.id} className="border-b-0">
        <AccordionTrigger className="flex justify-between hover:no-underline">
          <div className="text-left">
            <h4 className="font-semibold text-md">{item.title}</h4>
            <p className="text-sm text-muted-foreground">{item.company} | {item.dates}</p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-4 bg-secondary/30 rounded-md">
          <p className="text-sm mt-1 whitespace-pre-wrap">{item.description}</p>
          {item.skillsDemonstrated && item.skillsDemonstrated.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.skillsDemonstrated.map(skillName => {
                const skill = skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
                return (
                  <Badge
                    key={skillName}
                    className={`flex items-center text-xs font-medium transition-all hover:brightness-110 cursor-pointer ${getSkillColor(skill?.category)}`}
                    onClick={() => handleSkillClick(skillName)}
                  >
                    {skillName}
                  </Badge>
                );
              })}
            </div>
          )}
          <div className="flex justify-end space-x-1 mt-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onEdit} 
              aria-label="Edit employment"
              className="hover:text-primary"
            >
              <EditIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDeleteConfirmation('employment', item.id, `${item.title} at ${item.company}`)}
              aria-label="Delete employment"
              className="hover:text-destructive"
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  const renderProjectItem = (item: ProjectEntry, onEdit: () => void, onRemove: () => void) => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={item.id} className="border-b-0">
        <AccordionTrigger className="flex justify-between hover:no-underline">
          <div className="text-left">
            <h4 className="font-semibold text-md">{item.name}</h4>
            <p className="text-sm text-muted-foreground">{item.association} | {item.dates}</p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-4 bg-secondary/30 rounded-md">
           <p className="text-sm mt-1 whitespace-pre-wrap">{item.roleDescription}</p>
           {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">{item.link}</a>}
           {item.skillsUsed && item.skillsUsed.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.skillsUsed.map(skillName => {
                const skill = skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
                return (
                  <Badge
                    key={skillName}
                    className={`flex items-center text-xs font-medium transition-all hover:brightness-110 cursor-pointer ${getSkillColor(skill?.category)}`}
                    onClick={() => handleSkillClick(skillName)}
                  >
                    {skillName}
                  </Badge>
                );
              })}
            </div>
           )}
           <div className="flex justify-end space-x-1 mt-2">
             <Button 
               variant="ghost" 
               size="icon" 
               onClick={onEdit} 
               aria-label="Edit project"
               className="hover:text-primary"
             >
               <EditIcon className="h-4 w-4" />
             </Button>
             <Button 
               variant="ghost" 
               size="icon" 
               onClick={() => handleDeleteConfirmation('project', item.id, item.name)}
               aria-label="Delete project"
               className="hover:text-destructive"
             >
               <Trash2Icon className="h-4 w-4" />
             </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Build your professional profile. This information will be used by the AI to generate tailored resumes and cover letters.
      </p>
      
      <PersonalDetailsForm />

      <Accordion type="multiple" defaultValue={['item-1']} className="w-full space-y-4">
        <AccordionItem value="item-1" className="border rounded-lg shadow-sm">
          <AccordionTrigger className="text-lg font-semibold data-[state=open]:text-primary hover:no-underline px-4">
            <div className="flex items-center">
              <BriefcaseIcon className="mr-2 h-5 w-5" /> Employment History
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-2">
            <div className="space-y-4">
              {showAIInput.employment && (
                <div className="space-y-4">
                  <AITextInput
                    type="employment"
                    onSuccess={handleAIEmploymentSuccess}
                  />
                  <div className="text-center">
                    <Button variant="ghost" onClick={() => toggleAIInput('employment')}>
                      Cancel AI Input
                    </Button>
                  </div>
                </div>
              )}
              
              {!showAIInput.employment && (
                <div className="text-center mb-4">
                  <Button 
                    variant="outline" 
                    onClick={() => toggleAIInput('employment')}
                    className="text-primary border-primary hover:bg-primary/10"
                  >
                    <SparklesIcon className="mr-2 h-4 w-4" />
                    Add Work Experience with AI
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Or use the manual form below
                  </p>
                </div>
              )}
              
              <EditableList<EmploymentEntry>
                title=""
                items={employmentHistory}
                fields={employmentFields}
                onAddItem={addEmploymentEntry}
                onUpdateItem={updateEmploymentEntry}
                onRemoveItem={removeEmploymentEntry}
                renderItem={renderEmploymentItem}
                itemToString={(item) => `${item.title} at ${item.company}`}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="border rounded-lg shadow-sm">
           <AccordionTrigger className="text-lg font-semibold data-[state=open]:text-primary hover:no-underline px-4">
            <div className="flex items-center">
              <SparklesIcon className="mr-2 h-5 w-5" /> Skills
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <SkillsSection 
              skills={skills}
              newSkill={newSkill}
              setNewSkill={setNewSkill}
              handleAddSkill={handleAddSkill}
              removeSkill={removeSkill}
              usedSkillNames={usedSkillNames}
              onSkillClick={(skill) => handleSkillClick(skill.name)}
              isAddingSkill={isAddingSkill}
              showAIInput={showAIInput.skills}
              onToggleAI={() => toggleAIInput('skills')}
              onAISuccess={handleAISkillsSuccess}
            />
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3" className="border rounded-lg shadow-sm">
          <AccordionTrigger className="text-lg font-semibold data-[state=open]:text-primary hover:no-underline px-4">
            <div className="flex items-center">
              <LightbulbIcon className="mr-2 h-5 w-5" /> Projects
            </div>
          </AccordionTrigger>
                    <AccordionContent>
            <div className="space-y-4">
              {showAIInput.project && (
                <div className="space-y-4">
                  <AITextInput
                    type="project"
                    onSuccess={handleAIProjectSuccess}
                  />
                  <div className="text-center">
                    <Button variant="ghost" onClick={() => toggleAIInput('project')}>
                      Cancel AI Input
                    </Button>
                  </div>
                </div>
              )}
              
              {!showAIInput.project && (
                <div className="text-center mb-4">
                  <Button 
                    variant="outline" 
                    onClick={() => toggleAIInput('project')}
                    className="text-primary border-primary hover:bg-primary/10"
                  >
                    <SparklesIcon className="mr-2 h-4 w-4" />
                    Add Project with AI
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Or use the manual form below
                  </p>
                </div>
              )}
              
              <EditableList<ProjectEntry>
                title=""
                items={projects}
                fields={projectFields}
                onAddItem={addProjectEntry}
                onUpdateItem={updateProjectEntry}
                onRemoveItem={removeProjectEntry}
                renderItem={renderProjectItem}
                itemToString={(item) => item.name}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4" className="border rounded-lg shadow-sm">
          <AccordionTrigger className="text-lg font-semibold data-[state=open]:text-primary hover:no-underline px-4">
            <div className="flex items-center">
              <UserCircle2Icon className="mr-2 h-5 w-5" /> AI Background Builder
            </div>
          </AccordionTrigger>
          <AccordionContent>
             <BackgroundBuilder />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <SkillDetailsDialog
        isOpen={isSkillDetailOpen}
        onOpenChange={setIsSkillDetailOpen}
        skill={selectedSkill}
        allEmployment={employmentHistory}
        allProjects={projects}
        onToggleJobAssociation={toggleSkillAssociationForJob}
        onToggleProjectAssociation={toggleSkillAssociationForProject}
        onUpdateSkillCategory={handleUpdateSkillCategory}
        allCategories={allCategories}
      />

      <AlertDialog open={deleteConfirmation.isOpen} onOpenChange={(open) => !open && setDeleteConfirmation({ isOpen: false, type: null, id: null, title: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmation.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
