// src/ai/flows/job-description-analyzer.ts
'use server';

/**
 * @fileOverview Analyzes a user's background and a job description to determine skill match.
 *
 * - analyzeJobDescription - A function that analyzes the job description and user's background.
 * - AnalyzeJobDescriptionInput - The input type for the analyzeJobDescription function.
 * - AnalyzeJobDescriptionOutput - The return type for the analyzeJobDescription function.
 */

import {ai} from '../genkit';
import {z} from 'genkit';

const AnalyzeJobDescriptionInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The job description to analyze.'),
  userBackground: z
    .string()
    .describe('The user background information including skills, employment history and projects.'),
});
export type AnalyzeJobDescriptionInput = z.infer<
  typeof AnalyzeJobDescriptionInputSchema
>;

const AnalyzeJobDescriptionOutputSchema = z.object({
  matchAnalysis: z
    .string()
    .describe(
      'An analysis of how well the user skills match the requirements in the job description. Includes strengths and weaknesses.'
    ),
});
export type AnalyzeJobDescriptionOutput = z.infer<
  typeof AnalyzeJobDescriptionOutputSchema
>;

export async function analyzeJobDescription(
  input: AnalyzeJobDescriptionInput
): Promise<AnalyzeJobDescriptionOutput> {
  return analyzeJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeJobDescriptionPrompt',
  input: {schema: AnalyzeJobDescriptionInputSchema},
  output: {schema: AnalyzeJobDescriptionOutputSchema},
  prompt: `You are an expert career counselor. Analyze the following job description and user background to determine how well the user skills match the requirements in the job description.

Job Description: {{{jobDescription}}}

User Background: {{{userBackground}}}

Provide an analysis of the users strengths and weaknesses with respect to the job description.
`,
});

const analyzeJobDescriptionFlow = ai.defineFlow(
  {
    name: 'analyzeJobDescriptionFlow',
    inputSchema: AnalyzeJobDescriptionInputSchema,
    outputSchema: AnalyzeJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
