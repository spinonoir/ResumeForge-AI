// API contract types for communication between Next.js and Python service
// These types are the canonical source of truth for the API contracts.

export type EmploymentHistory = Array<{
  title: string;
  company: string;
  dates: string;
  description: string;
}>;

export type Skills = string[];

export type Projects = Array<{
  name: string;
  association: string;
  dates: string;
  skillsUsed: string[];
  roleDescription: string;
  link?: string;
}>;

export interface ScoreRequest {
  resumeText: string;
  jobDescription: string;
  userProfile: {
    employmentHistory: EmploymentHistory;
    skills: Skills;
    projects: Projects;
    backgroundInformation: string;
  };
}

export interface ScoreResponse {
  overallScore: number;
  breakdown: {
    skillsMatch: number;
    experienceRelevance: number;
    culturalFit: number;
    growthPotential: number;
  };
  recommendations: Recommendation[];
  analysis: {
    missingSkills: string[];
    strongMatches: string[];
    suggestionsCount: number;
  };
}

export interface Recommendation {
  type: 'skill_addition' | 'experience_reframe' | 'presentation_improvement';
  title: string;
  description: string;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
}

// Personal details type for resume generation
export interface PersonalDetails {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  socialMediaLinks?: Array<{
    id?: string;
    platform: string;
    url: string;
  }>;
}

// Education history type
export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  dates: string;
  gpa?: string;
  accomplishments?: string;
}

export type EducationHistory = EducationEntry[];

// Resume generation types (based on your existing AI flows)
export interface GenerateResumeRequest {
  jobDescription: string;
  personalDetails?: PersonalDetails;
  educationHistory?: EducationHistory;
  employmentHistory: EmploymentHistory;
  skills: Skills;
  projects: Projects;
  backgroundInformation: string;
  resumeTemplate?: 'regular' | 'compact' | 'ultraCompact';
  accentColor?: string;
  pageLimit?: number;
}

export interface GenerateResumeResponse {
  resume: string;
  summary: string;
  coverLetter: string;
  matchAnalysis: string;
  selectionRationale: string;
  resumeMarkdown?: string;
  jobTitleFromJD?: string;
  companyNameFromJD?: string;
}

// Cover letter generation
export interface GenerateCoverLetterRequest {
  jobDescription: string;
  userBackground: string;
  companyInformation?: string;
}

export interface GenerateCoverLetterResponse {
  coverLetter: string;
}

// Background information building types
export interface BackgroundInformationInput {
  question: string;
  previousAnswers?: string[];
  accumulatedBackground?: string;
}

export interface BackgroundInformationOutput {
  nextQuestion: string;
  updatedBackground: string;
  isDone: boolean;
}

// Employment text parsing types
export interface ParseEmploymentTextInput {
  textBlock: string;
}

export interface ParseEmploymentTextOutput {
  jobTitle: string;
  company: string;
  employmentDates: string;
  jobDescription: string;
  jobSummary: string;
  skillsDemonstrated: string[];
}

// Skills parsing types
export interface ParseSkillsInput {
  textBlock: string;
}

export interface SkillDetail {
  name: string;
  category: string;
}

export interface ParseSkillsOutput {
  skills: SkillDetail[];
}

// Project text parsing types
export interface ParseProjectTextInput {
  textBlock: string;
}

export interface ParseProjectTextOutput {
  projectName: string;
  projectAssociation: string;
  projectDates: string;
  projectSkillsUsed: string[];
  projectRoleDescription: string;
  projectLink?: string;
}
