
import type { EmploymentHistory as AIEmpHistory, Skills as AISkills, Projects as AIProjects } from '@/ai/flows/resume-generator';

export type EmploymentEntry = {
  id: string;
  title: string;
  company: string;
  dates: string;
  description: string;
  jobSummary?: string; 
};

export type SkillEntry = {
  id: string;
  name: string;
  category?: string; 
};

export type ProjectEntry = {
  id: string;
  name: string;
  association: string; // e.g., school, personal, work
  dates: string; // e.g., Jan 2023 - Mar 2023
  skillsUsed: string[]; // List of skills utilized in the project
  roleDescription: string; // Detailed description of user's role, contributions, duties
  link?: string;
};

// Re-export AI types if they are directly usable or map to them
export type EmploymentHistory = AIEmpHistory;
export type Skills = AISkills; // This is string[]
export type Projects = AIProjects; // Will be updated in resume-generator.ts to match new ProjectEntry richness


export interface SavedApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  generatedResumeLatex: string;
  generatedCoverLetter: string;
  generatedSummary: string;
  matchAnalysis: string;
  createdAt: string; 
}

