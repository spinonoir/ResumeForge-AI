"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { EmploymentEntry, ProjectEntry, SkillEntry } from '@/types';
import { BriefcaseIcon, LightbulbIcon, PlusCircle, CheckCircle, PlusCircleIcon } from 'lucide-react';
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SkillDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  skill: SkillEntry | null;
  allEmployment: EmploymentEntry[];
  allProjects: ProjectEntry[];
  onToggleJobAssociation: (jobId: string, skillName: string) => void;
  onToggleProjectAssociation: (projectId: string, skillName: string) => void;
  onUpdateSkillCategory: (skillId: string, newCategory: string) => void;
  allCategories: string[];
}

export function SkillDetailsDialog({
  isOpen,
  onOpenChange,
  skill,
  allEmployment,
  allProjects,
  onToggleJobAssociation,
  onToggleProjectAssociation,
  onUpdateSkillCategory,
  allCategories
}: SkillDetailsDialogProps) {
  if (!skill) return null;

  const handleAddNewCategory = () => {
    const newCategory = prompt("Enter the name for the new category:");
    if (newCategory && newCategory.trim()) {
      onUpdateSkillCategory(skill.id, newCategory.trim());
    }
  };

  const isJobAssociated = (job: EmploymentEntry) =>
    job.skillsDemonstrated?.some(s => s.toLowerCase() === skill.name.toLowerCase());

  const isProjectAssociated = (project: ProjectEntry) =>
    project.skillsUsed?.some(s => s.toLowerCase() === skill.name.toLowerCase());

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">'{skill.name}' Associations</DialogTitle>
          <DialogDescription>
            Click to associate or disassociate this skill with your experiences.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2">
            <span className="font-semibold">Category:</span>
            <Select
              value={skill.category}
              onValueChange={(newCategory) => onUpdateSkillCategory(skill.id, newCategory)}
            >
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
                {!allCategories.includes(skill.category || '') && skill.category && (
                  <SelectItem value={skill.category}>
                    {skill.category} (Suggested)
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={handleAddNewCategory} title="Add new category">
              <PlusCircleIcon className="h-5 w-5" />
            </Button>
          </div>

        <ScrollArea className="max-h-[50vh] pr-6 -mr-6">
          <div className="grid gap-6 py-4">
            {allEmployment.length > 0 && (
              <div>
                <h3 className="flex items-center font-semibold mb-2 text-lg">
                  <BriefcaseIcon className="mr-2 h-5 w-5 text-primary" />
                  Work Experience
                </h3>
                <ul className="space-y-2">
                  {allEmployment.map((job) => (
                    <li key={job.id}>
                      <Button
                        variant={isJobAssociated(job) ? "secondary" : "outline"}
                        className="w-full justify-start text-left h-auto"
                        onClick={() => onToggleJobAssociation(job.id, skill.name)}
                      >
                        {isJobAssociated(job) ? (
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                        ) : (
                          <PlusCircle className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold">{job.title}</p>
                          <p className="text-muted-foreground text-xs">at {job.company}</p>
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {allProjects.length > 0 && (
              <div>
                <h3 className="flex items-center font-semibold mb-2 text-lg">
                  <LightbulbIcon className="mr-2 h-5 w-5 text-primary" />
                  Projects
                </h3>
                <ul className="space-y-2">
                  {allProjects.map((project) => (
                     <li key={project.id}>
                      <Button
                        variant={isProjectAssociated(project) ? "secondary" : "outline"}
                        className="w-full justify-start text-left h-auto"
                        onClick={() => onToggleProjectAssociation(project.id, skill.name)}
                      >
                        {isProjectAssociated(project) ? (
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                        ) : (
                          <PlusCircle className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                        )}
                        <div>
                           <p className="font-semibold">{project.name}</p>
                           <p className="text-muted-foreground text-xs">({project.association})</p>
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 