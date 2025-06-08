
// src/ai/flows/resume-generator.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating tailored resumes based on user data and job descriptions.
 *
 * - generateResume - A function that orchestrates the resume generation process.
 * - GenerateResumeInput - The input type for the generateResume function.
 * - GenerateResumeOutput - The return type for the generateResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define schemas for employment history, skills, projects, personal details, and education.
const EmploymentHistorySchema = z.array(z.object({
  title: z.string().describe('Job title'),
  company: z.string().describe('Company name'),
  dates: z.string().describe('Employment dates'),
  description: z.string().describe('Job description'),
  jobSummary: z.string().optional().describe('A brief summary of the job role and its core responsibilities.'),
  skillsDemonstrated: z.array(z.string()).optional().describe('Skills demonstrated in this role.'),
}));
export type EmploymentHistory = z.infer<typeof EmploymentHistorySchema>;

const SkillsSchema = z.array(z.string().describe('Skill'));
export type Skills = z.infer<typeof SkillsSchema>;

const ProjectsSchema = z.array(z.object({
  name: z.string().describe('Project name'),
  association: z.string().describe('Project association (e.g., personal, work, school)'),
  dates: z.string().describe('Project active dates'),
  skillsUsed: z.array(z.string()).describe('Skills used in the project'),
  roleDescription: z.string().describe('Detailed description of the user\'s role and contributions in the project'),
  link: z.string().optional().describe('Link to the project'),
}));
export type Projects = z.infer<typeof ProjectsSchema>;

const SocialMediaLinkSchema = z.object({
  id: z.string().optional(), 
  platform: z.string().describe('Social media platform name (e.g., Twitter, GitHub, Portfolio)'),
  url: z.string().url().describe('URL to the social media profile or site'),
});

const PersonalDetailsSchema = z.object({
  name: z.string().optional().describe('Full name of the user.'),
  email: z.string().email().optional().describe('Email address.'),
  phone: z.string().optional().describe('Phone number.'),
  address: z.string().optional().describe('Physical address (e.g., City, State).'),
  githubUrl: z.string().url().optional().describe('URL to GitHub profile.'),
  linkedinUrl: z.string().url().optional().describe('URL to LinkedIn profile.'),
  socialMediaLinks: z.array(SocialMediaLinkSchema).optional().describe('List of other social media links.'),
});
export type PersonalDetails = z.infer<typeof PersonalDetailsSchema>;

const EducationEntrySchema = z.object({
  id: z.string().optional(), 
  institution: z.string().describe('Name of the educational institution.'),
  degree: z.string().describe('Degree obtained (e.g., Bachelor of Science).'),
  fieldOfStudy: z.string().optional().describe('Field of study (e.g., Computer Science).'),
  dates: z.string().describe('Dates of attendance or graduation (e.g., Aug 2018 - May 2022).'),
  gpa: z.string().optional().describe('Grade Point Average (e.g., 3.8/4.0).'),
  accomplishments: z.string().optional().describe('Additional details like honors, relevant coursework, activities, or thesis title.'),
});
export type EducationEntry = z.infer<typeof EducationEntrySchema>;


const GenerateResumeInputSchema = z.object({
  jobDescription: z.string().describe('The job description to tailor the resume to.'),
  personalDetails: PersonalDetailsSchema.optional().describe('The user\'s personal details.'),
  backgroundInformation: z.string().describe('Background information about the user.'),
  educationHistory: z.array(EducationEntrySchema).optional().describe('The user\'s education history.'),
  employmentHistory: EmploymentHistorySchema.describe('The user\'s employment history.'),
  skills: SkillsSchema.describe('The user\'s skills.'),
  projects: ProjectsSchema.describe('The user\'s projects.'),
});
export type GenerateResumeInput = z.infer<typeof GenerateResumeInputSchema>;

const GenerateResumeOutputSchema = z.object({
  resume: z.string().describe('The generated resume in LaTeX format.'),
  summary: z.string().describe('A summary blurb for the resume.'),
  coverLetter: z.string().describe('A cover letter tailored to the job description.'),
  matchAnalysis: z.string().describe('Analysis of how well the user matches the job description.'),
});
export type GenerateResumeOutput = z.infer<typeof GenerateResumeOutputSchema>;


export async function generateResume(input: GenerateResumeInput): Promise<GenerateResumeOutput> {
  return generateResumeFlow(input);
}


const resumePrompt = ai.definePrompt({
  name: 'resumePrompt',
  input: {
    schema: GenerateResumeInputSchema,
  },
  output: {
    schema: GenerateResumeOutputSchema,
  },
  prompt: `You are a resume expert. Create a tailored resume, summary blurb, cover letter and match analysis based on the following job description and user information. The resume should be in LaTeX format.

Job Description: {{{jobDescription}}}

User Information:
{{#if personalDetails}}
Name: {{personalDetails.name}}
Email: {{personalDetails.email}}
Phone: {{personalDetails.phone}}
Address: {{personalDetails.address}}
{{#if personalDetails.linkedinUrl}}LinkedIn: {{personalDetails.linkedinUrl}}{{/if}}
{{#if personalDetails.githubUrl}}GitHub: {{personalDetails.githubUrl}}{{/if}}
{{#if personalDetails.socialMediaLinks}}
Other Links:
{{#each personalDetails.socialMediaLinks}}
  - {{platform}}: {{url}}
{{/each}}
{{/if}}
{{/if}}

Background Information: {{{backgroundInformation}}}

{{#if educationHistory}}
Education:
{{#each educationHistory}}
  Institution: {{{institution}}}
  Degree: {{{degree}}}
  {{#if fieldOfStudy}}Field of Study: {{{fieldOfStudy}}}{{/if}}
  Dates: {{{dates}}}
  {{#if gpa}}GPA: {{{gpa}}}{{/if}}
  {{#if accomplishments}}Accomplishments: {{{accomplishments}}}{{/if}}
{{/each}}
{{/if}}

Employment History:
{{#each employmentHistory}}
  Title: {{{title}}}
  Company: {{{company}}}
  Dates: {{{dates}}}
  {{#if jobSummary}}Summary: {{{jobSummary}}}{{/if}}
  Description: {{{description}}}
  {{#if skillsDemonstrated.length}}Skills Demonstrated: {{#each skillsDemonstrated}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{/each}}

Skills:
{{#each skills}}
  - {{{this}}}
{{/each}}

Projects:
{{#each projects}}
  Name: {{{name}}}
  Association: {{{association}}}
  Dates: {{{dates}}}
  Role & Contributions: {{{roleDescription}}}
  {{#if skillsUsed.length}}Skills Used: {{#each skillsUsed}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
  {{#if link}}Link: {{{link}}}{{/if}}
{{/each}}

Consider all of this information and generate a resume in LaTeX format, a summary blurb, a cover letter, and an analysis of how well the user matches the job description. Focus on the aspects of the user's history, skills, and projects which are most relevant to the job description. The resume should be concise and well-formatted. The cover letter should be professional and engaging. The match analysis should be thorough and insightful. The summary blurb should be short and attention grabbing.

Ensure the output is well-structured and easy to read.
`,
});

const generateResumeFlow = ai.defineFlow(
  {
    name: 'generateResumeFlow',
    inputSchema: GenerateResumeInputSchema,
    outputSchema: GenerateResumeOutputSchema,
  },
  async input => {
    const {output} = await resumePrompt(input);
    return output!;
  }
);
