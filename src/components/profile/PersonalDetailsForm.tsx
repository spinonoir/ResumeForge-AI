"use client";

import { useUserProfileStore } from '@/lib/store';
import type { PersonalDetails } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle2Icon } from 'lucide-react';

export function PersonalDetailsForm() {
  const { personalDetails, setPersonalDetails } = useUserProfileStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalDetails({ ...personalDetails, [name]: value });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-headline">
          <UserCircle2Icon className="mr-2 h-6 w-6 text-primary" />
          Personal Details
        </CardTitle>
        <CardDescription>
          This information will be used to populate your resume and cover letter.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" value={personalDetails.name || ''} onChange={handleInputChange} placeholder="e.g., Jane Doe" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={personalDetails.email || ''} onChange={handleInputChange} placeholder="e.g., jane.doe@example.com" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" value={personalDetails.phone || ''} onChange={handleInputChange} placeholder="e.g., (123) 456-7890" />
        </div>
        <div>
          <Label htmlFor="address">Location</Label>
          <Input id="address" name="address" value={personalDetails.address || ''} onChange={handleInputChange} placeholder="e.g., San Francisco, CA" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input id="githubUrl" name="githubUrl" value={personalDetails.githubUrl || ''} onChange={handleInputChange} placeholder="e.g., https://github.com/yourusername" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
          <Input id="linkedinUrl" name="linkedinUrl" value={personalDetails.linkedinUrl || ''} onChange={handleInputChange} placeholder="e.g., https://linkedin.com/in/yourusername" />
        </div>
      </CardContent>
    </Card>
  );
} 