"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '../ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

type ResumeTemplateType = "regular" | "compact" | "ultraCompact";

interface ResumeCustomizationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onGenerate: (template: ResumeTemplateType, color: string, pageLimit: number) => void;
  initialTemplate?: ResumeTemplateType;
  initialColor?: string;
  initialPageLimit?: number;
  isGenerating: boolean;
}

export function ResumeCustomizationDialog({
  isOpen,
  onOpenChange,
  onGenerate,
  initialTemplate = "regular",
  initialColor = "#64B5F6",
  initialPageLimit = 2,
  isGenerating,
}: ResumeCustomizationDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateType>(initialTemplate);
  const [accentColorInput, setAccentColorInput] = useState(initialColor);
  const [pageLimitInput, setPageLimitInput] = useState<number>(initialPageLimit);

  const handleGenerateClick = () => {
    onGenerate(selectedTemplate, accentColorInput, pageLimitInput);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate New Resume</DialogTitle>
          <DialogDescription>
            Choose your LaTeX resume template and customization options.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="resume-template">Resume Template</Label>
              <Select value={selectedTemplate} onValueChange={(value: ResumeTemplateType) => setSelectedTemplate(value)}>
                <SelectTrigger id="resume-template">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="ultraCompact">Ultra-compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-1">
              <Label htmlFor="accent-color-picker">Accent Color</Label>
              <div className="flex items-center gap-2 mt-1">
                 <Input
                    id="accent-color-picker"
                    type="color"
                    value={accentColorInput.startsWith('#') ? accentColorInput : '#000000'}
                    onChange={(e) => setAccentColorInput(e.target.value)}
                    className="h-10 w-12 p-1 rounded-md border"
                  />
                  <Input
                    id="accent-color-text"
                    type="text"
                    placeholder="e.g., #64B5F6 or Blue"
                    value={accentColorInput}
                    onChange={(e) => setAccentColorInput(e.target.value)}
                    className="flex-grow h-10"
                  />
              </div>
            </div>

            <div>
              <Label htmlFor="page-limit">Page Limit</Label>
              <Input
                id="page-limit"
                type="number"
                value={pageLimitInput}
                onChange={(e) => setPageLimitInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                min="1"
                max="5"
                className="mt-1"
              />
            </div>
          </div>
        </div>
        <DialogClose asChild>
           <Button onClick={handleGenerateClick} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
} 