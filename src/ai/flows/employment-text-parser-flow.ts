
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
  jobDescription: z.string().describe('A comprehensive extraction of all duties, functions, and responsibilities. Return an empty string if not found.'),
  jobSummary: z.string().describe('A brief summary (1-2 sentences) of the job role and its core responsibilities. Return an empty string if not found.'),
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
Given the following text block, extract the job title, company name, employment dates, a comprehensive job description, and a brief job summary.

Key instructions:
- For "jobDescription": Extract ALL duties, functions, and responsibilities mentioned in the text. Ensure this field is comprehensive and reflects the full scope of the role described. Do not summarize this part; list out the details.
- For "jobSummary": Provide a brief summary (1-2 sentences) of the job role and its core responsibilities. This should be a high-level overview.
- If a specific piece of information (like job title, company, or dates) is not present in the text, return an empty string for that field.
- If no details can be extracted for the job description or summary, return an empty string for those fields as well.

Input Text:
\`\`\`
{{{textBlock}}}
\`\`\`

Output should be in JSON format with keys: "jobTitle", "company", "employmentDates", "jobDescription", "jobSummary".

Example 1:
If text is "Software Engineer at Google, 2020-2022. Developed feature X using React and Node.js. Led a team of 3 engineers for project Y. Optimized database queries, improving performance by 20%."
Output: {
  "jobTitle": "Software Engineer",
  "company": "Google",
  "employmentDates": "2020-2022",
  "jobDescription": "Developed feature X using React and Node.js.\nLed a team of 3 engineers for project Y.\nOptimized database queries, improving performance by 20%.",
  "jobSummary": "Software Engineer at Google focused on feature development, team leadership, and performance optimization."
}

Example 2:
If text is "Project Manager, SomeCorp. Jan 2019 - Dec 2019. Managed project budgets and timelines."
Output: {
  "jobTitle": "Project Manager",
  "company": "SomeCorp",
  "employmentDates": "Jan 2019 - Dec 2019",
  "jobDescription": "Managed project budgets and timelines.",
  "jobSummary": "Project Manager at SomeCorp responsible for overseeing project budgets and timelines."
}

Example 3:
If text is "Intern at Startup LLC"
Output: {
  "jobTitle": "Intern",
  "company": "Startup LLC",
  "employmentDates": "",
  "jobDescription": "",
  "jobSummary": "Intern at Startup LLC."
}
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

