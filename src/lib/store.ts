"use client";

import { create } from 'zustand';
import type { EmploymentHistory, Skills, Projects, SavedApplication, EmploymentEntry, SkillEntry, ProjectEntry } from '@/types';
import {toast} from "@/hooks/use-toast";

interface UserProfileState {
  employmentHistory: EmploymentEntry[];
  addEmploymentEntry: (entry: Omit<EmploymentEntry, 'id'>) => void;
  updateEmploymentEntry: (id: string, entry: Partial<Omit<EmploymentEntry, 'id'>>) => void;
  removeEmploymentEntry: (id: string) => void;

  skills: SkillEntry[];
  addSkill: (skillName: string) => void;
  removeSkill: (id: string) => void;

  projects: ProjectEntry[];
  addProjectEntry: (entry: Omit<ProjectEntry, 'id'>) => void;
  updateProjectEntry: (id: string, entry: Partial<Omit<ProjectEntry, 'id'>>) => void;
  removeProjectEntry: (id: string) => void;
  
  backgroundInformation: string;
  setBackgroundInformation: (info: string) => void;

  // Derived AI-compatible formats
  getAIEmploymentHistory: () => EmploymentHistory;
  getAISkills: () => Skills;
  getAIProjects: () => Projects;
}

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  employmentHistory: [],
  addEmploymentEntry: (entry) => set((state) => ({
    employmentHistory: [...state.employmentHistory, { ...entry, id: Date.now().toString() }],
  })),
  updateEmploymentEntry: (id, updatedEntry) => set((state) => ({
    employmentHistory: state.employmentHistory.map(e => e.id === id ? {...e, ...updatedEntry} : e),
  })),
  removeEmploymentEntry: (id) => set((state) => ({
    employmentHistory: state.employmentHistory.filter((e) => e.id !== id),
  })),

  skills: [],
  addSkill: (skillName) => {
    if (!skillName.trim()) return;
    set((state) => ({
      skills: [...state.skills, { id: Date.now().toString(), name: skillName.trim() }],
    }));
  },
  removeSkill: (id) => set((state) => ({
    skills: state.skills.filter((s) => s.id !== id),
  })),
  
  projects: [],
  addProjectEntry: (entry) => set((state) => ({
    projects: [...state.projects, { ...entry, id: Date.now().toString() }],
  })),
  updateProjectEntry: (id, updatedEntry) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? {...p, ...updatedEntry} : p),
  })),
  removeProjectEntry: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
  })),

  backgroundInformation: '',
  setBackgroundInformation: (backgroundInformation) => set({ backgroundInformation }),

  getAIEmploymentHistory: () => {
    return get().employmentHistory.map(({ title, company, dates, description }) => ({ title, company, dates, description }));
  },
  getAISkills: () => {
    return get().skills.map(skill => skill.name);
  },
  getAIProjects: () => {
    return get().projects.map(({ name, description, link }) => ({ name, description, link: link || '' }));
  },
}));


interface ApplicationsState {
  savedApplications: SavedApplication[];
  addSavedApplication: (app: Omit<SavedApplication, 'id' | 'createdAt'>) => void;
  removeSavedApplication: (id: string) => void;
}

export const useApplicationsStore = create<ApplicationsState>((set) => ({
  savedApplications: [],
  addSavedApplication: (app) => {
    set((state) => ({
      savedApplications: [{ ...app, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...state.savedApplications],
    }));
    toast({ title: "Application Saved", description: `${app.jobTitle} application has been saved.` });
  },
  removeSavedApplication: (id) => {
     set((state) => ({
      savedApplications: state.savedApplications.filter(app => app.id !== id)
    }));
    toast({ title: "Application Removed", description: `Application has been removed.` });
  }
}));

// Example initial data for easier testing
if (process.env.NODE_ENV === 'development') {
  useUserProfileStore.setState({
    employmentHistory: [
      { id: '1', title: 'Software Engineer', company: 'Tech Solutions Inc.', dates: 'Jan 2020 - Present', description: 'Developed web applications using React and Node.js.' },
      { id: '2', title: 'Intern', company: 'Innovate Corp.', dates: 'Jun 2019 - Dec 2019', description: 'Assisted senior developers with testing and documentation.' },
    ],
    skills: [
      { id: 's1', name: 'JavaScript' },
      { id: 's2', name: 'React' },
      { id: 's3', name: 'Node.js' },
      { id: 's4', name: 'Python' },
    ],
    projects: [
      { id: 'p1', name: 'Personal Portfolio', description: 'A responsive website showcasing my projects.', link: 'https://example.com' },
      { id: 'p2', name: 'Task Management App', description: 'A full-stack application for managing daily tasks.' },
    ],
    backgroundInformation: 'A highly motivated software engineer with 3+ years of experience in web development, passionate about creating innovative solutions and continuously learning new technologies. Proven ability to work effectively in team environments and deliver high-quality software.',
  });
}
