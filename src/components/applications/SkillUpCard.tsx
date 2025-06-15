"use client";

import { useState } from 'react';
import type { SavedApplication, LearningSuggestion } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ZapIcon, BookOpenIcon, VideoIcon, FileCodeIcon, LightbulbIcon, ExternalLinkIcon } from 'lucide-react';
import { useApplicationsStore, useUserProfileStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * MOCK AI SERVICE
 * 
 * This function simulates a call to a real AI service that would generate personalized learning suggestions.
 * 
 * @param jobDesc - The full job description string for the target application. The AI would analyze this for key technologies, skills, and experience levels required.
 * @param userSkills - An array of strings representing the user's current skills from their profile. The AI would use this to identify gaps between the user's skills and the job's requirements.
 * 
 * @returns A promise that resolves to an array of LearningSuggestion objects. In a real implementation, this would involve:
 *   1. Sending the job description and user's skills to a secure backend endpoint.
 *   2. The backend service would use a Large Language Model (LLM) with a carefully crafted prompt.
 *   3. The prompt would instruct the LLM to:
 *      - Identify the top 3-5 most critical skills or knowledge areas from the job description that the user seems to be weakest in.
 *      - For each identified area, search for high-quality, relevant learning resources (e.g., popular tutorials, official documentation, highly-rated courses, insightful articles).
 *      - Categorize each resource as a 'course', 'video', 'project', 'article', or 'other'.
 *      - Return the data in a structured JSON format matching the `LearningSuggestion` type.
 *   4. The function would return the structured data received from the backend.
 */
const generateMockSuggestions = async (jobDesc: string, userSkills: string[]): Promise<LearningSuggestion[]> => {
    console.log("Generating mock suggestions for:", { jobDesc: jobDesc.substring(0, 100) + "...", userSkills });
    await new Promise(res => setTimeout(res, 1500)); // Simulate network delay
    return [
        { id: '1', title: "Mastering Advanced TypeScript", url: "https://www.typescriptlang.org/docs/handbook/intro.html", category: 'course', description: "An in-depth course on TypeScript's advanced features like generics, decorators, and mapped types." },
        { id: '2', title: "React Performance Optimization", url: "https://react.dev/learn/rendering-lists#keeping-components-pure", category: 'video', description: "A video series on memoization, code splitting, and other techniques to boost your React app's speed." },
        { id: '3', title: "Build a Full-Stack T3 App", url: "https://create.t3.gg/", category: 'project', description: "A hands-on project to build a modern, type-safe app with Next.js, tRPC, and Prisma." },
        { id: '4', title: "Grokking the System Design Interview", url: "#", category: 'article', description: "Essential reading for preparing for system design questions in technical interviews." }
    ];
};

const categoryIcons = {
    article: <BookOpenIcon className="h-5 w-5" />,
    video: <VideoIcon className="h-5 w-5" />,
    course: <ZapIcon className="h-5 w-5" />,
    project: <FileCodeIcon className="h-5 w-5" />,
    other: <LightbulbIcon className="h-5 w-5" />,
};

interface SkillUpCardProps {
    application: SavedApplication;
}

export function SkillUpCard({ application }: SkillUpCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { updateApplication } = useApplicationsStore();
    const { getAISkills } = useUserProfileStore();

    const handleGeneratePlan = async () => {
        setIsLoading(true);
        toast({ title: "Generating Skill-Up Plan...", description: "The AI is analyzing the job description and your profile." });

        const userSkills = getAISkills();
        const suggestions = await generateMockSuggestions(application.jobDescription, userSkills);
        
        // In a real scenario, this update would be more robust
        await updateApplication(application.id, { suggestedLearning: suggestions } as any);

        toast({ title: "Skill-Up Plan Generated!", description: "Your personalized learning suggestions are ready." });
        setIsLoading(false);
    };

    const suggestions = application.suggestedLearning || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center">
                    <ZapIcon className="mr-2 h-5 w-5 text-yellow-500" />
                    AI Skill-Up Plan
                </CardTitle>
                <CardDescription>Personalized learning suggestions to ace your interview.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : suggestions.length > 0 ? (
                    <ul className="space-y-3">
                        {suggestions.map(item => (
                            <li key={item.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-secondary/50">
                                <span className="text-primary">{categoryIcons[item.category]}</span>
                                <div className="flex-1">
                                    <p className="font-semibold">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                                <a href={item.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLinkIcon className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                     <div className="text-center py-4">
                        <p className="mb-4 text-muted-foreground">Get AI-powered suggestions on what to study based on the job description and your profile.</p>
                        <Button onClick={handleGeneratePlan} disabled={isLoading}>
                            <ZapIcon className="mr-2 h-4 w-4" />
                            Generate Skill-Up Plan
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
