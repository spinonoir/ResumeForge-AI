
'use server';
/**
 * @fileOverview An AI flow to parse a block of text, extract skills, and categorize them.
 *
 * - parseAndCategorizeSkills - A function that handles parsing and categorizing skills.
 * - ParseSkillsInput - The input type for the parseAndCategorizeSkills function.
 * - ParseSkillsOutput - The return type for the parseAndCategorizeSkills function.
 */

import {ai} from '../genkit';
import {z} from 'genkit';

const ParseSkillsInputSchema = z.object({
  textBlock: z.string().describe('A block of text containing a list of skills.'),
});
export type ParseSkillsInput = z.infer<typeof ParseSkillsInputSchema>;

const SkillDetailSchema = z.object({
  name: z.string().describe('The identified skill name. Should be a concise and common representation of the skill (e.g., "JavaScript", "Project Management").'),
  category: z.string().describe('A suggested category for the skill (e.g., "Programming Language", "Software", "Soft Skill", "Project Management Tool", "Data Analysis", "Design"). Assign "General" if no specific category is apparent.'),
});

const ParseSkillsOutputSchema = z.object({
  skills: z.array(SkillDetailSchema).describe('An array of identified skills, each with a name and a suggested category.'),
});
export type ParseSkillsOutput = z.infer<typeof ParseSkillsOutputSchema>;

export async function parseAndCategorizeSkills(input: ParseSkillsInput): Promise<ParseSkillsOutput> {
  return skillParserCategorizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'skillParserCategorizerPrompt',
  input: {schema: ParseSkillsInputSchema},
  output: {schema: ParseSkillsOutputSchema},
  prompt: `You are an expert in parsing and categorizing professional skills from text.
Given the following text block, extract individual skills, normalize their names (e.g., proper casing, common terminology), and assign a relevant category to each skill.

Examples of categories: "Programming Language", "Web Technology", "Database", "Cloud Platform", "Operating System", "Software", "Version Control", "Project Management Tool", "Agile Methodology", "Soft Skill", "Communication", "Leadership", "Design Tool", "Data Analysis", "Machine Learning", "DevOps". If a skill doesn't fit well or is too generic, you can use "General".

Ensure each skill name is concise. Remove any duplicates found in the input text, keeping only unique skills.

Input Text:
\`\`\`
{{{textBlock}}}
\`\`\`

Output should be a JSON object with a "skills" array, where each element is an object with "name" and "category".

Example Input:
"Expert in react, nodejs, and Express. Also proficient with python and Java. Used JIRA for task tracking. Strong leadership and communication abilities. Familiar with AWS and Docker. SQL, mongoDB."

Example Output:
{
  "skills": [
    { "name": "React", "category": "Web Technology" },
    { "name": "Node.js", "category": "Web Technology" },
    { "name": "Express.js", "category": "Web Technology" },
    { "name": "Python", "category": "Programming Language" },
    { "name": "Java", "category": "Programming Language" },
    { "name": "JIRA", "category": "Project Management Tool" },
    { "name": "Leadership", "category": "Leadership" },
    { "name": "Communication", "category": "Soft Skill" },
    { "name": "AWS", "category": "Cloud Platform" },
    { "name": "Docker", "category": "DevOps" },
    { "name": "SQL", "category": "Database" },
    { "name": "MongoDB", "category": "Database" }
  ]
}
`,
});

const skillParserCategorizerFlow = ai.defineFlow(
  {
    name: 'skillParserCategorizerFlow',
    inputSchema: ParseSkillsInputSchema,
    outputSchema: ParseSkillsOutputSchema,
  },
  async (input: ParseSkillsInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
