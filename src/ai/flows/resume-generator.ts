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
import fs from 'fs/promises';
import path from 'path';

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
  skills: SkillsSchema.describe('The user\'s skills. This list should be used for ATS optimization by including ALL skills from this array somewhere in the LaTeX, potentially hidden.'),
  projects: ProjectsSchema.describe('The user\'s projects.'),
  resumeTemplate: z.enum(['regular', 'compact', 'ultraCompact']).default('regular').describe('The LaTeX template style for the resume. "regular" is standard, "compact" uses tighter spacing, "ultraCompact" is very space-efficient.'),
  accentColor: z.string().optional().describe('User-defined accent color for the resume. Can be a hex code (e.g., "FF5733" without #) or a LaTeX named color (e.g., "RoyalBlue"). If hex, use with \\definecolor{AccentColor}{HTML}{HEX_CODE}. If named, try to use directly or define. If not provided, use black or a default dark color.'),
  isAccentColorHex: z.boolean().optional().describe('INTERNAL USE: A flag to indicate if the accentColor is a hex value. This is set programmatically.'),
  pageLimit: z.number().min(1).max(5).default(2).describe('The desired maximum number of pages for the resume. Attempt to fit content within this limit, especially for compact templates.'),
  templateOverride: z.string().optional().describe('Allow overriding the template with a raw string. For testing or dynamic purposes.'),
});
export type GenerateResumeInput = z.infer<typeof GenerateResumeInputSchema>;

const GenerateResumeOutputSchema = z.object({
  resume: z.string().describe('The generated resume in LaTeX format.'),
  resumeMarkdown: z.string().describe('The generated resume in Markdown format.'),
  summary: z.string().describe('A summary blurb for the resume.'),
  coverLetter: z.string().describe('A cover letter tailored to the job description.'),
  matchAnalysis: z.string().describe('Analysis of how well the user matches the job description.'),
  jobTitleFromJD: z.string().describe('The job title extracted from the job description. If not found, return an empty string.'),
  companyNameFromJD: z.string().describe('The company name extracted from the job description. If not found, return an empty string.'),
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
  prompt: `You are a resume expert and LaTeX specialist. Based on the provided job description, user information, and customization options, create the following outputs:
1. A resume in LaTeX format, tailored to the provided template, using '{{{accentColor}}}' as the accent color, and aiming for a '{{{pageLimit}}}' page limit.
2. A resume in Markdown format.
3. A summary blurb.
4. A cover letter.
5. An analysis of how well the user matches the job description.
6. Extract the job title from the job description.
7. Extract the company name from the job description.

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

All User Skills (for ATS optimization):
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

---
LaTeX Resume Generation Instructions:
Template Style: '{{{resumeTemplate}}}'
Accent Color: '{{{accentColor}}}' (If hex, it will be just the hex digits like 'FF5733'. If named, it's the color name e.g., 'RoyalBlue'. If empty, use black.)
Page Limit: '{{{pageLimit}}}' pages.

General LaTeX Setup (Apply this to all templates):
- Document Class: Base on template style (e.g., article). Adjust font size as per template (11pt for regular, 10pt for compact, 9pt for ultra-compact).
- Required Packages: Ensure \\usepackage{geometry}, \\usepackage[dvipsnames]{xcolor}, \\usepackage{enumitem}, \\usepackage{titlesec}, \\usepackage{hyperref}, \\usepackage{amsfonts}, \\usepackage{amsmath}, \\usepackage{amssymb} are included.
- Margins: Aim for ~0.75in (e.g., \\geometry{left=0.75in, right=0.75in, top=0.75in, bottom=0.75in}). For more compact templates, you can reduce margins slightly if needed to meet page limits, but not less than 0.5in.
- Accent Color Definition:
  {{#if accentColor}}
    {{#if isAccentColorHex}}
      \\definecolor{AccentColor}{HTML}{{{accentColor}}}
    {{else}}
      \\colorlet{AccentColor}{{{accentColor}}} % Assumes it's a valid LaTeX named color
    {{/if}}
  {{else}}
    \\definecolor{AccentColor}{RGB}{0,0,0} % Default to black
  {{/if}}
- Contact Information: Display prominently. Name should be large (e.g., \\Huge) and potentially use AccentColor. Contact details (email, phone, address, LinkedIn, GitHub, other links) should be clear, possibly in a centered block or under the name. Use hyperref for clickable links (\\href{URL}{text}).
- Sections: Common sections are Summary/Background, Education, Experience, Projects, Skills. Section titles should be distinct.
- ATS Optimization: CRITICAL - Include ALL skills from the "All User Skills" list as hidden text at the very end of the document, after all visible content, ideally forced onto a new page if space allows to not interfere with visual page count if the content fits within the page limit naturally.
  Example:
  \\newpage % Attempt to put on its own page
  \\mbox{} % Ensure it's not empty if it starts a new page
  \\vfill % Push to bottom of page
  \\begin{center} % Center it, though it's invisible
  \\texttt{\\textcolor{white}{\\tiny ATS SKILLS: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}} }}
  \\end{center}
  Ensure this text does NOT add to the visible page count if the resume content naturally fits within the '{{{pageLimit}}}'. This is for machine parsing only.

Template-Specific Guidelines:
{{{templateOverride}}}

Make sure the generated LaTeX is a single, complete, and compilable document.
The entire output must be in the specified JSON format.
The LaTeX resume MUST be fully functional.
Do not use Jinja or Django templates. Only Handlebars.
Do not directly call functions or use await in Handlebars.
For companyInformation in cover letter generation, if it is null or empty, do not mention it.

Output must be in the specified JSON format.
`,
});

const generateResumeFlow = ai.defineFlow(
  {
    name: 'generateResumeFlow',
    inputSchema: GenerateResumeInputSchema,
    outputSchema: GenerateResumeOutputSchema,
  },
  async input => {
    // Pre-process accentColor if it's hex and starts with #
    let processedAccentColor = input.accentColor;
    if (processedAccentColor && processedAccentColor.startsWith('#')) {
      processedAccentColor = processedAccentColor.substring(1);
    }
    
    // Load the selected LaTeX template
    const templateName = input.resumeTemplate;
    const templatePath = path.join(process.cwd(), 'src', 'ai', 'templates', `${templateName}.tex.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');

    const isAccentColorHex = !!processedAccentColor && /^[0-9A-Fa-f]{6}$/i.test(processedAccentColor);

    const flowInput = {
      ...input,
      accentColor: processedAccentColor,
      templateOverride: templateContent,
      isAccentColorHex,
    };

    try {
      const {output} = await resumePrompt(flowInput);
      return output!;
    } catch (e: any) {
      console.error(
        `[Resume Generation Error] Failed to render prompt template for resume generation.`,
        'Input:',
        input,
        'Error:',
        e
      );
      throw new Error(
        `Template rendering failed. Please check the flow logic and template syntax. Original error: ${e.message}`
      );
    }
  }
);

