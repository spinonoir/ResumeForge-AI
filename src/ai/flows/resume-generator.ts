
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
  skills: SkillsSchema.describe('The user\'s skills. This list should be used for ATS optimization by including ALL skills from this array somewhere in the LaTeX, potentially hidden.'),
  projects: ProjectsSchema.describe('The user\'s projects.'),
  resumeTemplate: z.enum(['regular', 'compact', 'ultraCompact']).default('regular').describe('The LaTeX template style for the resume. "regular" is standard, "compact" uses tighter spacing, "ultraCompact" is very space-efficient.'),
  accentColor: z.string().optional().describe('User-defined accent color for the resume. Can be a hex code (e.g., "FF5733" without #) or a LaTeX named color (e.g., "RoyalBlue"). If hex, use with \\definecolor{AccentColor}{HTML}{HEX_CODE}. If named, try to use directly or define. If not provided, use black or a default dark color.'),
  pageLimit: z.number().min(1).max(5).default(2).describe('The desired maximum number of pages for the resume. Attempt to fit content within this limit, especially for compact templates.'),
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
1. A resume in LaTeX format, tailored to the '{{{resumeTemplate}}}' style, using '{{{accentColor}}}' as the accent color, and aiming for a '{{{pageLimit}}}' page limit.
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
Accent Color: '{{{accentColor}}}' (If hex, it will be just the hex digits. If named, it's the color name. If empty, use black.)
Page Limit: '{{{pageLimit}}}' pages.

General LaTeX Setup:
- Use a standard document class (e.g., article).
- Include necessary packages: 'geometry' (for margins, aim for ~0.75in or adjust for compactness), 'xcolor' (for colors), 'enumitem' (for lists), 'titlesec' (for section styling), 'hyperref' (for clickable links).
- Define AccentColor:
  {{#if accentColor}}
    \\definecolor{AccentColor}{HTML}{{{accentColor}}} % If it's a hex code passed without #
    % If '{{{accentColor}}}' is a named color like 'Blue', the above will fail.
    % So, if '{{{accentColor}}}' is not 6 hex characters, assume it's a named color.
    % For named colors, you might need to check if it's a base LaTeX color or needs 'dvipsnames' etc.
    % A robust way: If accentColor is NOT a 6-char HEX string, then use: \\colorlet{AccentColor}{{{accentColor}}} if it's a known name,
    % otherwise, default to black. For this exercise, assume if it's not HEX, it's a valid LaTeX color name.
    % If '{{{accentColor}}}' is a name like 'RoyalBlue', try using it directly.
  {{else}}
    \\definecolor{AccentColor}{RGB}{0,0,0} % Default to black
  {{/if}}
  If '{{{accentColor}}}' is a named color, use it like \textcolor{{{{accentColor}}}}{text} or for defining section color.
- Make email, LinkedIn, GitHub, and other URLs clickable using hyperref.
- Name/Contact Info: Display prominently, possibly using AccentColor for the name.
- Sections: Education, Employment History, Projects, Skills (selected/highlighted, not all).
- ATS Optimization: CRITICAL - Include ALL skills from the "All User Skills" list as hidden text. For example, at the very end of the document:
  \\newpage % Ensure it's on its own, possibly not rendered if content fits before
  \\mbox{} % Empty box to ensure page break if needed
  \\vfill % Push to bottom
  \\texttt{\\textcolor{white}{\\tiny ATS SKILLS: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}}}
  Ensure this hidden text does not disrupt the visual layout or add an extra visible page if the main content fits the page limit.

Template Specifics:

{{#eq resumeTemplate "regular"}}
  % Regular Template: Standard professional layout.
  - Use standard font sizes.
  - Clear separation between sections.
  - Section titles: Prominent, possibly using AccentColor. E.g., \\section*{\\color{AccentColor}Section Title}.
  - Bullet points for descriptions. Use enumitem for list customization if needed.
{{/eq}}

{{#eq resumeTemplate "compact"}}
  % Compact Template: Tighter spacing, aims for fewer pages.
  - Slightly smaller base font size if necessary (e.g., 10pt or 11pt).
  - Reduced vertical spacing between items, sections (e.g., \\vspace{-2mm}).
  - Section titles: Still clear, perhaps less space above/below. Consider \\titlespacing.
  - Descriptions: Concise bullet points.
{{/eq}}

{{#eq resumeTemplate "ultraCompact"}}
  % Ultra-Compact Template: Very space-efficient, for fitting a lot of info or very short resumes.
  - Smallest reasonable font size (e.g., 9pt or 10pt).
  - Minimal vertical spacing. Use negative vspace if needed.
  - Section titles: Could be run-in with text or very minimal.
  - Consider using minipage environments or multicol package for certain sections to save space if appropriate.
  - Focus on extreme brevity in descriptions.
{{/eq}}

Ensure the LaTeX output is a single, complete, compilable document.
---

Consider all of this information. Focus on the aspects of the user's history, skills, and projects which are most relevant to the job description.
Both resume formats (LaTeX and Markdown) should be concise and well-formatted.
The cover letter should be professional and engaging.
The match analysis should be thorough and insightful.
The summary blurb should be short and attention-grabbing.
If the job title or company name cannot be clearly identified from the job description, return an empty string for 'jobTitleFromJD' and/or 'companyNameFromJD'.

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
    // Pre-process accentColor if it's hex
    let processedAccentColor = input.accentColor;
    if (processedAccentColor && processedAccentColor.startsWith('#')) {
      processedAccentColor = processedAccentColor.substring(1);
    }

    const flowInput = {
      ...input,
      accentColor: processedAccentColor,
    };

    const {output} = await resumePrompt(flowInput);
    return output!;
  }
);
