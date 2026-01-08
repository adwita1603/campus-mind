
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'notes', icon: 'fa-book', label: 'Smart Notes' },
    { id: 'research', icon: 'fa-microscope', label: 'Research' },
    { id: 'visuals', icon: 'fa-palette', label: 'Visual Learner' },
    { id: 'tutor', icon: 'fa-user-graduate', label: 'AI Tutor' },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
          <i className="fa-solid fa-brain"></i>
          <span>CampusMind</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5`}></i>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700">
            <i className="fa-solid fa-user"></i>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-medium text-slate-900 truncate">Scholar</p>
            <p className="text-[10px] text-slate-500 truncate">Academic Plan: Pro</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
