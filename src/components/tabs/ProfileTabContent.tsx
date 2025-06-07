"use client";

import React, { useState } from 'react';
import { useUserProfileStore } from '@/lib/store';
import type { EmploymentEntry, ProjectEntry } from '@/types';
import { EditableList } from '@/components/EditableList';
import { BackgroundBuilder } from '@/components/profile/BackgroundBuilder';
import { BriefcaseIcon, LightbulbIcon, SparklesIcon, UserCircle2Icon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const employmentFields = [
  { name: 'title', label: 'Job Title', type: 'text' as const, placeholder: 'e.g., Software Engineer' },
  { name: 'company', label: 'Company', type: 'text' as const, placeholder: 'e.g., Tech Solutions Inc.' },
  { name: 'dates', label: 'Dates', type: 'text' as const, placeholder: 'e.g., Jan 2020 - Present' },
  { name: 'description', label: 'Description', type: 'textarea' as const, placeholder: 'Briefly describe your responsibilities and achievements.' },
];

const projectFields = [
  { name: 'name', label: 'Project Name', type: 'text' as const, placeholder: 'e.g., Personal Portfolio Website' },
  { name: 'description', label: 'Description', type: 'textarea' as const, placeholder: 'Describe the project and your role.' },
  { name: 'link', label: 'Link (Optional)', type: 'text' as const, placeholder: 'e.g., https://github.com/yourproject' },
];

export function ProfileTabContent() {
  const { 
    employmentHistory, addEmploymentEntry, updateEmploymentEntry, removeEmploymentEntry,
    skills, addSkill, removeSkill,
    projects, addProjectEntry, updateProjectEntry, removeProjectEntry
  } = useUserProfileStore();

  const [newSkill, setNewSkill] = useState('');

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
        <div className="space-x-1 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit employment">
            <UserCircle2Icon className="h-4 w-4" /> {/* Placeholder, using Edit2Icon in EditableList */}
          </Button>
          <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove employment">
            <BriefcaseIcon className="h-4 w-4" /> {/* Placeholder, using Trash2Icon in EditableList */}
          </Button>
        </div>
      </div>
      <p className="text-sm mt-1 whitespace-pre-wrap">{item.description}</p>
    </div>
  );

  const renderProjectItem = (item: ProjectEntry, onEdit: () => void, onRemove: () => void) => (
     <div>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-md">{item.name}</h4>
          {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{item.link}</a>}
        </div>
        <div className="space-x-1 flex-shrink-0">
           <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit project">
            <UserCircle2Icon className="h-4 w-4" /> {/* Placeholder */}
          </Button>
          <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove project">
            <BriefcaseIcon className="h-4 w-4" /> {/* Placeholder */}
          </Button>
        </div>
      </div>
      <p className="text-sm mt-1 whitespace-pre-wrap">{item.description}</p>
    </div>
  );


  return (
    <div className="space-y-8">
      <p className="text-muted-foreground">
        Build your professional profile. This information will be used by the AI to generate tailored resumes and cover letters.
      </p>
      
      <EditableList<EmploymentEntry>
        title="Employment History"
        items={employmentHistory}
        fields={employmentFields}
        onAddItem={addEmploymentEntry}
        onUpdateItem={updateEmploymentEntry}
        onRemoveItem={removeEmploymentEntry}
        renderItem={renderEmploymentItem}
        itemToString={(item) => `${item.title} at ${item.company}`}
        icon={<BriefcaseIcon className="h-6 w-6 text-primary" />}
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
             <p className="text-muted-foreground">No skills added yet. Type a skill and click &quot;Add Skill&quot;.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill.id} className="flex items-center bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm">
                  {skill.name}
                  <Button variant="ghost" size="icon" className="ml-1 h-5 w-5 hover:bg-accent/80" onClick={() => removeSkill(skill.id)}>
                    <UserCircle2Icon className="h-3 w-3" /> {/* Placeholder, should be XIcon */}
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
    </div>
  );
}
