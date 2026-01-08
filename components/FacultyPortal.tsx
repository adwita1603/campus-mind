
import React, { useState, useRef } from 'react';
import { ClassInfo, StudentStats, Task, SyllabusModule, UserProfile } from '../types';
import { extractSkillsFromSyllabus } from '../services/gemini';

interface FacultyPortalProps {
  classes: ClassInfo[];
  setClasses: (newClasses: React.SetStateAction<ClassInfo[]>) => void;
  students: StudentStats[];
}

const FacultyPortal: React.FC<FacultyPortalProps> = ({ classes, setClasses, students }) => {
  const [showModal, setShowModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);
  const [currentClassId, setCurrentClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'classes' | 'analysis'>('classes');
  
  const [formData, setFormData] = useState({ name: '', syllabus: '', modules: [] as SyllabusModule[] });
  const [taskData, setTaskData] = useState<Partial<Task>>({ title: '', type: 'assignment', dueDate: '', content: '' });

  const currentUser: UserProfile = JSON.parse(localStorage.getItem('campusmind_session_user') || '{}');

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      setClasses(prev => prev.map(c => c.id === editingClass.id ? { ...c, name: formData.name.toUpperCase(), division: formData.name.toUpperCase(), modules: formData.modules } : c));
    } else {
      const newClass: ClassInfo = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name.toUpperCase(),
        division: formData.name.toUpperCase(),
        facultyId: currentUser.id,
        modules: formData.modules,
        tasks: []
      };
      setClasses(prev => [...prev, newClass]);
    }
    setShowModal(false);
  };

  const handleAIExtract = async () => {
    if (!formData.syllabus.trim()) return;
    setLoading(true);
    try {
      const skills = await extractSkillsFromSyllabus(formData.syllabus);
      const newModule: SyllabusModule = {
        id: 'm' + Date.now(),
        title: `Unit ${formData.modules.length + 1}`,
        description: formData.syllabus,
        extractedSkills: skills,
        isCompleted: false
      };
      setFormData(prev => ({ ...prev, modules: [...prev.modules, newModule], syllabus: '' }));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClassId) return;
    const newTask: Task = {
      id: 't' + Date.now(),
      title: taskData.title!,
      type: taskData.type as any,
      dueDate: taskData.dueDate!,
      status: 'pending',
      content: taskData.content!,
      submissions: []
    };
    setClasses(prev => prev.map(c => c.id === currentClassId ? { ...c, tasks: [...c.tasks, newTask] } : c));
    setShowTaskModal(false);
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black dark:text-white text-slate-900">Division Manager</h1>
          <p className="text-slate-500 font-medium italic">Control curriculums and track student readiness.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setActiveView(activeView === 'classes' ? 'analysis' : 'classes')} className="px-6 py-4 rounded-2xl font-bold bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            {activeView === 'analysis' ? 'View Divisions' : 'System Analysis'}
          </button>
          <button onClick={() => { setEditingClass(null); setFormData({name:'', syllabus:'', modules:[]}); setShowModal(true); }} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl">
            + New Division
          </button>
        </div>
      </header>

      {activeView === 'classes' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map(cls => (
              <div key={cls.id} className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl group hover:border-indigo-500/50 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">{cls.name}</div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingClass(cls); setFormData({name: cls.name, syllabus: '', modules: cls.modules}); setShowModal(true); }} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-indigo-500"><i className="fa-solid fa-pen"></i></button>
                  </div>
                </div>
                <h3 className="text-2xl font-black dark:text-white mb-6">Division {cls.name}</h3>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Curriculum</p>
                    <div className="space-y-2">
                      {cls.modules.map(m => (
                        <div key={m.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                          <span className="text-sm font-bold dark:text-slate-200 truncate">{m.title}</span>
                          {m.isCompleted && <i className="fa-solid fa-check-circle text-emerald-500"></i>}
                        </div>
                      ))}
                      {cls.modules.length === 0 && <p className="text-center py-4 text-xs font-bold text-slate-400 italic">No syllabus uploaded</p>}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={() => { setCurrentClassId(cls.id); setTaskData({title:'', type:'assignment', dueDate:'', content:''}); setShowTaskModal(true); }} className="w-full py-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-800/50">
                      Assign Task to Division
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {classes.length === 0 && (
              <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-900/50 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] text-center">
                <i className="fa-solid fa-folder-open text-6xl text-slate-300 mb-6"></i>
                <h3 className="text-xl font-black text-slate-400">Ready to start? Create your first Division.</h3>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 shadow-xl">
            <h3 className="text-xl font-black mb-8 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-users text-indigo-500"></i> Enrolled Scholars
            </h3>
            <div className="space-y-4">
              {students.map(s => (
                <div key={s.id} className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-3xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black">{s.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black dark:text-white truncate">{s.name}</p>
                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Div {s.careerGoal}</p>
                  </div>
                </div>
              ))}
              {students.length === 0 && <p className="text-center py-10 text-xs font-bold text-slate-400 italic">No students joined yet.</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[3rem] p-12 shadow-2xl text-center">
          <i className="fa-solid fa-chart-line text-6xl text-indigo-500 mb-6"></i>
          <h2 className="text-3xl font-black dark:text-white mb-4">Academic Analytics Engine</h2>
          <p className="text-slate-500 max-w-xl mx-auto font-medium">This module tracks cross-division progress, mapping AI-extracted skills to student performance metrics in real-time.</p>
        </div>
      )}

      {/* Class Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-scaleIn">
            <h2 className="text-3xl font-black mb-8 dark:text-white">Division Workspace</h2>
            <form onSubmit={handleSaveClass} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Division Letter</label>
                <input type="text" maxLength={1} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent px-6 py-6 rounded-2xl font-black text-center text-5xl dark:text-white uppercase focus:border-indigo-500 outline-none" placeholder="A" required />
              </div>
              
              <div className="space-y-2 pt-6 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Syllabus AI Extraction</label>
                <div className="flex gap-2">
                  <textarea value={formData.syllabus} onChange={e => setFormData({...formData, syllabus: e.target.value})} className="flex-1 bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl h-24 dark:text-white outline-none focus:border-indigo-500 border-2 border-transparent font-medium" placeholder="Paste syllabus content here..." />
                  <button type="button" onClick={handleAIExtract} disabled={loading || !formData.syllabus} className="bg-indigo-600 text-white px-8 rounded-2xl font-black shadow-lg flex flex-col items-center justify-center gap-1">
                    {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-sparkles"></i>}
                    <span className="text-[8px] uppercase">Process</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {formData.modules.map((m, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <span className="font-bold dark:text-slate-200">{m.title}</span>
                    <button type="button" onClick={() => setFormData({...formData, modules: formData.modules.filter((_,i)=>i!==idx)})} className="text-red-400 hover:text-red-500"><i className="fa-solid fa-trash"></i></button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-black text-slate-500">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl">Finalize Division</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-scaleIn">
            <h2 className="text-2xl font-black mb-8 dark:text-white">Publish Division Task</h2>
            <form onSubmit={handleSaveTask} className="space-y-5">
              <input type="text" value={taskData.title} onChange={e => setTaskData({...taskData, title: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-bold dark:text-white" placeholder="Task Name" required />
              <div className="grid grid-cols-2 gap-4">
                <select value={taskData.type} onChange={e => setTaskData({...taskData, type: e.target.value as any})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-bold dark:text-white">
                  <option value="assignment">Assignment</option>
                  <option value="quiz">Quiz</option>
                </select>
                <input type="date" value={taskData.dueDate} onChange={e => setTaskData({...taskData, dueDate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-bold dark:text-white" required />
              </div>
              <textarea value={taskData.content} onChange={e => setTaskData({...taskData, content: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl h-32 dark:text-white" placeholder="Task Description..." required />
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 font-black text-slate-500">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-black shadow-xl">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyPortal;
