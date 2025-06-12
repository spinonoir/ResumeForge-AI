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

// Resume generation types (based on your existing AI flows)
export interface GenerateResumeRequest {
  jobDescription: string;
  employmentHistory: EmploymentHistory;
  skills: Skills;
  projects: Projects;
  backgroundInformation: string;
}

export interface GenerateResumeResponse {
  resume: string;
  summary: string;
  coverLetter: string;
  matchAnalysis: string;
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
