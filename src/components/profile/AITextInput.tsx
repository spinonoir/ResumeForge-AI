"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SparklesIcon, Loader2Icon } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from "@/hooks/use-toast";
import {
  parseEmploymentText,
  parseProjectText,
  parseAndCategorizeSkills,
  ParseEmploymentTextInput,
  ParseProjectTextInput,
  ParseAndCategorizeSkillsInput
} from '@/lib/profile-management-service';

interface AITextInputProps {
  type: 'employment' | 'project' | 'skills';
  onSuccess: (data: any) => void;
  placeholder?: string;
  title?: string;
  description?: string;
}

const defaultPlaceholders = {
  employment: `Paste or describe your work experience here, for example:

"Software Engineer at Google from Jan 2020 to Dec 2022. Developed scalable web applications using React and Node.js. Led a team of 5 developers on the customer portal project. Improved system performance by 30% through database optimization. Used technologies like PostgreSQL, AWS, Docker, and implemented CI/CD pipelines."`,
  
  project: `Describe your project here, for example:

"Personal Portfolio Website - A personal project I worked on from Jan 2023 to Mar 2023. Built with Next.js, TypeScript, and Tailwind CSS. Features responsive design, dark mode toggle, and contact form. Deployed on Vercel. Link: https://myportfolio.com"`,
  
  skills: `List your skills here, for example:

"JavaScript, React, Node.js, Python, PostgreSQL, AWS, Docker, Git, Agile methodologies, team leadership, problem-solving, communication"`
};

const defaultTitles = {
  employment: 'Add Work Experience with AI',
  project: 'Add Project with AI', 
  skills: 'Add Skills with AI'
};

const defaultDescriptions = {
  employment: 'Describe your work experience in natural language, and our AI will extract the job title, company, dates, responsibilities, and skills.',
  project: 'Describe your project in natural language, and our AI will extract the project name, association, dates, technologies used, and your role.',
  skills: 'List your skills in any format, and our AI will identify and categorize them automatically.'
};

export function AITextInput({ 
  type, 
  onSuccess, 
  placeholder, 
  title, 
  description 
}: AITextInputProps) {
  const [textInput, setTextInput] = useState('');

  const mutation = useMutation({
    mutationFn: async (input: string) => {
      const textBlock = input.trim();
      if (!textBlock) throw new Error('Please enter some text to parse');

      switch (type) {
        case 'employment':
          return parseEmploymentText({ textBlock } as ParseEmploymentTextInput);
        case 'project':
          return parseProjectText({ textBlock } as ParseProjectTextInput);
        case 'skills':
          return parseAndCategorizeSkills({ textBlock } as ParseAndCategorizeSkillsInput);
        default:
          throw new Error('Invalid parsing type');
      }
    },
    onSuccess: (data) => {
      setTextInput('');
      onSuccess(data);
      toast({
        title: "AI Parsing Successful",
        description: `Your ${type} information has been processed and structured.`,
      });
    },
    onError: (error) => {
      console.error('AI Parsing Error:', error);
      let errorMessage = `Failed to parse ${type} information.`;
      
      if (error.message?.includes('Missing or insufficient permissions') || 
          error.message?.includes('GOOGLE_GENAI_API_KEY')) {
        errorMessage = 'AI service is not properly configured. Please check your API keys.';
      } else if (error.message?.includes('Failed to find Server Action')) {
        errorMessage = 'AI service temporarily unavailable. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "AI Parsing Error",
        description: errorMessage,
      });
    }
  });

  const handleSubmit = () => {
    if (!textInput.trim()) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please enter some text to parse.",
      });
      return;
    }
    mutation.mutate(textInput);
  };

  return (
    <Card className="shadow-lg border-2 border-dashed border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-headline">
          <SparklesIcon className="mr-2 h-5 w-5 text-primary" />
          {title || defaultTitles[type]}
        </CardTitle>
        {(description || defaultDescriptions[type]) && (
          <p className="text-sm text-muted-foreground">
            {description || defaultDescriptions[type]}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={placeholder || defaultPlaceholders[type]}
          rows={6}
          className="w-full resize-none"
          disabled={mutation.isPending}
        />
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setTextInput('')}
            disabled={mutation.isPending || !textInput.trim()}
          >
            Clear
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={mutation.isPending || !textInput.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {mutation.isPending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <SparklesIcon className="mr-2 h-4 w-4" />
                Parse with AI
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 