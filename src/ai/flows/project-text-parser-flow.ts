
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
  projectDescription: z.string().describe('A comprehensive extraction of the project description. Return an empty string if not found.'),
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
Given the following text block, extract the project name, a comprehensive project description, and an optional project link (URL).

Key instructions:
- For "projectName": Extract the most plausible project title.
- For "projectDescription": Extract ALL relevant details about the project, its purpose, technologies used, and your role or contributions if mentioned.
- For "projectLink": Extract any URL that seems to be a link to the project (e.g., GitHub repository, live demo, project page). If no link is found, this field can be omitted or empty.
- If specific information cannot be found, return an empty string for that field.

Input Text:
\`\`\`
{{{textBlock}}}
\`\`\`

Output should be in JSON format with keys: "projectName", "projectDescription", "projectLink".

Example 1:
If text is "Developed a Personal Portfolio Website using Next.js and Tailwind CSS. Deployed on Vercel. Link: https://myportfolio.example.com"
Output: {
  "projectName": "Personal Portfolio Website",
  "projectDescription": "Developed a Personal Portfolio Website using Next.js and Tailwind CSS. Deployed on Vercel.",
  "projectLink": "https://myportfolio.example.com"
}

Example 2:
If text is "Recipe Finder App - An iOS application built with Swift to help users discover new recipes based on ingredients they have. Features include user accounts and saving favorite recipes."
Output: {
  "projectName": "Recipe Finder App",
  "projectDescription": "An iOS application built with Swift to help users discover new recipes based on ingredients they have. Features include user accounts and saving favorite recipes.",
  "projectLink": ""
}

Example 3:
If text is "Contributed to open-source library XYZ by fixing bugs and adding new features. github.com/org/xyz"
Output: {
  "projectName": "Open-source library XYZ contribution",
  "projectDescription": "Contributed to open-source library XYZ by fixing bugs and adding new features.",
  "projectLink": "https://github.com/org/xyz"
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
