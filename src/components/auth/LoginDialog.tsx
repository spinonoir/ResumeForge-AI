
"use client";

import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase'; // Import googleProvider
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/hooks/use-toast';
import { Loader2Icon, ChromeIcon } from 'lucide-react'; // Added ChromeIcon for Google

interface LoginDialogProps {
  open: boolean;
  // onOpenChange is not used as dialog is controlled by auth state
}

export function LoginDialog({ open }: LoginDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthAction = async (action: 'login' | 'signup') => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (action === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Login Successful", description: "Welcome back!" });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Signup Successful", description: "Welcome to ResumeForge AI!" });
      }
      // Dialog will close automatically due to auth state change in parent
    } catch (err: any) {
      setError(err.message);
      toast({ variant: "destructive", title: "Authentication Failed", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      toast({ title: "Google Sign-In Successful", description: "Welcome to ResumeForge AI!" });
      // Dialog will close automatically
    } catch (err: any) {
      setError(err.message);
      toast({ variant: "destructive", title: "Google Sign-In Failed", description: err.message });
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => { /* Controlled by auth state */ }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ResumeForge AI</DialogTitle>
          <DialogDescription>
            Sign in or create an account to continue.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={(e) => { e.preventDefault(); handleAuthAction('login'); }} className="space-y-4 py-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting || isGoogleSubmitting}>
                {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={(e) => { e.preventDefault(); handleAuthAction('signup'); }} className="space-y-4 py-4">
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting || isGoogleSubmitting}>
                {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                Sign Up
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isGoogleSubmitting || isSubmitting}>
          {isGoogleSubmitting ? (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ChromeIcon className="mr-2 h-4 w-4" /> 
          )}
          Google
        </Button>
        {error && !isSubmitting && !isGoogleSubmitting && <p className="text-sm text-destructive mt-2 text-center">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
