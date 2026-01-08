
import React, { useState } from 'react';
import { Role, UserProfile } from '../types';

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [view, setView] = useState<'signin' | 'signup' | 'onboarding'>('signin');
  const [role, setRole] = useState<Role>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    className: ''
  });

  const DB_USERS = 'campusmind_db_users';

  const getUsers = (): UserProfile[] => {
    const saved = localStorage.getItem(DB_USERS);
    return saved ? JSON.parse(saved) : [];
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const users = getUsers();
      const user = users.find(u => u.email === formData.email && u.password === formData.password);

      if (user) {
        onLogin(user);
      } else {
        setError('Invalid email or password. Please try again or create an account.');
        setLoading(false);
      }
    }, 1000);
  };

  const handleSignUpInit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = getUsers();
    if (users.some(u => u.email === formData.email)) {
      setError('An account with this email already exists.');
      return;
    }
    setView('onboarding');
  };

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const users = getUsers();
      const newUser: UserProfile = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
        className: role === 'student' ? formData.className.toUpperCase() : undefined
      };

      localStorage.setItem(DB_USERS, JSON.stringify([...users, newUser]));
      onLogin(newUser);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 p-6 overflow-y-auto bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950">
      <div className="max-w-md w-full animate-scaleIn">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border-2 border-slate-200 dark:border-slate-800 shadow-2xl shadow-indigo-500/10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-xl shadow-indigo-600/30">
              <i className="fa-solid fa-brain"></i>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              {view === 'onboarding' ? 'Configure Profile' : view === 'signup' ? 'Join CampusMind' : 'CAMPUS MIND'}
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-2">
              {view === 'onboarding' ? 'Set up your academic workspace' : 'Enter your credentials to continue'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-400/10 border border-red-400/20 rounded-2xl text-red-500 text-xs font-bold text-center animate-shake">
              {error}
            </div>
          )}

          {view === 'onboarding' ? (
            <form onSubmit={handleFinalize} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Select Your Purpose</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setRole('student')}
                    className={`p-5 rounded-3xl border-4 transition-all text-left ${role === 'student' ? 'border-indigo-600 bg-indigo-600/5' : 'border-transparent bg-slate-100 dark:bg-slate-800/50 grayscale opacity-60'}`}
                  >
                    <i className="fa-solid fa-user-graduate text-indigo-500 text-xl mb-2"></i>
                    <p className="font-black text-sm dark:text-white text-slate-900">Student</p>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('faculty')}
                    className={`p-5 rounded-3xl border-4 transition-all text-left ${role === 'faculty' ? 'border-emerald-600 bg-emerald-600/5' : 'border-transparent bg-slate-100 dark:bg-slate-800/50 grayscale opacity-60'}`}
                  >
                    <i className="fa-solid fa-chalkboard-user text-emerald-500 text-xl mb-2"></i>
                    <p className="font-black text-sm dark:text-white text-slate-900">Faculty</p>
                  </button>
                </div>
              </div>

              {role === 'student' && (
                <div className="space-y-2 animate-fadeIn">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Assigned Division</label>
                  <input 
                    type="text" 
                    required
                    maxLength={1}
                    value={formData.className}
                    onChange={e => setFormData({...formData, className: e.target.value.toUpperCase()})}
                    placeholder="e.g. A"
                    className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent dark:text-white text-slate-900 px-6 py-4 rounded-2xl font-black text-center text-3xl focus:border-indigo-500 outline-none uppercase"
                  />
                  <p className="text-[9px] text-slate-500 font-bold text-center mt-2">Enter the division letter you belong to (A, B, C...)</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : null}
                Finalize Registration
              </button>
            </form>
          ) : (
            <form onSubmit={view === 'signin' ? handleSignIn : handleSignUpInit} className="space-y-6">
              {view === 'signup' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <i className="fa-solid fa-user absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent dark:text-white text-slate-900 pl-14 pr-6 py-4 rounded-2xl font-bold focus:border-indigo-500 outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <i className="fa-solid fa-envelope absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent dark:text-white text-slate-900 pl-14 pr-6 py-4 rounded-2xl font-bold focus:border-indigo-500 outline-none"
                    placeholder="name@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Security Password</label>
                <div className="relative">
                  <i className="fa-solid fa-lock absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent dark:text-white text-slate-900 pl-14 pr-6 py-4 rounded-2xl font-bold focus:border-indigo-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : null}
                {view === 'signin' ? 'Sign In Securely' : 'Continue Enrollment'}
              </button>

              <div className="text-center pt-4">
                <button 
                  type="button"
                  onClick={() => setView(view === 'signin' ? 'signup' : 'signin')}
                  className="text-xs font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-400 transition-colors"
                >
                  {view === 'signin' ? 'New here? Create Account' : 'Already have an account? Sign In'}
                </button>
              </div>
            </form>
          )}
        </div>
        
        <p className="mt-8 text-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
          CampusMind Secure Authentication v2.0
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
