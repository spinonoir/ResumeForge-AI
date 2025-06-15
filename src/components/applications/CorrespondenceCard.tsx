"use client";

import { useState } from 'react';
import { useApplicationsStore } from '@/lib/store';
import type { SavedApplication, CorrespondenceEntry } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { MailIcon, PhoneIcon, UserCheckIcon, StickyNoteIcon, PlusCircleIcon, Loader2Icon } from 'lucide-react';

const correspondenceIcons = {
    email: <MailIcon className="h-4 w-4" />,
    phone: <PhoneIcon className="h-4 w-4" />,
    interview: <UserCheckIcon className="h-4 w-4" />,
    note: <StickyNoteIcon className="h-4 w-4" />,
};

interface CorrespondenceCardProps {
    application: SavedApplication;
}

export function CorrespondenceCard({ application }: CorrespondenceCardProps) {
    const { addCorrespondence } = useApplicationsStore();
    const [newEntryType, setNewEntryType] = useState<'email' | 'phone' | 'interview' | 'note'>('note');
    const [newEntryContent, setNewEntryContent] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEntryContent.trim()) {
            toast({
                title: "Content is empty",
                description: "Please enter some content for the correspondence.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        const newEntry: Omit<CorrespondenceEntry, 'id'> = {
            date: new Date().toISOString(),
            type: newEntryType,
            content: newEntryContent.trim()
        };

        await addCorrespondence(application.id, newEntry);
        
        setNewEntryContent('');
        setNewEntryType('note');
        setIsAdding(false);
        setIsSubmitting(false);
    };

    const sortedCorrespondence = (application.correspondence || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-headline">Correspondence Log</CardTitle>
                <CardDescription>Track all your interactions for this application.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-48 mb-4 border rounded-md p-2">
                    {sortedCorrespondence.length > 0 ? (
                        <ul className="space-y-3">
                            {sortedCorrespondence.map(entry => (
                                <li key={entry.id} className="flex items-start space-x-3">
                                    <span className="mt-1 text-primary">{correspondenceIcons[entry.type]}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold capitalize">{entry.type}</p>
                                        <p className="text-xs text-muted-foreground">{format(new Date(entry.date), "MMM d, yyyy, h:mm a")}</p>
                                        <p className="text-sm mt-1 whitespace-pre-wrap">{entry.content}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">No correspondence logged yet.</p>
                        </div>
                    )}
                </ScrollArea>
                
                {isAdding ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Select onValueChange={(value: any) => setNewEntryType(value)} defaultValue="note">
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="note">Note</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone Call</SelectItem>
                                <SelectItem value="interview">Interview</SelectItem>
                            </SelectContent>
                        </Select>
                        <Textarea
                            placeholder={`Content of ${newEntryType}...`}
                            value={newEntryContent}
                            onChange={(e) => setNewEntryContent(e.target.value)}
                            rows={4}
                            required
                        />
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                                Add Entry
                            </Button>
                        </div>
                    </form>
                ) : (
                    <Button onClick={() => setIsAdding(true)} className="w-full">
                        <PlusCircleIcon className="mr-2 h-4 w-4" /> Add New Entry
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
