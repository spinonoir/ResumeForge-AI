"use client";

import { create } from 'zustand';
import type {
  EmploymentHistory, Skills, Projects, SavedApplication,
  EmploymentEntry, SkillEntry, ProjectEntry, PersonalDetails, EducationEntry, SocialMediaLink,
  Resume
} from '@/types';
import { toast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const generateUniqueId = uuidv4;

const defaultPersonalDetails: PersonalDetails = {
  name: '',
  email: '',
  phone: '',
  address: '',
  githubUrl: '',
  linkedinUrl: '',
  socialMediaLinks: [],
};

export interface UserProfileState {
  userId: string | null;
  setUserId: (userId: string | null) => void;
  isLoadingProfile: boolean;

  personalDetails: PersonalDetails;
  setPersonalDetails: (details: PersonalDetails) => Promise<void>;

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

  educationHistory: EducationEntry[];
  addEducationEntry: (entry: Omit<EducationEntry, 'id'>) => Promise<void>;
  updateEducationEntry: (id: string, entry: Partial<Omit<EducationEntry, 'id'>>) => Promise<void>;
  removeEducationEntry: (id: string) => Promise<void>;

  backgroundInformation: string;
  setBackgroundInformation: (info: string) => Promise<void>;

  loadUserProfile: (userId: string) => Promise<void>;
  clearUserProfile: () => void;

  getAIPersonalDetails: () => PersonalDetails;
  getAIEducationHistory: () => EducationEntry[];
  getAIEmploymentHistory: () => EmploymentHistory;
  getAISkills: () => Skills;
  getAIProjects: () => Projects;
}

const saveProfileToFirestore = async (userId: string, profileData: Partial<Pick<UserProfileState, 'personalDetails' | 'employmentHistory' | 'skills' | 'projects' | 'educationHistory' | 'backgroundInformation'>>) => {
  if (!userId) return;
  const profileRef = doc(db, 'users', userId, 'profile', 'data');

  const dataToSave: { [key: string]: any } = {};

  if (profileData.personalDetails !== undefined) {
    dataToSave.personalDetails = {
      ...defaultPersonalDetails,
      ...profileData.personalDetails,
      socialMediaLinks: (profileData.personalDetails.socialMediaLinks || []).map(sm => ({ platform: sm.platform, url: sm.url, id: sm.id || generateUniqueId()})),
    };
  }
  if (profileData.employmentHistory !== undefined) {
    dataToSave.employmentHistory = profileData.employmentHistory.map(eh => ({
      ...eh,
      skillsDemonstrated: eh.skillsDemonstrated || [],
      jobSummary: eh.jobSummary || '',
      description: eh.description || '',
    }));
  }
  if (profileData.skills !== undefined) {
    dataToSave.skills = profileData.skills.map(s => ({ name: s.name, category: s.category || null, id: s.id }));
  }
  if (profileData.projects !== undefined) {
    dataToSave.projects = profileData.projects.map(p => ({
      ...p,
      skillsUsed: p.skillsUsed || [],
      link: p.link || null,
      roleDescription: p.roleDescription || '',
    }));
  }
  if (profileData.educationHistory !== undefined) {
    dataToSave.educationHistory = profileData.educationHistory.map(edu => ({
      ...edu,
      fieldOfStudy: edu.fieldOfStudy || '',
      gpa: edu.gpa || '',
      accomplishments: edu.accomplishments || '',
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
  personalDetails: {...defaultPersonalDetails},
  employmentHistory: [],
  skills: [],
  projects: [],
  educationHistory: [],
  backgroundInformation: '',

  loadUserProfile: async (userId) => {
    set({ isLoadingProfile: true, userId });
    const profileRef = doc(db, 'users', userId, 'profile', 'data');
    const docSnap = await getDoc(profileRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      set({
        personalDetails: {
            ...defaultPersonalDetails,
            ...(data.personalDetails || {}),
            socialMediaLinks: (data.personalDetails?.socialMediaLinks || []).map((sm: any) => ({...sm, id: sm.id || generateUniqueId()}))
        },
        employmentHistory: (data.employmentHistory || []).map((eh: any) => ({
            ...eh,
            id: eh.id || generateUniqueId(),
            skillsDemonstrated: eh.skillsDemonstrated || [],
            jobSummary: eh.jobSummary || '',
            description: eh.description || '',
        })),
        skills: (data.skills || []).map((s: any) => ({
            id: s.id || generateUniqueId(),
            name: s.name,
            category: s.category === null ? undefined : s.category
        })),
        projects: (data.projects || []).map((p: any) => ({
            ...p,
            id: p.id || generateUniqueId(),
            skillsUsed: p.skillsUsed || [],
            link: p.link === null ? undefined : p.link,
            roleDescription: p.roleDescription || '',
        })),
        educationHistory: (data.educationHistory || []).map((edu: any) => ({
            ...edu,
            id: edu.id || generateUniqueId(),
            fieldOfStudy: edu.fieldOfStudy || '',
            gpa: edu.gpa || '',
            accomplishments: edu.accomplishments || '',
        })),
        backgroundInformation: data.backgroundInformation || '',
        isLoadingProfile: false,
      });
    } else {
      if (process.env.NODE_ENV === 'development' && (!userId || userId.startsWith('dummy_dev_user_id'))) {
         set({
            personalDetails: { ...defaultPersonalDetails, name: "Dev User", email: "dev@example.com"},
            employmentHistory: [
              { id: 'dev1', title: 'Software Engineer (Dev)', company: 'Tech Solutions Inc.', dates: 'Jan 2020 - Present', jobSummary: 'Dev summary for test.', description: 'Dev data for test description.', skillsDemonstrated: ['React', 'Node.js'] },
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
            educationHistory: [{ id: 'devedu1', institution: 'Dev University', degree: 'B.S. Computer Science', dates: '2016-2020', fieldOfStudy: 'Computer Science', gpa: '3.8', accomplishments: 'Graduated with honors. Dean\'s List all semesters.' }],
            backgroundInformation: 'Dev background info.',
            isLoadingProfile: false,
         });
      } else {
        set({ isLoadingProfile: false, personalDetails: {...defaultPersonalDetails}, educationHistory: [] });
      }
    }
  },
  clearUserProfile: () => set({
    personalDetails: {...defaultPersonalDetails},
    employmentHistory: [],
    skills: [],
    projects: [],
    educationHistory: [],
    backgroundInformation: '',
    userId: null,
    isLoadingProfile: false,
  }),

  setPersonalDetails: async (details) => {
    const newDetails = { ...get().personalDetails, ...details };
    set({ personalDetails: newDetails });
    await saveProfileToFirestore(get().userId!, { personalDetails: newDetails });
  },

  addEmploymentEntry: async (entry) => {
    const newEntry: EmploymentEntry = { ...entry, id: generateUniqueId(), skillsDemonstrated: entry.skillsDemonstrated || [], description: entry.description || '' };
    set((state) => ({ employmentHistory: [...state.employmentHistory, newEntry] }));
    await saveProfileToFirestore(get().userId!, { employmentHistory: get().employmentHistory });
  },
  updateEmploymentEntry: async (id, updatedEntry) => {
    set((state) => ({
      employmentHistory: state.employmentHistory.map(e =>
        e.id === id ? {...e, ...updatedEntry, skillsDemonstrated: updatedEntry.skillsDemonstrated || e.skillsDemonstrated || [], description: updatedEntry.description || e.description || ''} : e
      ),
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
      id: generateUniqueId(),
      name: trimmedName,
      category: skillData.category?.trim() || undefined
    };

    if (get().skills.some(s => s.name.toLowerCase() === newSkill.name.toLowerCase())) {
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
    const newEntry: ProjectEntry = { ...entry, id: generateUniqueId(), skillsUsed: entry.skillsUsed || [], roleDescription: entry.roleDescription || '' };
    set((state) => ({ projects: [...state.projects, newEntry] }));
    await saveProfileToFirestore(get().userId!, { projects: get().projects });
  },
  updateProjectEntry: async (id, updatedEntry) => {
    set((state) => ({
      projects: state.projects.map(p =>
        p.id === id ? {...p, ...updatedEntry, skillsUsed: updatedEntry.skillsUsed || p.skillsUsed || [], roleDescription: updatedEntry.roleDescription || p.roleDescription || '' } : p
      )
    }));
    await saveProfileToFirestore(get().userId!, { projects: get().projects });
  },
  removeProjectEntry: async (id) => {
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
    await saveProfileToFirestore(get().userId!, { projects: get().projects });
  },

  addEducationEntry: async (entry) => {
    const newEntry: EducationEntry = { ...entry, id: generateUniqueId(), fieldOfStudy: entry.fieldOfStudy || '', gpa: entry.gpa || '', accomplishments: entry.accomplishments || '' };
    set((state) => ({ educationHistory: [...state.educationHistory, newEntry] }));
    await saveProfileToFirestore(get().userId!, { educationHistory: get().educationHistory });
  },
  updateEducationEntry: async (id, updatedEntry) => {
    set((state) => ({
      educationHistory: state.educationHistory.map(e => e.id === id ? {...e, ...updatedEntry, fieldOfStudy: updatedEntry.fieldOfStudy || e.fieldOfStudy || '', gpa: updatedEntry.gpa || e.gpa || '', accomplishments: updatedEntry.accomplishments || e.accomplishments || '' } : e)
    }));
    await saveProfileToFirestore(get().userId!, { educationHistory: get().educationHistory });
  },
  removeEducationEntry: async (id) => {
    set((state) => ({ educationHistory: state.educationHistory.filter((e) => e.id !== id) }));
    await saveProfileToFirestore(get().userId!, { educationHistory: get().educationHistory });
  },

  setBackgroundInformation: async (backgroundInformation) => {
    set({ backgroundInformation });
    await saveProfileToFirestore(get().userId!, { backgroundInformation });
  },

  getAIPersonalDetails: () => get().personalDetails,
  getAIEducationHistory: () => get().educationHistory.map(edu => ({
    ...edu,
    fieldOfStudy: edu.fieldOfStudy || undefined,
    gpa: edu.gpa || undefined,
    accomplishments: edu.accomplishments || undefined,
  })),
  getAIEmploymentHistory: () => get().employmentHistory.map(({ title, company, dates, description, jobSummary, skillsDemonstrated }) => ({ title, company, dates, description: description || '', jobSummary: jobSummary || '', skillsDemonstrated: skillsDemonstrated || [] })),
  getAISkills: () => get().skills.map(skill => skill.name),
  getAIProjects: () => get().projects.map(({ name, association, dates, skillsUsed, roleDescription, link }) => ({
    name,
    association,
    dates,
    skillsUsed: skillsUsed || [],
    roleDescription: roleDescription || '',
    link: link || undefined
  })),
}));


interface ApplicationsState {
  userId: string | null;
  setUserId: (userId: string | null) => void;
  isLoadingApplications: boolean;
  savedApplications: SavedApplication[];
  addSavedApplication: (appData: Omit<SavedApplication, 'id' | 'createdAt'>) => Promise<boolean>;
  removeSavedApplication: (id: string) => Promise<void>;
  loadSavedApplications: (userId: string) => Promise<void>;
  clearSavedApplications: () => void;
  addResumeToApplication: (applicationId: string, resumeData: Omit<Resume, 'id' | 'createdAt' | 'isStarred'>) => Promise<void>;
  updateResumeInApplication: (applicationId: string, resumeId: string, resumeData: Partial<Omit<Resume, 'id'>>) => Promise<void>;
  removeResumeFromApplication: (applicationId: string, resumeId: string) => Promise<void>;
  starResume: (applicationId: string, resumeId: string) => Promise<void>;
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
      const data = docSnap.data();
      
      let resumes: Resume[] = data.resumes || [];
      if (!data.resumes && data.generatedResumeLatex) {
          resumes = [{
              id: generateUniqueId(),
              name: 'Imported Resume',
              createdAt: data.createdAt,
              templateUsed: data.resumeTemplateUsed || 'classic',
              accentColorUsed: data.accentColorUsed || '#000000',
              pageLimitUsed: data.pageLimitUsed || 1,
              generatedResumeLatex: data.generatedResumeLatex,
              generatedResumeMarkdown: data.generatedResumeMarkdown || '',
              isStarred: true,
          }];
      }

      apps.push({
        id: docSnap.id,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        jobDescription: data.jobDescription,
        generatedCoverLetter: data.generatedCoverLetter,
        generatedSummary: data.generatedSummary,
        matchAnalysis: data.matchAnalysis,
        createdAt: data.createdAt,
        resumes,
       } as SavedApplication);
    });
    set({ savedApplications: apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), isLoadingApplications: false });
  },
  clearSavedApplications: () => set({ savedApplications: [], userId: null, isLoadingApplications: false }),

  addSavedApplication: async (appData) => {
    const currentUserId = get().userId;
    if (!currentUserId) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to save an application." });
      return false;
    }
    const newApp = { ...appData, createdAt: new Date().toISOString() };
    const appsCollectionRef = collection(db, 'users', currentUserId, 'applications');

    try {
      const docRef = await addDoc(appsCollectionRef, newApp);
      const appWithId: SavedApplication = { ...newApp, id: docRef.id };
      set((state) => ({
        savedApplications: [appWithId, ...state.savedApplications].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      }));
      toast({ title: "Application Saved", description: `${appData.jobTitle} application has been saved to cloud.` });
      return true;
    } catch (error) {
      console.error("Error saving application to Firestore: ", error);
      toast({ variant: "destructive", title: "Save Failed", description: "Could not save application to cloud." });
      return false;
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
  },

  addResumeToApplication: async (applicationId, resumeData) => {
    const { userId, savedApplications } = get();
    if (!userId) return;

    const newResume: Resume = {
      ...resumeData,
      id: generateUniqueId(),
      createdAt: new Date().toISOString(),
      isStarred: false,
    };

    const updatedApplications = savedApplications.map(app => {
      if (app.id === applicationId) {
        const updatedResumes = [...(app.resumes || []), newResume];
        return { ...app, resumes: updatedResumes };
      }
      return app;
    });

    set({ savedApplications: updatedApplications });

    const appRef = doc(db, 'users', userId, 'applications', applicationId);
    const appToUpdate = updatedApplications.find(app => app.id === applicationId);
    if (appToUpdate) {
      await updateDoc(appRef, { resumes: appToUpdate.resumes });
    }
  },

  updateResumeInApplication: async (applicationId, resumeId, resumeData) => {
    const { userId, savedApplications } = get();
    if (!userId) return;

    const updatedApplications = savedApplications.map(app => {
      if (app.id === applicationId) {
        const updatedResumes = (app.resumes || []).map(resume => {
          if (resume.id === resumeId) {
            return { ...resume, ...resumeData };
          }
          return resume;
        });
        return { ...app, resumes: updatedResumes };
      }
      return app;
    });

    set({ savedApplications: updatedApplications });

    const appRef = doc(db, 'users', userId, 'applications', applicationId);
    const appToUpdate = updatedApplications.find(app => app.id === applicationId);
    if (appToUpdate) {
      await updateDoc(appRef, { resumes: appToUpdate.resumes });
    }
  },

  removeResumeFromApplication: async (applicationId, resumeId) => {
    const { userId, savedApplications } = get();
    if (!userId) return;

    const updatedApplications = savedApplications.map(app => {
      if (app.id === applicationId) {
        const updatedResumes = (app.resumes || []).filter(resume => resume.id !== resumeId);
        return { ...app, resumes: updatedResumes };
      }
      return app;
    });

    set({ savedApplications: updatedApplications });

    const appRef = doc(db, 'users', userId, 'applications', applicationId);
    const appToUpdate = updatedApplications.find(app => app.id === applicationId);
    if (appToUpdate) {
      await updateDoc(appRef, { resumes: appToUpdate.resumes });
    }
  },

  starResume: async (applicationId, resumeId) => {
    const { userId, savedApplications } = get();
    if (!userId) return;

    const updatedApplications = savedApplications.map(app => {
      if (app.id === applicationId) {
        const updatedResumes = (app.resumes || []).map(resume => ({
          ...resume,
          isStarred: resume.id === resumeId,
        }));
        return { ...app, resumes: updatedResumes };
      }
      return app;
    });

    set({ savedApplications: updatedApplications });

    const appRef = doc(db, 'users', userId, 'applications', applicationId);
    const appToUpdate = updatedApplications.find(app => app.id === applicationId);
    if (appToUpdate) {
      await updateDoc(appRef, { resumes: appToUpdate.resumes });
    }
  },
}));

