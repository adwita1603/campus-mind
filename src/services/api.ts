
import { ClassInfo, UserProfile, StudentStats, Task } from '../types';

/**
 * CAMPUSMIND API SERVICE (MVP VERSION)
 * 
 * To move to a REAL BACKEND (Supabase/Firebase/Node):
 * 1. Replace the localStorage logic with 'fetch()' or 'axios' calls.
 * 2. The rest of the app will continue to work perfectly because it depends on these interfaces.
 */

const DB_KEYS = {
  CLASSES: 'campusmind_db_classes',
  USERS: 'campusmind_db_users',
  SESSION: 'campusmind_session_user'
};

// Real-time synchronization channel (Works like WebSockets in the browser)
const syncChannel = new BroadcastChannel('campusmind_realtime_sync');

export const apiClient = {
  // --- AUTH OPERATIONS ---
  // PRO TIP: In production, use JWT or Session Cookies here.
  getCurrentUser: (): UserProfile | null => {
    const saved = localStorage.getItem(DB_KEYS.SESSION);
    return saved ? JSON.parse(saved) : null;
  },

  saveSession: (user: UserProfile) => {
    localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(user));
  },

  clearSession: () => {
    localStorage.removeItem(DB_KEYS.SESSION);
  },

  // --- DATABASE OPERATIONS ---
  // PRO TIP: Replace with `const res = await fetch('/api/classes')`
  getClasses: (): ClassInfo[] => {
    const saved = localStorage.getItem(DB_KEYS.CLASSES);
    return saved ? JSON.parse(saved) : [];
  },

  saveClasses: (classes: ClassInfo[]) => {
    localStorage.setItem(DB_KEYS.CLASSES, JSON.stringify(classes));
    // Notifies other tabs/users (Simulates Backend Push)
    syncChannel.postMessage({ type: 'DATA_UPDATED', payload: classes });
  },

  getUsers: (): UserProfile[] => {
    const saved = localStorage.getItem(DB_KEYS.USERS);
    return saved ? JSON.parse(saved) : [];
  },

  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const updatedUsers = users.map((u: UserProfile) => u.id === userId ? { ...u, ...updates } : u);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(updatedUsers));
    
    const current = apiClient.getCurrentUser();
    if (current && current.id === userId) {
      apiClient.saveSession({ ...current, ...updates });
    }
    syncChannel.postMessage({ type: 'USER_UPDATED' });
  },

  getRelevantStudents: (facultyId: string): StudentStats[] => {
    const users: UserProfile[] = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const classes = apiClient.getClasses().filter(c => c.facultyId === facultyId);
    const facultyDivisions = classes.map(c => c.name);

    return users
      .filter(u => u.role === 'student' && facultyDivisions.includes(u.className || ''))
      .map(u => {
        const userClass = classes.find(c => c.name === u.className);
        const totalTasks = userClass?.tasks.length || 0;
        const completedTasks = userClass?.tasks.filter(t => 
          t.submissions?.some(s => s.studentId === u.id && s.status === 'completed')
        ).length || 0;

        return {
          id: u.id,
          name: u.name,
          careerGoal: u.className || 'N/A',
          careerScore: 0,
          completedTasks,
          totalTasks
        };
      });
  },

  // --- REAL-TIME SUBSCRIPTION ---
  subscribe: (callback: (event: any) => void) => {
    syncChannel.onmessage = (event) => callback(event.data);
    return () => { syncChannel.onmessage = null; };
  }
};
