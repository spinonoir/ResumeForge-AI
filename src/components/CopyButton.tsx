
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ClipboardCopyIcon, CheckIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CopyButtonProps {
  textToCopy: string;
  buttonSize?: "sm" | "default" | "lg" | "icon";
  className?: string;
}

export function CopyButton({ textToCopy, buttonSize = "icon", className }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!textToCopy) {
        toast({
            variant: "destructive",
            title: "Nothing to Copy",
            description: "The content is empty.",
        });
        return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast({
        title: "Copied to Clipboard!",
        description: "The content has been copied.",
      });
      setTimeout(() => setIsCopied(false), 2000); // Revert icon after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy the content to clipboard.",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size={buttonSize}
      onClick={handleCopy}
      className={cn("h-7 w-7 p-0 text-muted-foreground hover:text-primary", className)}
      aria-label="Copy to clipboard"
    >
      {isCopied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <ClipboardCopyIcon className="h-4 w-4" />}
    </Button>
  );
}

// Helper to add cn if not already present
import { cn as shadcnCn } from "@/lib/utils";
const cn = (...inputs: any[]) => shadcnCn(inputs);
