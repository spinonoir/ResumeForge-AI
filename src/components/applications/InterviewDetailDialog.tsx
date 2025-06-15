"use client";

import { useState } from 'react';
import { useApplicationsStore } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { formatISO } from 'date-fns';
import type { ImportantDate } from '@/types';

interface InterviewDetailDialogProps {
    applicationId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function InterviewDetailDialog({ applicationId, isOpen, onClose }: InterviewDetailDialogProps) {
    const { savedApplications, updateApplication } = useApplicationsStore();
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewTime, setInterviewTime] = useState('');
    const [description, setDescription] = useState('Interview Scheduled');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!applicationId || !interviewDate || !description.trim()) {
            toast({ title: "Missing Information", description: "Please provide a date and description.", variant: "destructive" });
            return;
        }

        const app = savedApplications.find(a => a.id === applicationId);
        if (!app) return;

        try {
            const dateTimeString = `${interviewDate}T${interviewTime || '00:00:00'}`;
            const date = new Date(dateTimeString);

            const newInterviewDate: Omit<ImportantDate, 'id'> = {
                date: formatISO(date),
                description: description.trim(),
                isFollowUp: false,
            };
            
            // Create a new important date with a unique ID
            const newDateEntry = { ...newInterviewDate, id: Date.now().toString() };

            const updatedImportantDates = [...(app.importantDates || []), newDateEntry];

            await updateApplication(applicationId, { 
                status: 'interviewing',
                importantDates: updatedImportantDates
            });

            toast({ title: "Interview Added", description: "The interview has been added and status updated." });
            onClose();
        } catch (error) {
            toast({ title: "Invalid Date/Time", description: "Please enter a valid date and time.", variant: "destructive" });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Interview Details</DialogTitle>
                    <DialogDescription>
                        Log the date and time for your upcoming interview.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="interview-date">Interview Date</Label>
                        <Input
                            id="interview-date"
                            type="date"
                            value={interviewDate}
                            onChange={(e) => setInterviewDate(e.target.value)}
                            required
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="interview-time">Interview Time (Optional)</Label>
                        <Input
                            id="interview-time"
                            type="time"
                            value={interviewTime}
                            onChange={(e) => setInterviewTime(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Interview</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
