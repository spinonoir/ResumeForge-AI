"use client";

import {
  buildBackgroundInformation,
  type BackgroundInformationInput,
  type BackgroundInformationOutput,
} from "../../../services/scoring-engine/src/ai/flows/background-information-builder";
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useUserProfileStore } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BotIcon, UserIcon, SendIcon, SparklesIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '../ui/skeleton';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

const initialQuestion = "Let's craft a compelling professional background summary. To start, could you briefly describe your main area of expertise or your current role?";

export function BackgroundBuilder() {
  const { backgroundInformation, setBackgroundInformation } = useUserProfileStore();
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [previousAnswers, setPreviousAnswers] = useState<string[]>([]);
  const [accumulatedBg, setAccumulatedBg] = useState(backgroundInformation || '');
  const [isDone, setIsDone] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation<BackgroundInformationOutput, Error, BackgroundInformationInput>({
    mutationFn: buildBackgroundInformation,
    onSuccess: (data) => {
      setAccumulatedBg(data.updatedBackground);
      if (data.isDone) {
        setIsDone(true);
        setCurrentQuestion('');
        setBackgroundInformation(data.updatedBackground); 
        setChatHistory(prev => [...prev, { sender: 'ai', text: "Great! We've compiled your background information. You can see it below and edit it if needed." }]);
      } else {
        setCurrentQuestion(data.nextQuestion);
        setChatHistory(prev => [...prev, { sender: 'ai', text: data.nextQuestion }]);
      }
    },
    onError: (error) => {
      setChatHistory(prev => [...prev, { sender: 'ai', text: `An error occurred: ${error.message}. Please try again.` }]);
    }
  });

  useEffect(() => {
    // Initialize chat with the first AI question if not already done
    if (chatHistory.length === 0 && !isDone) {
      setChatHistory([{ sender: 'ai', text: currentQuestion }]);
    }
  }, [currentQuestion, chatHistory.length, isDone]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleSend = () => {
    if (!userInput.trim() || mutation.isPending || isDone) return;

    const newUserMessage: ChatMessage = { sender: 'user', text: userInput };
    setChatHistory(prev => [...prev, newUserMessage]);
    
    const newPreviousAnswers = [...previousAnswers, userInput];
    setPreviousAnswers(newPreviousAnswers);

    mutation.mutate({
      question: currentQuestion,
      previousAnswers: newPreviousAnswers,
      accumulatedBackground: accumulatedBg
    });
    setUserInput('');
  };

  const handleEditFinalBackground = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAccumulatedBg(e.target.value);
    setBackgroundInformation(e.target.value);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-headline">
          <SparklesIcon className="mr-2 h-5 w-5 text-primary" />
          AI Background Builder
        </CardTitle>
        <CardDescription>
          Let our AI assistant help you craft a compelling professional background summary through a guided conversation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isDone ? (
          <>
            <ScrollArea className="h-64 w-full rounded-md border p-4 mb-4" ref={scrollAreaRef}>
              {chatHistory.map((msg, index) => (
                <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                    <div className="flex items-center mb-1">
                      {msg.sender === 'ai' ? <BotIcon className="h-5 w-5 mr-2" /> : <UserIcon className="h-5 w-5 mr-2" />}
                      <span className="font-semibold text-sm">{msg.sender === 'ai' ? 'AI Assistant' : 'You'}</span>
                    </div>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              {mutation.isPending && (
                <div className="flex mb-3 justify-start">
                   <div className="p-3 rounded-lg max-w-[80%] bg-secondary text-secondary-foreground">
                    <div className="flex items-center mb-1">
                      <BotIcon className="h-5 w-5 mr-2" /> 
                      <span className="font-semibold text-sm">AI Assistant</span>
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              )}
            </ScrollArea>
            <div className="flex items-center space-x-2">
              <Textarea
                placeholder="Type your answer here..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                rows={2}
                className="flex-grow"
                disabled={mutation.isPending || isDone}
              />
              <Button onClick={handleSend} disabled={mutation.isPending || isDone || !userInput.trim()} aria-label="Send message">
                <SendIcon className="h-5 w-5" />
              </Button>
            </div>
             {mutation.isError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{mutation.error.message}</AlertDescription>
                </Alert>
              )}
          </>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-2 font-headline">Your Generated Background Information:</h3>
            <Textarea
              value={accumulatedBg}
              onChange={handleEditFinalBackground}
              rows={8}
              className="w-full p-2 border rounded-md"
              placeholder="Your background information will appear here."
            />
            <p className="text-sm text-muted-foreground mt-2">You can edit this information directly.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isDone && (
          <Button variant="outline" onClick={() => {
            setIsDone(false);
            setCurrentQuestion(initialQuestion);
            setChatHistory([{ sender: 'ai', text: initialQuestion }]);
            setPreviousAnswers([]);
            // Keep accumulatedBg for potential restart
          }}>
            Restart Conversation
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
