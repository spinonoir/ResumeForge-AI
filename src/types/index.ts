
import type { EmploymentHistory as AIEmpHistory, Skills as AISkills, Projects as AIProjects } from '@/ai/flows/resume-generator';

export type EmploymentEntry = {
  id: string;
  title: string;
  company: string;
  dates: string;
  description: string;
  jobSummary?: string; 
  skillsDemonstrated?: string[];
};

export type SkillEntry = {
  id: string;
  name: string;
  category?: string; 
};

export type ProjectEntry = {
  id: string;
  name: string;
  association: string; 
  dates: string; 
  skillsUsed: string[]; 
  roleDescription: string; 
  link?: string;
};

export type EmploymentHistory = AIEmpHistory;
export type Skills = AISkills; 
export type Projects = AIProjects;


export interface SavedApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  generatedResumeLatex: string;
  generatedResumeMarkdown: string;
  generatedCoverLetter: string;
  generatedSummary: string;
  matchAnalysis: string;
  createdAt: string; 
}

export interface SocialMediaLink {
  id: string;
  platform: string;
  url: string;
}

export interface PersonalDetails {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  socialMediaLinks?: SocialMediaLink[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  dates: string; 
  gpa?: string;
  accomplishments?: string;
}

