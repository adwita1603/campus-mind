
import React, { useState, useEffect } from 'react';
import SmartNotes from './components/SmartNotes';
import ResearchAssistant from './components/ResearchAssistant';
import VisualLearner from './components/VisualLearner';
import AITutor from './components/AITutor';
import LoginScreen from './components/LoginScreen';
import FacultyPortal from './components/FacultyPortal';
import StudentPortal from './components/StudentPortal';
import { UserProfile, ClassInfo, StudentStats } from './types';
import { apiClient } from './services/api';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(apiClient.getCurrentUser());
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [allClasses, setAllClasses] = useState<ClassInfo[]>(apiClient.getClasses());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', password: '', className: '' });

  // 1. REAL-TIME MVP SYNC (The "Backend" Push)
  useEffect(() => {
    const unsubscribe = apiClient.subscribe((event) => {
      if (event.type === 'DATA_UPDATED') {
        setAllClasses(event.payload);
      }
      if (event.type === 'USER_UPDATED') {
        setCurrentUser(apiClient.getCurrentUser());
      }
    });
    return unsubscribe;
  }, []);

  // 2. SESSION RECOVERY
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name,
        email: currentUser.email,
        password: currentUser.password || '',
        className: currentUser.className || ''
      });
    }
  }, [currentUser]);

  // 3. THEME & STYLING
  useEffect(() => {
    document.documentElement.className = theme;
    document.body.className = theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  }, [theme]);

  const handleLogin = (user: UserProfile) => {
    apiClient.saveSession(user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    apiClient.clearSession();
    setCurrentUser(null);
  };

  const updateClasses = (newClasses: React.SetStateAction<ClassInfo[]>) => {
    const updated = typeof newClasses === 'function' ? newClasses(allClasses) : newClasses;
    setAllClasses(updated);
    apiClient.saveClasses(updated);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    apiClient.updateUserProfile(currentUser.id, {
      name: profileForm.name,
      email: profileForm.email,
      password: profileForm.password,
      className: currentUser.role === 'student' ? profileForm.className.toUpperCase() : currentUser.className
    });
    setShowProfileModal(false);
  };

  if (!currentUser) return <LoginScreen onLogin={handleLogin} />;

  const renderContent = () => {
    if (currentUser.role === 'faculty') {
      const facultyClasses = allClasses.filter(c => c.facultyId === currentUser.id);
      const relevantStudents = apiClient.getRelevantStudents(currentUser.id);
      return <FacultyPortal classes={facultyClasses} setClasses={updateClasses} students={relevantStudents} />;
    }
    
    const studentClasses = allClasses.filter(c => c.name === currentUser.className);
    
    switch (activeTab) {
      case 'dashboard': return <StudentPortal collegeClasses={studentClasses} setClasses={updateClasses} />;
      case 'notes': return <SmartNotes theme={theme} />;
      case 'research': return <ResearchAssistant theme={theme} />;
      case 'visuals': return <VisualLearner theme={theme} />;
      case 'tutor': return <AITutor theme={theme} />;
      default: return <StudentPortal collegeClasses={studentClasses} setClasses={updateClasses} />;
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <aside className={`w-72 border-r h-screen flex flex-col fixed left-0 top-0 z-40 transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <i className="fa-solid fa-brain text-lg"></i>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight dark:text-white text-slate-900">CampusMind</h1>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
               {currentUser.role} • Division {currentUser.className || 'Admin'}
             </p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {currentUser.role === 'student' ? (
            ['dashboard', 'notes', 'research', 'visuals', 'tutor'].map((id) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                  activeTab === id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold scale-[1.02]' 
                    : `hover:bg-opacity-10 ${theme === 'dark' ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'}`
                }`}
              >
                <i className={`fa-solid ${
                  id === 'dashboard' ? 'fa-graduation-cap' : 
                  id === 'notes' ? 'fa-file-signature' : 
                  id === 'research' ? 'fa-flask-vial' : 
                  id === 'visuals' ? 'fa-images' : 'fa-robot'
                } text-lg w-6`}></i>
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))
          ) : (
            <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 font-bold">
              <i className="fa-solid fa-chalkboard-user text-lg w-6"></i>
              Curriculum Manager
            </button>
          )}
        </nav>

        <div className="p-6 border-t border-slate-800/50 space-y-4">
          <div className="px-4 py-3 flex items-center gap-3 bg-slate-100 dark:bg-slate-800/40 rounded-2xl group relative cursor-pointer" onClick={() => setShowProfileModal(true)}>
             <img src={`https://ui-avatars.com/api/?name=${currentUser.name}&background=6366f1&color=fff`} className="w-8 h-8 rounded-lg shadow-md" alt="Avatar" />
             <div className="min-w-0 flex-1">
               <p className="text-xs font-black truncate text-slate-900 dark:text-white">{currentUser.name}</p>
               <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
             </div>
             <i className="fa-solid fa-user-pen text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`flex-1 flex items-center justify-center py-3 rounded-xl transition-colors ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              <i className={`fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`}></i>
            </button>
            <button onClick={handleLogout} className="flex-1 flex items-center justify-center py-3 text-red-400 bg-red-400/10 rounded-xl hover:bg-red-400/20 transition-all">
              <i className="fa-solid fa-power-off"></i>
            </button>
          </div>
        </div>
      </aside>
      
      <main className="flex-1 ml-72 p-10 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border-2 border-slate-200 dark:border-slate-800 animate-scaleIn">
            <h2 className="text-2xl font-black mb-8 dark:text-white text-slate-900">Profile Settings</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent px-5 py-3 rounded-2xl font-bold dark:text-white" placeholder="Full Name" required />
              <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent px-5 py-3 rounded-2xl font-bold dark:text-white" placeholder="Email" required />
              <input type="password" value={profileForm.password} onChange={e => setProfileForm({...profileForm, password: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent px-5 py-3 rounded-2xl font-bold dark:text-white" placeholder="Password" required />
              {currentUser.role === 'student' && <input type="text" maxLength={1} value={profileForm.className} onChange={e => setProfileForm({...profileForm, className: e.target.value.toUpperCase()})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent px-5 py-3 rounded-2xl font-black text-center text-3xl uppercase dark:text-white" placeholder="A" required />}
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 py-4 font-black text-slate-500">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
