"use client";

import { useState, useEffect } from 'react';
import { useApplicationsStore } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { toast } from "@/hooks/use-toast";
import type { ImportantDate } from '@/types';
import { format, parseISO } from 'date-fns';

interface DateDetailDialogProps {
    applicationId: string;
    date: ImportantDate | null;
    isOpen: boolean;
    onClose: () => void;
}

export function DateDetailDialog({ applicationId, date, isOpen, onClose }: DateDetailDialogProps) {
    const { savedApplications, updateApplication } = useApplicationsStore();
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (date) {
            setDescription(date.description);
            setNotes(date.notes || '');
        }
    }, [date]);

    if (!date) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const app = savedApplications.find(a => a.id === applicationId);
        if (!app) return;

        const updatedDates = (app.importantDates || []).map(d =>
            d.id === date.id
                ? { ...d, description: description.trim(), notes: notes.trim() }
                : d
        );

        await updateApplication(applicationId, { importantDates: updatedDates });

        toast({ title: "Date Updated", description: "The date details have been saved." });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Date Details</DialogTitle>
                    <DialogDescription>
                        Viewing details for: {format(parseISO(date.date), "MMMM d, yyyy")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="date-description">Description</Label>
                        <Input
                            id="date-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="date-notes">Notes</Label>
                        <Textarea
                            id="date-notes"
                            placeholder="Add any relevant notes here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
