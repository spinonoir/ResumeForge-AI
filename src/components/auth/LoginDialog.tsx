"use client";

import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
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
  const [currentAuthAction, setCurrentAuthAction] = useState<'login' | 'signup' | 'google' | null>(null);

  const handleAuthAction = async (actionType: 'login' | 'signup') => {
    setCurrentAuthAction(actionType);
    setIsSubmitting(true);
    setError(null);
    try {
      if (actionType === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Login Successful", description: "Welcome back!" });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Signup Successful", description: "Welcome to ResumeForge AI!" });
      }
      // Dialog will close automatically due to auth state change in parent
    } catch (err) {
      console.error(`${actionType} Error:`, err);
      const errorMessage = err instanceof FirebaseError ? `${err.code}: ${err.message}` : 'An unknown error occurred';
      setError(errorMessage);
      toast({ variant: "destructive", title: "Authentication Failed", description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setCurrentAuthAction('google');
    setIsGoogleSubmitting(true);
    setError(null);

    // Log current origin and configured authDomain for debugging
    console.log('Attempting Google Sign-In from origin:', window.location.origin);
    console.log('Firebase SDK configured authDomain:', auth.app.options.authDomain);

    try {
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, googleProvider);
      toast({ title: "Google Sign-In Successful", description: "Welcome to ResumeForge AI!" });
      // Dialog will close automatically
    } catch (err) {
      console.error("Google Sign-In Error:", err); 
      let errorMessage = 'An unknown error occurred';
      let errorTitle = "Google Sign-In Failed";

      if (err instanceof FirebaseError) {
        if (err.code === 'auth/unauthorized-domain') {
          errorTitle = "Unauthorized Domain";
          errorMessage = `Your app's domain (${window.location.origin}) is not authorized for Google Sign-In. 
          1. Open your browser's developer console (F12) to see the exact 'origin' and 'authDomain' logged.
          2. In your Firebase project (resumeforge-ai-2quwm) > Authentication > Settings > Authorized domains, ensure the EXACT origin logged in the console (e.g., http://localhost:9002) is listed.
          Changes may take a few minutes to apply. Firebase Error Code: ${err.code}`;
        } else if (err.code === 'auth/popup-closed-by-user') {
          errorMessage = "The sign-in popup was closed before authentication could complete. Please try again.";
          errorTitle = "Sign-In Cancelled";
        } else if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-blocked') {
          errorMessage = "The sign-in popup was cancelled or blocked by the browser. Please ensure popups are enabled for this site and try again.";
          errorTitle = "Popup Issue";
        } else {
          errorMessage = `${err.code}: ${err.message}`;
        }
      }
      setError(errorMessage);
      toast({ variant: "destructive", title: errorTitle, description: `Details: ${errorMessage.length > 150 ? errorMessage.substring(0,150) + '...' : errorMessage}. Check console for full error.`, duration: 10000 });
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
            <TabsTrigger value="login" onClick={() => { setError(null); setCurrentAuthAction('login'); }}>Login</TabsTrigger>
            <TabsTrigger value="signup" onClick={() => { setError(null); setCurrentAuthAction('signup'); }}>Sign Up</TabsTrigger>
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
              {error && currentAuthAction === 'login' && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting || isGoogleSubmitting}>
                {isSubmitting && currentAuthAction === 'login' && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
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
              {error && currentAuthAction === 'signup' && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting || isGoogleSubmitting}>
                {isSubmitting && currentAuthAction === 'signup' && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
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
        {error && currentAuthAction === 'google' && <p className="text-sm text-destructive mt-2 text-center">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}

