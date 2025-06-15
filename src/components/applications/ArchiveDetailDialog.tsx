"use client";

import { useState } from 'react';
import { useApplicationsStore } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { toast } from "@/hooks/use-toast";
import type { ArchiveDetails } from '@/types';

interface ArchiveDetailDialogProps {
    applicationId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ArchiveDetailDialog({ applicationId, isOpen, onClose }: ArchiveDetailDialogProps) {
    const { updateApplication } = useApplicationsStore();
    const [reason, setReason] = useState('');
    const [takeaways, setTakeaways] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const archiveDetails: ArchiveDetails = {
            reason: reason.trim(),
            takeaways: takeaways.trim(),
        };

        await updateApplication(applicationId, { status: 'archived', archiveDetails });

        toast({ title: "Application Archived", description: "The application has been moved to your archive." });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Archive Application</DialogTitle>
                    <DialogDescription>
                        Add some optional context for why this application is being archived.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="archive-reason">Reason for Archiving (Optional)</Label>
                        <Textarea
                            id="archive-reason"
                            placeholder="e.g., 'Job posting was taken down', 'Not interested anymore...'"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={2}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="archive-takeaways">Takeaways / Notes (Optional)</Label>
                        <Textarea
                            id="archive-takeaways"
                            placeholder="e.g., 'Company seems to be hiring a lot in this area...'"
                            value={takeaways}
                            onChange={(e) => setTakeaways(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Archive</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
