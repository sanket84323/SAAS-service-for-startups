import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Workspace } from '../types';
import { db } from '../services/mockData';
import { api } from '../services/api';
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface AppContextType {
  user: User | null;
  workspace: Workspace | null;
  workspaces: Workspace[];
  theme: 'light' | 'dark';
  toasts: Toast[];
  isLoading: boolean;
  login: (email: string, role: string, password?: string) => Promise<boolean>;
  logout: () => void;
  register: (firstName: string, lastName: string, email: string, password?: string, avatarUrl?: string) => Promise<boolean>;
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string, industry: string, description: string, targetAudience: string) => Promise<Workspace>;
  toggleTheme: () => void;
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
  refreshCredits: () => void;
  deductCredits: (amount: number) => boolean;
  updateWorkspace: (updated: Workspace) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize DB and load session on mount
  useEffect(() => {
    const token = localStorage.getItem('startupos_token');
    if (token) {
      api.getCurrentUser()
        .then(async ({ user, workspace: apiWorkspace }) => {
          if (user) setUser(user);
          if (apiWorkspace) {
            setWorkspace(apiWorkspace);
            setWorkspaces([apiWorkspace]);
          } else {
            const allWorkspaces = await db.getWorkspaces();
            setWorkspaces(allWorkspaces);
            if (allWorkspaces.length > 0) {
              const current = await db.getCurrentWorkspace();
              setWorkspace(current || allWorkspaces[0]);
            }
          }
        })
        .catch(() => {
          localStorage.removeItem('startupos_token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
    
    // Theme setup - apply BEFORE render to avoid flash
    const savedTheme = localStorage.getItem('startupos_theme') as 'light' | 'dark';
    if (savedTheme === 'light') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    } else {
      // Default is always dark
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('startupos_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    addToast(`Switched to ${nextTheme} mode`, 'info');
  };

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const login = async (email: string, role: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password || "password");
      localStorage.setItem('startupos_token', res.token);
      setUser(res.user);
      if (res.workspace) {
        setWorkspace(res.workspace);
        setWorkspaces([res.workspace]);
      }
      setIsLoading(false);
      addToast(`Welcome back, ${res.user.firstName}!`, 'success');
      return true;
    } catch (e: any) {
      addToast(e.message || 'Login failed', 'error');
      setIsLoading(false);
      return false;
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password?: string, avatarUrl?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.register(firstName, lastName, email, password || "password", "FOUNDER", `${firstName}'s Startup`, "Sustainability Tech", avatarUrl);
      localStorage.setItem('startupos_token', res.token);
      setUser(res.user);
      setWorkspace(res.workspace);
      setWorkspaces([res.workspace]);
      setIsLoading(false);
      addToast('Account created successfully!', 'success');
      return true;
    } catch (e: any) {
      addToast(e.message || 'Registration failed', 'error');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('startupos_token');
    setUser(null);
    setWorkspace(null);
    setWorkspaces([]);
    addToast('Signed out of session', 'info');
  };

  const switchWorkspace = (workspaceId: string) => {
    const matched = workspaces.find(w => w.id === workspaceId);
    if (matched) {
      setWorkspace(matched);
      addToast(`Switched workspace to ${matched.name}`, 'success');
    }
  };

  const createWorkspace = async (name: string, industry: string, description: string, targetAudience: string): Promise<Workspace> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    
    // Fallback or offline mock creation
    const newWs: Workspace = {
      id: 'wsp_' + Date.now(),
      name,
      industry,
      description,
      targetAudience,
      activePlan: 'FREE',
      creditsUsed: 0,
      creditsLimit: 1000,
      teamMembersCount: 1,
      createdAt: new Date().toISOString()
    };
    
    setWorkspace(newWs);
    setWorkspaces([newWs]);
    setIsLoading(false);
    addToast(`Workspace '${name}' created!`, 'success');
    return newWs;
  };

  const refreshCredits = () => {
    const token = localStorage.getItem('startupos_token');
    if (token) {
      api.getCurrentUser()
        .then(({ workspace }) => {
          if (workspace) setWorkspace(workspace);
        })
        .catch(() => {});
    }
  };

  const deductCredits = (amount: number): boolean => {
    if (!workspace) return false;
    setWorkspace(prev => prev ? { ...prev, creditsUsed: prev.creditsUsed + amount } : null);
    return true;
  };

  const updateWorkspace = (updated: Workspace) => {
    setWorkspace(updated);
    setWorkspaces(prev => prev.map(w => w.id === updated.id ? updated : w));
  };

  return (
    <AppContext.Provider value={{
      user, workspace, workspaces, theme, toasts, isLoading,
      login, logout, register, switchWorkspace, createWorkspace, toggleTheme,
      addToast, removeToast, refreshCredits, deductCredits, updateWorkspace
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
