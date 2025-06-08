
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

// Define schemas for employment history, skills, and projects.
const EmploymentHistorySchema = z.array(z.object({
  title: z.string().describe('Job title'),
  company: z.string().describe('Company name'),
  dates: z.string().describe('Employment dates'),
  description: z.string().describe('Job description'),
  jobSummary: z.string().optional().describe('A brief summary of the job role and its core responsibilities.'),
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

const GenerateResumeInputSchema = z.object({
  jobDescription: z.string().describe('The job description to tailor the resume to.'),
  employmentHistory: EmploymentHistorySchema.describe('The user\'s employment history.'),
  skills: SkillsSchema.describe('The user\'s skills.'),
  projects: ProjectsSchema.describe('The user\'s projects.'),
  backgroundInformation: z.string().describe('Background information about the user.'),
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
  prompt: `You are a resume expert. Create a tailored resume, summary blurb, cover letter and match analysis based on the following job description and user information.

Job Description: {{{jobDescription}}}

Background Information: {{{backgroundInformation}}}

Employment History:
{{#each employmentHistory}}
  Title: {{{title}}}
  Company: {{{company}}}
  Dates: {{{dates}}}
  {{#if jobSummary}}Summary: {{{jobSummary}}}{{/if}}
  Description: {{{description}}}
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

