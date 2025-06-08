
"use client";

import { create } from 'zustand';
import type { EmploymentHistory, Skills, Projects, SavedApplication, EmploymentEntry, SkillEntry, ProjectEntry } from '@/types';
import { toast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc, writeBatch, query, where } from 'firebase/firestore';

interface UserProfileState {
  userId: string | null;
  setUserId: (userId: string | null) => void;
  isLoadingProfile: boolean;
  employmentHistory: EmploymentEntry[];
  addEmploymentEntry: (entry: Omit<EmploymentEntry, 'id'>) => Promise<void>;
  updateEmploymentEntry: (id: string, entry: Partial<Omit<EmploymentEntry, 'id'>>) => Promise<void>;
  removeEmploymentEntry: (id: string) => Promise<void>;

  skills: SkillEntry[];
  addSkill: (skillData: { name: string; category?: string }) => Promise<void>;
  removeSkill: (id: string) => Promise<void>;

  projects: ProjectEntry[];
  addProjectEntry: (entry: Omit<ProjectEntry, 'id'>) => Promise<void>;
  updateProjectEntry: (id: string, entry: Partial<Omit<ProjectEntry, 'id'>>) => Promise<void>;
  removeProjectEntry: (id: string) => Promise<void>;
  
  backgroundInformation: string;
  setBackgroundInformation: (info: string) => Promise<void>;

  loadUserProfile: (userId: string) => Promise<void>;
  clearUserProfile: () => void;

  getAIEmploymentHistory: () => EmploymentHistory;
  getAISkills: () => Skills;
  getAIProjects: () => Projects;
}

const saveProfileToFirestore = async (userId: string, profileData: Partial<Pick<UserProfileState, 'employmentHistory' | 'skills' | 'projects' | 'backgroundInformation'>>) => {
  if (!userId) return;
  const profileRef = doc(db, 'users', userId, 'profile', 'data');
  
  const dataToSave: { [key: string]: any } = {};

  if (profileData.employmentHistory !== undefined) {
    dataToSave.employmentHistory = profileData.employmentHistory;
  }
  if (profileData.skills !== undefined) {
    dataToSave.skills = profileData.skills.map(s => ({ name: s.name, category: s.category || null, id: s.id }));
  }
  if (profileData.projects !== undefined) {
    dataToSave.projects = profileData.projects.map(p => ({
      ...p,
      skillsUsed: p.skillsUsed || [],
      link: p.link || null, 
    }));
  }
  if (profileData.backgroundInformation !== undefined) {
    dataToSave.backgroundInformation = profileData.backgroundInformation;
  }

  if (Object.keys(dataToSave).length > 0) {
    await setDoc(profileRef, dataToSave, { merge: true });
  }
};

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  userId: null,
  setUserId: (userId) => set({ userId }),
  isLoadingProfile: true,
  employmentHistory: [],
  skills: [],
  projects: [],
  backgroundInformation: '',

  loadUserProfile: async (userId) => {
    set({ isLoadingProfile: true, userId });
    const profileRef = doc(db, 'users', userId, 'profile', 'data');
    const docSnap = await getDoc(profileRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      set({
        employmentHistory: data.employmentHistory || [],
        skills: (data.skills || []).map((s: any) => ({ 
            id: s.id || Date.now().toString() + Math.random(), 
            name: s.name, 
            category: s.category === null ? undefined : s.category 
        })),
        projects: (data.projects || []).map((p: any) => ({
            ...p,
            id: p.id || Date.now().toString() + Math.random(),
            skillsUsed: p.skillsUsed || [], 
            link: p.link === null ? undefined : p.link, 
        })),
        backgroundInformation: data.backgroundInformation || '',
        isLoadingProfile: false,
      });
    } else {
      if (process.env.NODE_ENV === 'development' && (!userId || userId.startsWith('dummy_dev_user_id'))) { 
         set({
            employmentHistory: [
              { id: 'dev1', title: 'Software Engineer (Dev)', company: 'Tech Solutions Inc.', dates: 'Jan 2020 - Present', jobSummary: 'Dev summary for test.', description: 'Dev data for test description.' },
            ],
            skills: [{ id: 'devs1', name: 'DevSkill', category: 'DevCategory' }],
            projects: [{ 
              id: 'devp1', 
              name: 'Dev Project', 
              association: 'Personal', 
              dates: '2023', 
              skillsUsed: ['React', 'Firebase'], 
              roleDescription: 'Lead developer for this awesome dev project.',
              link: 'https://example.com/devproject'
            }],
            backgroundInformation: 'Dev background info.',
            isLoadingProfile: false,
         });
      } else {
        set({ isLoadingProfile: false }); 
      }
    }
  },
  clearUserProfile: () => set({
    employmentHistory: [],
    skills: [],
    projects: [],
    backgroundInformation: '',
    userId: null,
    isLoadingProfile: false,
  }),

  addEmploymentEntry: async (entry) => {
    const newEntry = { ...entry, id: Date.now().toString() };
    set((state) => ({ employmentHistory: [...state.employmentHistory, newEntry] }));
    await saveProfileToFirestore(get().userId!, { employmentHistory: get().employmentHistory });
  },
  updateEmploymentEntry: async (id, updatedEntry) => {
    set((state) => ({
      employmentHistory: state.employmentHistory.map(e => e.id === id ? {...e, ...updatedEntry} : e),
    }));
    await saveProfileToFirestore(get().userId!, { employmentHistory: get().employmentHistory });
  },
  removeEmploymentEntry: async (id) => {
    set((state) => ({ employmentHistory: state.employmentHistory.filter((e) => e.id !== id) }));
    await saveProfileToFirestore(get().userId!, { employmentHistory: get().employmentHistory });
  },

  addSkill: async (skillData) => {
    const trimmedName = skillData.name.trim();
    if (!trimmedName) return;
    
    const newSkill: SkillEntry = { 
      id: Date.now().toString() + Math.random().toString(36).substring(2, 15), // More unique ID
      name: trimmedName,
      category: skillData.category?.trim() || undefined 
    };

    // Check if a skill with the same name (case-insensitive) already exists
    if (get().skills.some(s => s.name.toLowerCase() === newSkill.name.toLowerCase())) {
        // Do not add if exact match (case-insensitive) already exists.
        // The calling function is responsible for deciding to use the existing skill.
        // No toast here to allow programmatic additions without user alerts.
        return; 
    }
    set((state) => ({ skills: [...state.skills, newSkill] }));
    await saveProfileToFirestore(get().userId!, { skills: get().skills });
  },
  removeSkill: async (id) => {
    set((state) => ({ skills: state.skills.filter((s) => s.id !== id) }));
    await saveProfileToFirestore(get().userId!, { skills: get().skills });
  },
  
  addProjectEntry: async (entry) => {
    const newEntry: ProjectEntry = { ...entry, id: Date.now().toString(), skillsUsed: entry.skillsUsed || [] };
    set((state) => ({ projects: [...state.projects, newEntry] }));
    await saveProfileToFirestore(get().userId!, { projects: get().projects });
  },
  updateProjectEntry: async (id, updatedEntry) => {
    set((state) => ({ 
      projects: state.projects.map(p => 
        p.id === id ? {...p, ...updatedEntry, skillsUsed: updatedEntry.skillsUsed || p.skillsUsed || [] } : p
      ) 
    }));
    await saveProfileToFirestore(get().userId!, { projects: get().projects });
  },
  removeProjectEntry: async (id) => {
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
    await saveProfileToFirestore(get().userId!, { projects: get().projects });
  },

  setBackgroundInformation: async (backgroundInformation) => {
    set({ backgroundInformation });
    await saveProfileToFirestore(get().userId!, { backgroundInformation });
  },

  getAIEmploymentHistory: () => get().employmentHistory.map(({ title, company, dates, description, jobSummary }) => ({ title, company, dates, description, jobSummary: jobSummary || '' })),
  getAISkills: () => get().skills.map(skill => skill.name), 
  getAIProjects: () => get().projects.map(({ name, association, dates, skillsUsed, roleDescription, link }) => ({ 
    name, 
    association, 
    dates, 
    skillsUsed: skillsUsed || [], 
    roleDescription, 
    link: link || undefined 
  })),
}));


