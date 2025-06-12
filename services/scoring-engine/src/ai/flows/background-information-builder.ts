// This is an AI-powered chat interface that helps users articulate their background information.
'use server';

import {ai} from '@services/scoring-engine/src/ai/genkit';
import {z} from 'genkit';

const BackgroundInformationInputSchema = z.object({
  question: z.string().describe('The current question to ask the user.'),
  previousAnswers: z.array(z.string()).optional().describe('The list of previous answers from the user.'),
  accumulatedBackground: z.string().optional().describe('The accumulated background information so far.'),
});
export type BackgroundInformationInput = z.infer<typeof BackgroundInformationInputSchema>;

const BackgroundInformationOutputSchema = z.object({
  nextQuestion: z.string().describe('The next question to ask the user, or an empty string if done.'),
  updatedBackground: z.string().describe('The updated accumulated background information.'),
  isDone: z.boolean().describe('Whether the background information gathering is complete.'),
});
export type BackgroundInformationOutput = z.infer<typeof BackgroundInformationOutputSchema>;

export async function buildBackgroundInformation(
  input: BackgroundInformationInput
): Promise<BackgroundInformationOutput> {
  return backgroundInformationBuilderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'backgroundInformationBuilderPrompt',
  input: {
    schema: BackgroundInformationInputSchema,
  },
  output: {
    schema: BackgroundInformationOutputSchema,
  },
  prompt: `You are an AI assistant helping a user build their professional background information for a resume.

  Your goal is to ask a series of questions that will help the user articulate their skills, experiences, and accomplishments.
  Use the previous answers to understand their background and tailor the questions accordingly. Accumulate the information into a professional summary.

  Current question: {{{question}}}

  Previous answers:{{#each previousAnswers}} - {{{this}}}\n{{/each}}

  Accumulated background: {{{accumulatedBackground}}}

  Based on the current question, previous answers, and accumulated background:
  1. Determine if you need to ask another question. If not, mark isDone to true, provide the final background and an empty string for nextQuestion.
  2. If another question is required, generate a clear and concise next question that builds upon the user's previous responses. isDone is false and updatedBackground is the same as the accumulatedBackground.
  3. Update the background summary as appropriate based on the user's latest response. isDone is false until the final background summary is done.

  Output in the following JSON format:
  {
    "nextQuestion": "",
    "updatedBackground": "",
    "isDone": false
  }`,
});

const backgroundInformationBuilderFlow = ai.defineFlow(
  {
    name: 'backgroundInformationBuilderFlow',
    inputSchema: BackgroundInformationInputSchema,
    outputSchema: BackgroundInformationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
