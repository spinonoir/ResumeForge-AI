
'use server';
/**
 * @fileOverview An AI flow to parse project details from a block of text.
 *
 * - parseProjectText - A function that handles parsing project text.
 * - ParseProjectTextInput - The input type for the parseProjectText function.
 * - ParseProjectTextOutput - The return type for the parseProjectText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseProjectTextInputSchema = z.object({
  textBlock: z.string().describe('A block of text containing project details.'),
});
export type ParseProjectTextInput = z.infer<typeof ParseProjectTextInputSchema>;

const ParseProjectTextOutputSchema = z.object({
  projectName: z.string().describe('The extracted project name. Return an empty string if not found.'),
  projectAssociation: z.string().describe('The association of the project (e.g., school assignment, personal project, work assignment, open source contribution). Return an empty string if not found.'),
  projectDates: z.string().describe('The extracted project dates (e.g., Jan 2023 - Mar 2023). Return an empty string if not found.'),
  projectSkillsUsed: z.array(z.string()).describe('A list of skills used in the project. Extract from the text. Return an empty array if none are found.'),
  projectRoleDescription: z.string().describe('A comprehensive extraction of the user\'s role, duties, contributions, and tasks in the project. Return an empty string if not found.'),
  projectLink: z.string().optional().describe('The extracted project link (URL). Return undefined or an empty string if not found.'),
});
export type ParseProjectTextOutput = z.infer<typeof ParseProjectTextOutputSchema>;

export async function parseProjectText(input: ParseProjectTextInput): Promise<ParseProjectTextOutput> {
  return projectTextParserFlow(input);
}

const prompt = ai.definePrompt({
  name: 'projectTextParserPrompt',
  input: {schema: ParseProjectTextInputSchema},
  output: {schema: ParseProjectTextOutputSchema},
  prompt: `You are an expert in parsing project descriptions.
Given the following text block, extract the project name, its association, active dates, skills used, a comprehensive description of the user's role and contributions, and an optional project link (URL).

Key instructions:
- For "projectName": Extract the most plausible project title.
- For "projectAssociation": Determine if it's a school assignment, club project, personal project, work assignment, open source contribution, etc.
- For "projectDates": Extract the start and end dates or duration.
- For "projectSkillsUsed": List the technologies, tools, or methodologies mentioned as being used (e.g., ["React", "Node.js", "Agile"]).
- For "projectRoleDescription": Extract ALL relevant details about the user's role, what they did, their responsibilities, and contributions. This should be detailed.
- For "projectLink": Extract any URL that seems to be a link to the project.
- If specific information cannot be found, return an empty string for text fields or an empty array for skills.

Input Text:
\`\`\`
{{{textBlock}}}
\`\`\`

Output should be in JSON format with keys: "projectName", "projectAssociation", "projectDates", "projectSkillsUsed", "projectRoleDescription", "projectLink".

Example 1:
If text is "Led the development of a Personal Portfolio Website from Jan 2022 to May 2022. This was a personal project to showcase my skills in Next.js, Tailwind CSS, and TypeScript. I designed the UI/UX, developed all components, and deployed it on Vercel. Link: https://myportfolio.example.com"
Output: {
  "projectName": "Personal Portfolio Website",
  "projectAssociation": "Personal project",
  "projectDates": "Jan 2022 - May 2022",
  "projectSkillsUsed": ["Next.js", "Tailwind CSS", "TypeScript", "UI/UX Design"],
  "projectRoleDescription": "Led the development of the website. Designed the UI/UX, developed all components, and deployed it on Vercel.",
  "projectLink": "https://myportfolio.example.com"
}

Example 2:
If text is "Recipe Finder App - An iOS school assignment for my mobile dev class, active Fall 2021. Built with Swift to help users discover new recipes. I implemented user accounts and the feature for saving favorite recipes. Used CoreData for local storage."
Output: {
  "projectName": "Recipe Finder App",
  "projectAssociation": "School assignment",
  "projectDates": "Fall 2021",
  "projectSkillsUsed": ["Swift", "iOS Development", "CoreData"],
  "projectRoleDescription": "Built an iOS application to help users discover new recipes based on ingredients. Implemented user accounts and the feature for saving favorite recipes. Used CoreData for local storage.",
  "projectLink": ""
}
`,
});

const projectTextParserFlow = ai.defineFlow(
  {
    name: 'projectTextParserFlow',
    inputSchema: ParseProjectTextInputSchema,
    outputSchema: ParseProjectTextOutputSchema,
  },
  async (input: ParseProjectTextInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);