interface ApplicationsState {
  userId: string | null;
  setUserId: (userId: string | null) => void;
  isLoadingApplications: boolean;
  savedApplications: SavedApplication[];
  addSavedApplication: (app: Omit<SavedApplication, 'id' | 'createdAt'>) => Promise<void>;
  removeSavedApplication: (id: string) => Promise<void>;
  loadSavedApplications: (userId: string) => Promise<void>;
  clearSavedApplications: () => void;
}

export const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  userId: null,
  setUserId: (userId) => set({ userId }),
  isLoadingApplications: true,
  savedApplications: [],

  loadSavedApplications: async (userId) => {
    set({ isLoadingApplications: true, userId });
    if (!userId) {
      set({ savedApplications: [], isLoadingApplications: false });
      return;
    }
    const appsCollectionRef = collection(db, 'users', userId, 'applications');
    const querySnapshot = await getDocs(appsCollectionRef);
    const apps: SavedApplication[] = [];
    querySnapshot.forEach((docSnap) => { 
      apps.push({ id: docSnap.id, ...docSnap.data() } as SavedApplication);
    });
    set({ savedApplications: apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), isLoadingApplications: false });
  },
  clearSavedApplications: () => set({ savedApplications: [], userId: null, isLoadingApplications: false }),

  addSavedApplication: async (app) => {
    const currentUserId = get().userId;
    if (!currentUserId) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to save an application." });
      return;
    }
    const newApp = { ...app, createdAt: new Date().toISOString() };
    const appsCollectionRef = collection(db, 'users', currentUserId, 'applications');
    
    try {
      const docRef = await addDoc(appsCollectionRef, newApp);
      const appWithId: SavedApplication = { ...newApp, id: docRef.id };
      set((state) => ({
        savedApplications: [appWithId, ...state.savedApplications].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      }));
      toast({ title: "Application Saved", description: `${app.jobTitle} application has been saved to cloud.` });
    } catch (error) {
      console.error("Error saving application to Firestore: ", error);
      toast({ variant: "destructive", title: "Save Failed", description: "Could not save application to cloud." });
    }
  },
  removeSavedApplication: async (id) => {
    const currentUserId = get().userId;
    if (!currentUserId) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return;
    }
    const appDocRef = doc(db, 'users', currentUserId, 'applications', id);
    try {
      await deleteDoc(appDocRef);
      set((state) => ({
        savedApplications: state.savedApplications.filter(app => app.id !== id)
      }));
      toast({ title: "Application Removed", description: `Application has been removed from cloud.` });
    } catch (error) {
      console.error("Error removing application from Firestore: ", error);
      toast({ variant: "destructive", title: "Removal Failed", description: "Could not remove application from cloud." });
    }
  }
}));

if (process.env.NODE_ENV === 'development') {
  const { userId, loadUserProfile, employmentHistory, skills, projects, backgroundInformation } = useUserProfileStore.getState();
  const isProfileEffectivelyEmpty = !userId && employmentHistory.length === 0 && skills.length === 0 && projects.length === 0 && !backgroundInformation;
  if (isProfileEffectivelyEmpty) { 
    loadUserProfile("dummy_dev_user_id_for_initial_load_if_needed");
  }
}

