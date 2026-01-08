
import React, { useState, useEffect, useMemo } from 'react';
import { suggestGoalSkills, calculateMatchAnalysis } from '../src/services/services/gemini';
import { Skill, ClassInfo, Task } from '../types';

interface StudentPortalProps {
  collegeClasses: ClassInfo[];
  setClasses: React.Dispatch<React.SetStateAction<ClassInfo[]>>;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ collegeClasses, setClasses }) => {
  const [goal, setGoal] = useState('Full Stack Developer');
  const [goalSkills, setGoalSkills] = useState<any[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{ score: number; analysis: string } | null>(null);
  const [solvingTask, setSolvingTask] = useState<{ classId: string, task: Task } | null>(null);
  const [taskResponse, setTaskResponse] = useState('');

  // DERIVE SKILLS FROM FACULTY UPLOADS
  const collegeSkillStatus = useMemo(() => collegeClasses.flatMap(c => 
    c.modules.flatMap(m => {
      // If AI hasn't extracted skills yet, treat the module title as a skill for visibility
      const skills = m.extractedSkills.length > 0 
        ? m.extractedSkills 
        : [m.title];
      return skills.map(s => ({ name: s, covered: m.isCompleted }));
    })
  ), [collegeClasses]);

  // Combined score for immediate reactive feedback
  const reactiveScore = useMemo(() => {
    if (goalSkills.length === 0) return 0;
    
    const completedGoalCount = goalSkills.filter(s => completedIds.includes(s.name)).length;
    const coveredCollegeCount = collegeSkillStatus.filter(s => s.covered).length;
    
    const goalWeight = 0.65;
    const collegeWeight = 0.35;
    
    const goalRatio = completedGoalCount / goalSkills.length;
    const collegeRatio = collegeSkillStatus.length > 0 ? coveredCollegeCount / collegeSkillStatus.length : 0;
    
    const totalScore = (goalRatio * goalWeight + collegeRatio * collegeWeight) * 100;
    return Math.round(totalScore);
  }, [goalSkills, completedIds, collegeSkillStatus]);

  const handleSyncAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goal.trim()) return;
    setLoading(true);
    try {
      const skills = e ? await suggestGoalSkills(goal) : goalSkills;
      if (e) setGoalSkills(skills);
      
      const coveredCollegeSkills = collegeSkillStatus.filter(s => s.covered).map(s => s.name);
      const res = await calculateMatchAnalysis(goal, coveredCollegeSkills, completedIds);
      setAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    handleSyncAnalysis();
  }, []);

  // AUTO-REFRESH ANALYSIS ON CURRICULUM UPDATE
  useEffect(() => {
    if (goalSkills.length > 0) {
      handleSyncAnalysis();
    }
  }, [collegeSkillStatus]);

  const toggleSkill = (id: string) => {
    setCompletedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const submitTaskSolution = () => {
    if (!solvingTask) return;
    const { classId, task } = solvingTask;
    
    // Using current session user
    const currentUser = JSON.parse(localStorage.getItem('campusmind_session_user') || '{}');
    const studentId = currentUser.id || 'anonymous'; 
    const isCorrect = task.type === 'quiz' ? (taskResponse === task.correctAnswer) : true;
    const score = isCorrect ? Math.floor(Math.random() * 21) + 80 : Math.floor(Math.random() * 31) + 40;

    setClasses(prev => prev.map(c => c.id === classId ? {
      ...c,
      tasks: c.tasks.map(t => t.id === task.id ? { 
        ...t, 
        status: 'completed', 
        score: score,
        submissions: [
          ...(t.submissions || []),
          {
            studentId: studentId,
            studentName: currentUser.name || 'Student',
            status: 'completed',
            score: score,
            answer: taskResponse,
            submittedAt: new Date().toISOString()
          }
        ]
      } : t)
    } : c));
    
    setSolvingTask(null);
    setTaskResponse('');
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Career Goal & Scoring */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] shadow-xl">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 dark:text-white text-slate-900">
              <i className="fa-solid fa-compass text-indigo-500"></i> My Career Goal
            </h3>
            <form onSubmit={handleSyncAnalysis} className="space-y-4">
              <input 
                type="text" 
                value={goal}
                onChange={e => setGoal(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 dark:text-white text-slate-900 focus:border-indigo-500 outline-none font-black placeholder:text-slate-400"
                placeholder="e.g. AI Specialist"
              />
              <button disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all">
                {loading ? <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> : 'Sync AI Roadmap'}
              </button>
            </form>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Your Industry Readiness</p>
              <div className="text-8xl font-black mb-6 tracking-tighter transition-all duration-300 transform group-hover:scale-110 origin-left">
                {reactiveScore}%
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full mb-8 overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-1000" 
                  style={{ width: `${reactiveScore}%` }}
                ></div>
              </div>
              {analysis && (
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <p className="text-[11px] font-bold leading-relaxed italic">{analysis.analysis}</p>
                </div>
              )}
            </div>
            <i className="fa-solid fa-rocket absolute -right-12 -bottom-12 opacity-10 text-[12rem] rotate-12 transition-transform group-hover:rotate-0"></i>
          </div>
        </div>

        {/* Right Side: Tasks & Skills */}
        <div className="lg:col-span-8 space-y-8">
          {/* Faculty Assigned Tasks */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] shadow-xl">
            <h3 className="text-xl font-black mb-8 dark:text-white text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-tasks text-blue-500"></i> My Pending Tasks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collegeClasses.flatMap(c => c.tasks.map(task => ({ classId: c.id, className: c.name, task }))).map(({ classId, className, task }) => (
                <div key={task.id} className={`p-6 rounded-[2.5rem] border-2 transition-all ${task.status === 'completed' ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 shadow-lg shadow-blue-500/5'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${task.type === 'quiz' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500'}`}>{task.type}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{task.dueDate}</span>
                  </div>
                  <div className="mb-6">
                    <h4 className={`font-black text-xl leading-tight ${task.status === 'completed' ? 'text-slate-400 line-through' : 'dark:text-white text-slate-900'}`}>{task.title}</h4>
                    <p className="text-[9px] text-indigo-500 font-black uppercase mt-1">Division {className}</p>
                  </div>
                  
                  {task.status === 'pending' ? (
                    <button 
                      onClick={() => setSolvingTask({ classId, task })}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                    >
                      Attempt Task
                    </button>
                  ) : (
                    <div className="mt-4 flex items-center justify-between text-xs pt-4 border-t-2 border-slate-100 dark:border-slate-800/50">
                      <span className="text-slate-400 font-black uppercase tracking-widest">Achieved Score</span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-black text-2xl">{task.score}</span>
                        <span className="text-slate-400 font-bold">/ 100</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {collegeClasses.flatMap(c => c.tasks).length === 0 && <p className="col-span-full text-center py-10 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">No pending assignments for Division {collegeClasses[0]?.name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] shadow-xl">
              <h3 className="text-xl font-black mb-6 dark:text-white text-slate-900">Curriculum Skills</h3>
              <div className="space-y-3">
                {collegeSkillStatus.map((s, i) => (
                  <div key={i} className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${s.covered ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-800/50' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50'}`}>
                    <div>
                      <p className={`font-black text-xs ${s.covered ? 'text-emerald-700 dark:text-emerald-500' : 'text-slate-400'}`}>{s.name}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">{s.covered ? 'Mastered' : 'Upcoming'}</p>
                    </div>
                    {s.covered && <i className="fa-solid fa-check-circle text-emerald-500"></i>}
                  </div>
                ))}
                {collegeSkillStatus.length === 0 && <p className="text-center py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No division syllabus uploaded yet.</p>}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] shadow-xl">
              <h3 className="text-xl font-black mb-6 dark:text-white text-slate-900">Career Targets</h3>
              <div className="space-y-4">
                {goalSkills.map((s, i) => (
                  <div key={i} className="group p-5 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border-2 border-transparent hover:border-indigo-500/20 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-black dark:text-slate-200 text-slate-800 text-sm">{s.name}</span>
                      <button onClick={() => toggleSkill(s.name)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${completedIds.includes(s.name) ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-slate-700 text-slate-300 border-2 border-slate-100 dark:border-slate-600'}`}>
                        <i className="fa-solid fa-check text-xs"></i>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {s.recommendations.map((rec: any, idx: number) => (
                        <a key={idx} href={rec.url} target="_blank" className="text-[8px] bg-white dark:bg-slate-900 text-indigo-500 px-2.5 py-1 rounded-lg font-black border border-slate-100 dark:border-slate-800 uppercase tracking-tighter">
                          {rec.platform}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solving Overlay */}
      {solvingTask && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl animate-scaleIn border-2 border-slate-100 dark:border-slate-800">
            <h2 className="text-3xl font-black mb-2 dark:text-white text-slate-900">{solvingTask.task.title}</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mb-8">{solvingTask.task.type}</p>
            
            <div className="bg-slate-50 dark:bg-slate-800/60 p-10 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700/50 mb-10">
              <p className="text-xl font-bold dark:text-white text-slate-900 mb-10 leading-relaxed">{solvingTask.task.content}</p>
              
              {solvingTask.task.type === 'quiz' && solvingTask.task.options && (
                <div className="grid grid-cols-1 gap-4">
                  {solvingTask.task.options.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => setTaskResponse(opt)}
                      className={`p-6 text-left rounded-2xl border-4 transition-all font-black text-lg ${taskResponse === opt ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'border-transparent bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              {solvingTask.task.type === 'assignment' && (
                <textarea 
                  className="w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border-4 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white h-48 outline-none focus:border-indigo-600 transition-all font-bold placeholder:text-slate-300 text-lg"
                  placeholder="Enter your detailed submission here..."
                  value={taskResponse}
                  onChange={e => setTaskResponse(e.target.value)}
                />
              )}
            </div>
            
            <div className="flex gap-6">
              <button onClick={() => setSolvingTask(null)} className="flex-1 py-5 text-slate-500 font-black hover:text-white transition-colors">Cancel</button>
              <button 
                onClick={submitTaskSolution}
                disabled={!taskResponse}
                className="flex-[2] bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50"
              >
                Finalize & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
