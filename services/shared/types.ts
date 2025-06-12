// API contract types for communication between Next.js and Python service

// Import the AI types from the Next.js types (for consistency)
import type { EmploymentHistory, Skills, Projects } from '../../src/types/index';

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
