"use client";

import { useState } from 'react';
import { useApplicationsStore } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { toast } from "@/hooks/use-toast";
import type { OfferDetails } from '@/types';

interface OfferDetailDialogProps {
    applicationId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function OfferDetailDialog({ applicationId, isOpen, onClose }: OfferDetailDialogProps) {
    const { updateApplication } = useApplicationsStore();
    const [payRate, setPayRate] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const offerDetails: OfferDetails = {
            payRate: payRate.trim(),
            notes: notes.trim(),
        };

        await updateApplication(applicationId, { status: 'offer', offerDetails });

        toast({ title: "Offer Details Saved", description: "Congratulations! The offer has been logged." });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log Offer Details</DialogTitle>
                    <DialogDescription>
                        Awesome news! Let's get the details of your offer recorded.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="pay-rate">Pay Rate / Salary (e.g., $120,000/year)</Label>
                        <Input
                            id="pay-rate"
                            value={payRate}
                            onChange={(e) => setPayRate(e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="offer-notes">Notes</Label>
                        <Textarea
                            id="offer-notes"
                            placeholder="e.g., 4 weeks PTO, 10% bonus, decision deadline is 12/15..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Offer</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
