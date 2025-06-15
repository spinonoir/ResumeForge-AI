// UI-focused types for Next.js app
// Note: AI import removed since ai/ directory moved to Python service

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

export interface Resume {
  id: string;
  name: string;
  createdAt: string;
  templateUsed: string;
  accentColorUsed: string;
  pageLimitUsed: number;
  generatedResumeLatex: string;
  generatedResumeMarkdown: string;
  isStarred: boolean;
}

export type ApplicationStatus = 'saved' | 'submitted' | 'interviewing' | 'offer' | 'rejected' | 'archived';

export interface CorrespondenceEntry {
  id: string;
  date: string;
  type: 'email' | 'phone' | 'interview' | 'note';
  content: string;
}

export interface ImportantDate {
  id: string;
  date: string;
  description: string;
  isFollowUp: boolean;
  notes?: string;
}

export interface LearningSuggestion {
  id: string;
  title: string;
  url: string;
  category: 'article' | 'video' | 'course' | 'project' | 'other';
  description?: string;
}

export interface OfferDetails {
    payRate?: string;
    notes?: string;
}

export interface RejectionDetails {
    rejectedBy: 'user' | 'company';
    reason?: string;
    takeaways?: string;
}

export interface ArchiveDetails {
    reason?: string;
    takeaways?: string;
}

export interface SavedApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  resumes?: Resume[];
  generatedCoverLetter: string;
  generatedSummary: string;
  matchAnalysis: string;
  createdAt: string;
  status: ApplicationStatus;
  notes?: string;
  submissionDate?: string;
  correspondence?: CorrespondenceEntry[];
  importantDates?: ImportantDate[];
  suggestedLearning?: LearningSuggestion[];
  offerDetails?: OfferDetails;
  rejectionDetails?: RejectionDetails;
  archiveDetails?: ArchiveDetails;
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

// AI-related types are now defined in services/shared/types.ts
