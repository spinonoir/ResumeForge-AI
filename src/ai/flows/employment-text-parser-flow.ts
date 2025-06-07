
'use server';
/**
 * @fileOverview An AI flow to parse employment details from a block of text.
 *
 * - parseEmploymentText - A function that handles parsing employment text.
 * - ParseEmploymentTextInput - The input type for the parseEmploymentText function.
 * - ParseEmploymentTextOutput - The return type for the parseEmploymentText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseEmploymentTextInputSchema = z.object({
  textBlock: z.string().describe('A block of text containing employment history details.'),
});
export type ParseEmploymentTextInput = z.infer<typeof ParseEmploymentTextInputSchema>;

const ParseEmploymentTextOutputSchema = z.object({
  jobTitle: z.string().describe('The extracted job title. Return an empty string if not found.'),
  company: z.string().describe('The extracted company name. Return an empty string if not found.'),
  employmentDates: z.string().describe('The extracted employment dates. Return an empty string if not found.'),
  jobDescription: z.string().describe('The extracted job description. Return an empty string if not found.'),
});
export type ParseEmploymentTextOutput = z.infer<typeof ParseEmploymentTextOutputSchema>;

export async function parseEmploymentText(input: ParseEmploymentTextInput): Promise<ParseEmploymentTextOutput> {
  return employmentTextParserFlow(input);
}

const prompt = ai.definePrompt({
  name: 'employmentTextParserPrompt',
  input: {schema: ParseEmploymentTextInputSchema},
  output: {schema: ParseEmploymentTextOutputSchema},
  prompt: `You are an expert in parsing resume and job history text.
Given the following text block, extract the job title, company name, employment dates, and a concise job description.
If a specific piece of information is not present in the text, return an empty string for that field.

Input Text:
\`\`\`
{{{textBlock}}}
\`\`\`

Output should be in JSON format with keys: "jobTitle", "company", "employmentDates", "jobDescription".
Example:
If text is "Software Engineer at Google, 2020-2022. Worked on cool stuff."
Output: { "jobTitle": "Software Engineer", "company": "Google", "employmentDates": "2020-2022", "jobDescription": "Worked on cool stuff." }
If text is "Project Manager, SomeCorp. Jan 2019 - Dec 2019"
Output: { "jobTitle": "Project Manager", "company": "SomeCorp", "employmentDates": "Jan 2019 - Dec 2019", "jobDescription": "" }
`,
});

const employmentTextParserFlow = ai.defineFlow(
  {
    name: 'employmentTextParserFlow',
    inputSchema: ParseEmploymentTextInputSchema,
    outputSchema: ParseEmploymentTextOutputSchema,
  },
  async (input: ParseEmploymentTextInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
