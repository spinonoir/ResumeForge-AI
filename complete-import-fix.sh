#!/bin/bash

echo "🔧 Complete AI import fix..."

# More aggressive approach - remove ALL AI imports from ALL files
echo "📋 Removing all remaining AI imports..."

# Find all TypeScript files and remove any lines containing AI imports
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i.bak '/import.*@\/ai\/flows/d'

echo "✅ Removed all AI imports"

# Now let's specifically fix the ProfileTabContent.tsx file that has multiple AI imports
echo "🔧 Fixing ProfileTabContent.tsx specifically..."

cat > temp-profile-fix.tsx << 'EOF'
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
import { scoringService } from '@/lib/scoring-service';

const employmentFields = [
  { name: 'title', label: 'Job Title', type: 'text' as const, placeholder: 'e.g., Software Engineer' },
  { name: 'company', label: 'Company', type: 'text' as const, placeholder: 'e.g., Tech Solutions Inc.' },
  { name: 'dates', label: 'Dates', type: 'text' as const, placeholder: 'e.g., Jan 2020 - Present' },
  { name: 'description', label: 'Description', type: 'textarea' as const, placeholder: 'Briefly describe your responsibilities and achievements.' },
];

const projectFields = [
  { name: 'name', label: 'Project Name', type: 'text' as const, placeholder: 'e.g., Personal Portfolio Website' },
  { name: 'association', label: 'Association', type: 'text' as const, placeholder: 'e.g., Personal, Work, School' },
  { name: 'dates', label: 'Dates', type: 'text' as const, placeholder: 'e.g., Jan 2020 - Mar 2020' },
  { name: 'skillsUsed', label: 'Skills Used', type: 'text' as const, placeholder: 'e.g., React, Node.js, MongoDB' },
  { name: 'roleDescription', label: 'Role Description', type: 'textarea' as const, placeholder: 'Describe your role and contributions.' },
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
            <UserCircle2Icon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove employment">
            <BriefcaseIcon className="h-4 w-4" />
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
          <p className="text-sm text-muted-foreground">{item.association} | {item.dates}</p>
          {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{item.link}</a>}
        </div>
        <div className="space-x-1 flex-shrink-0">
           <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit project">
            <UserCircle2Icon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove project">
            <BriefcaseIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-sm mt-1 whitespace-pre-wrap">{item.roleDescription}</p>
      <p className="text-xs text-muted-foreground mt-1">Skills: {Array.isArray(item.skillsUsed) ? item.skillsUsed.join(', ') : item.skillsUsed}</p>
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
                    <UserCircle2Icon className="h-3 w-3" />
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
EOF

# Replace the ProfileTabContent.tsx with our fixed version
cp temp-profile-fix.tsx src/components/tabs/ProfileTabContent.tsx
rm temp-profile-fix.tsx

echo "✅ Fixed ProfileTabContent.tsx"

# Now update the scoring service to include all the missing functions
echo "🔧 Updating scoring service with all AI functions..."

cat > src/lib/scoring-service.ts << 'EOF'
import type { 
  ScoreRequest, 
  ScoreResponse, 
  GenerateResumeRequest,
  GenerateResumeResponse,
  GenerateCoverLetterRequest,
  GenerateCoverLetterResponse
} from '../../services/shared/types';

export class ScoringService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SCORING_SERVICE_URL || 'http://localhost:8001';
  }

  async scoreResume(request: ScoreRequest): Promise<ScoreResponse> {
    const response = await fetch(`${this.baseUrl}/score-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Scoring service error: ${response.statusText}`);
    }

    return response.json();
  }

  async generateResume(request: GenerateResumeRequest): Promise<GenerateResumeResponse> {
    const response = await fetch(`${this.baseUrl}/generate-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Resume generation error: ${response.statusText}`);
    }

    return response.json();
  }

  async generateCoverLetter(request: GenerateCoverLetterRequest): Promise<GenerateCoverLetterResponse> {
    const response = await fetch(`${this.baseUrl}/generate-cover-letter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Cover letter generation error: ${response.statusText}`);
    }

    return response.json();
  }

  async buildBackgroundInformation(input: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/build-background`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Background building error: ${response.statusText}`);
    }

    return response.json();
  }

  async parseEmploymentText(input: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/parse-employment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Employment parsing error: ${response.statusText}`);
    }

    return response.json();
  }

  async parseAndCategorizeSkills(input: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/parse-skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Skills parsing error: ${response.statusText}`);
    }

    return response.json();
  }

  async parseProjectText(input: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/parse-project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Project parsing error: ${response.statusText}`);
    }

    return response.json();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const scoringService = new ScoringService();

// Export individual functions for backwards compatibility
export const generateResume = (input: any) => scoringService.generateResume(input);
export const generateCoverLetter = (input: any) => scoringService.generateCoverLetter(input);
export const buildBackgroundInformation = (input: any) => scoringService.buildBackgroundInformation(input);
export const parseEmploymentText = (input: any) => scoringService.parseEmploymentText(input);
export const parseAndCategorizeSkills = (input: any) => scoringService.parseAndCategorizeSkills(input);
export const parseProjectText = (input: any) => scoringService.parseProjectText(input);

// For backwards compatibility with any existing function names
export const refineCoverLetterFlow = generateCoverLetter;
EOF

echo "✅ Updated scoring service"

# Clean up all backup files
echo "🧹 Cleaning up backup files..."
find src/ -name "*.bak" -delete

# Test build
echo "🧪 Testing build..."
if npm run build > final-build-test.log 2>&1; then
    echo "✅ Build successful!"
    rm final-build-test.log
else
    echo "❌ Build still failing. Checking errors..."
    echo ""
    grep "Module not found\|Cannot find" final-build-test.log | head -10
    echo ""
    echo "Full log in final-build-test.log"
fi

echo ""
echo "✅ Complete import fix finished!"
echo ""
echo "Summary of changes:"
echo "- 🔧 Removed ALL AI imports from ALL files"
echo "- 📄 Completely rewrote ProfileTabContent.tsx to remove AI dependencies"
echo "- 📦 Enhanced scoring service with all missing AI functions"
echo "- 🧹 Cleaned up backup files"
echo ""
echo "Next steps:"
echo "1. If build passes: Ready for Issue #1 (Python FastAPI service)!"
echo "2. If build fails: Check final-build-test.log for remaining issues"