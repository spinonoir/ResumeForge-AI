'use server';

/**
 * @fileOverview Generates a summary blurb for a resume based on a job description and user data.
 *
 * - generateSummary - A function that generates the summary blurb.
 * - GenerateSummaryInput - The input type for the generateSummary function.
 * - GenerateSummaryOutput - The return type for the generateSummary function.
 */

import {ai} from '../genkit';
import {z} from 'genkit';

const GenerateSummaryInputSchema = z.object({
  jobDescription: z.string().describe('The job description for the role.'),
  userData: z.string().describe('The user data including employment history, skills, and projects.'),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;

const GenerateSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary blurb highlighting the user\'s suitability for the role.'),
});
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;

export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
  return generateSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSummaryPrompt',
  input: {schema: GenerateSummaryInputSchema},
  output: {schema: GenerateSummaryOutputSchema},
  prompt: `You are an expert resume writer. Given the following job description and user data, create a concise summary blurb that highlights the user\'s suitability for the role.\n\nJob Description: {{{jobDescription}}}\n\nUser Data: {{{userData}}}\n\nSummary: `,
});

const generateSummaryFlow = ai.defineFlow(
  {
    name: 'generateSummaryFlow',
    inputSchema: GenerateSummaryInputSchema,
    outputSchema: GenerateSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
