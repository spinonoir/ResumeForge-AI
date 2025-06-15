"use client";

import { useState } from 'react';
import { useApplicationsStore } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { toast } from "@/hooks/use-toast";
import type { RejectionDetails } from '@/types';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RejectionDetailDialogProps {
    applicationId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function RejectionDetailDialog({ applicationId, isOpen, onClose }: RejectionDetailDialogProps) {
    const { updateApplication } = useApplicationsStore();
    const [rejectedBy, setRejectedBy] = useState<'user' | 'company'>('company');
    const [reason, setReason] = useState('');
    const [takeaways, setTakeaways] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const rejectionDetails: RejectionDetails = {
            rejectedBy,
            reason: reason.trim(),
            takeaways: takeaways.trim(),
        };

        await updateApplication(applicationId, { status: 'rejected', rejectionDetails });

        toast({ title: "Rejection Details Saved", description: "The application has been updated." });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log Rejection Details</DialogTitle>
                    <DialogDescription>
                        It happens. Capturing a few details can provide valuable lessons.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Who ended the process?</Label>
                        <RadioGroup defaultValue="company" value={rejectedBy} onValueChange={(value: any) => setRejectedBy(value)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="company" id="r-company" />
                                <Label htmlFor="r-company">The Company</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="user" id="r-user" />
                                <Label htmlFor="r-user">I withdrew my application</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rejection-reason">Reason (Optional)</Label>
                        <Textarea
                            id="rejection-reason"
                            placeholder="e.g., 'Position was filled internally', 'Decided role wasn't a good fit...'"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={2}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="rejection-takeaways">Takeaways / Lessons Learned (Optional)</Label>
                        <Textarea
                            id="rejection-takeaways"
                            placeholder="e.g., 'Need to study system design more', 'Ask about team culture earlier...'"
                            value={takeaways}
                            onChange={(e) => setTakeaways(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Details</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
