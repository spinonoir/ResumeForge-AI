import type { EmploymentHistory as AIEmpHistory, Skills as AISkills, Projects as AIProjects } from '@/ai/flows/resume-generator';

export type EmploymentEntry = {
  id: string;
  title: string;
  company: string;
  dates: string;
  description: string;
  jobSummary?: string; // Added job summary
};

export type SkillEntry = {
  id: string;
  name: string;
};

export type ProjectEntry = {
  id: string;
  name: string;
  description: string;
  link?: string;
};

// Re-export AI types if they are directly usable or map to them
export type EmploymentHistory = AIEmpHistory;
export type Skills = AISkills; // This is string[]
export type Projects = AIProjects;


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

