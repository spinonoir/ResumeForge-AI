"use client";

import { useState } from 'react';
import type { SavedApplication, ImportantDate } from '@/types';
import { useApplicationsStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isFuture, isPast, formatISO } from 'date-fns';
import { CalendarIcon, CalendarCheckIcon, CalendarClockIcon, PlusCircleIcon, Trash2Icon, XIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { DateDetailDialog } from './DateDetailDialog';

interface DatesCardProps {
    application: SavedApplication;
}

export function DatesCard({ application }: DatesCardProps) {
    const { addImportantDate, removeImportantDate, updateApplication } = useApplicationsStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [selectedDate, setSelectedDate] = useState<ImportantDate | null>(null);

    const allDates = [
        ...(application.submissionDate ? [{ id: 'submission-date', date: application.submissionDate, description: 'Application Submitted', type: 'submission', isFollowUp: false, notes: '' }] : []),
        ...(application.importantDates || []).map(d => ({ ...d, date: d.date, description: d.description, type: d.isFollowUp ? 'follow-up' : 'general' }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const getStatus = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isPast(date)) return <Badge variant="secondary">Completed</Badge>;
        if (isFuture(date)) return <Badge variant="default">Upcoming</Badge>;
        return <Badge variant="outline">Today</Badge>;
    };

    const handleAddDate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDate || !newDesc.trim()) {
            toast({ title: "Missing Information", description: "Please provide both a date and a description.", variant: "destructive" });
            return;
        }
        
        try {
            const date = new Date(newDate);
            await addImportantDate(application.id, {
                date: formatISO(date),
                description: newDesc.trim(),
                isFollowUp: false,
            });
            setNewDate('');
            setNewDesc('');
            setIsAdding(false);
            toast({ title: "Date Added", description: "The new date has been added to your tracker."});
        } catch (error) {
            toast({ title: "Invalid Date", description: "Please enter a valid date.", variant: "destructive" });
        }
    };
    
    const handleRemoveDate = async (dateId: string) => {
        if(window.confirm("Are you sure you want to delete this date?")) {
            if (dateId === 'submission-date') {
                // Removing submission date should revert status to 'saved' and clear the follow-up
                await updateApplication(application.id, { submissionDate: undefined, status: 'saved' });
                toast({ title: "Submission Date Removed", description: "Application status has been reverted to 'Saved'."});
            } else {
                await removeImportantDate(application.id, dateId);
                toast({ title: "Date Removed", description: "The date has been removed from your tracker."});
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-headline">Key Dates & Follow-ups</CardTitle>
                <CardDescription>Important dates and reminders for this application.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4 mb-4">
                    {allDates.length > 0 ? allDates.map((item) => (
                        <li key={item.id} className="flex items-center space-x-3 group cursor-pointer hover:bg-secondary/50 p-2 rounded-md" onClick={() => item.type !== 'submission' && setSelectedDate(item as ImportantDate)}>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                {item.type === 'submission' ? <CalendarCheckIcon className="h-5 w-5" /> : 
                                 item.type === 'follow-up' ? <CalendarClockIcon className="h-5 w-5" /> :
                                 <CalendarIcon className="h-5 w-5" />}
                            </span>
                            <div className="flex-1">
                                <p className="font-semibold">{item.description}</p>
                                <p className="text-sm text-muted-foreground">{format(new Date(item.date), "EEEE, MMMM d, yyyy")}</p>
                            </div>
                            {getStatus(item.date)}
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleRemoveDate(item.id)}}>
                                <Trash2Icon className="h-4 w-4" />
                            </Button>
                        </li>
                    )) : (
                        <div className="flex items-center justify-center py-4">
                            <p className="text-muted-foreground">No key dates recorded.</p>
                        </div>
                    )}
                </ul>
                
                {isAdding ? (
                    <form onSubmit={handleAddDate} className="space-y-2 p-2 border rounded-md">
                        <Input 
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            required
                        />
                        <Input 
                            placeholder="Description (e.g., 'Second Interview')"
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            required
                        />
                        <div className="flex justify-end space-x-2 pt-2">
                           <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
                           <Button type="submit" size="sm">Save Date</Button>
                        </div>
                    </form>
                ) : (
                    <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full">
                        <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Date
                    </Button>
                )}
            </CardContent>
            <DateDetailDialog 
                applicationId={application.id}
                date={selectedDate}
                isOpen={!!selectedDate}
                onClose={() => setSelectedDate(null)}
            />
        </Card>
    );
}
