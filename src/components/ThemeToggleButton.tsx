
"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from 'lucide-react';

export function ThemeToggleButton() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, systemTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder or null until mounted to avoid hydration mismatch
    // You can customize this placeholder (e.g., a Skeleton)
    return <Button variant="ghost" size="icon" className="h-8 w-8" disabled />;
  }

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8" // Match other header button sizes for consistency
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      aria-label={currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {currentTheme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </Button>
  );
}
