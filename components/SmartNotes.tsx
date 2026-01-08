
import React, { useState } from 'react';
import { summarizeNotes } from '../services/gemini';

interface Props {
  theme: 'dark' | 'light';
}
const SmartNotes: React.FC<{ theme?: string }> = ({ theme }) => {
  const [note, setNote] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!note.trim()) return;
    setLoading(true);
    try {
      const result = await summarizeNotes(note);
      setSummary(result);
    } catch (error) {
      console.error(error);
      setSummary("Error generating summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-20">
      <header className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-4xl font-black mb-2 dark:text-white text-slate-900 tracking-tight">Smart Notes</h2>
          <p className="text-slate-500 font-medium tracking-tight">Focus on the lecture, we'll handle the insights.</p>
        </div>
        <button 
          onClick={handleSummarize}
          disabled={loading || !note}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:scale-[1.05] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
        >
          {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-sparkles"></i>}
          Analyze Lecture
        </button>
      </header>

      <div className="grid grid-cols-1 gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-widest ml-4">
            <i className="fa-solid fa-keyboard"></i> Live Notebook
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-200 dark:border-slate-800 shadow-2xl p-10 focus-within:border-indigo-500/50 transition-all">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Start drafting your lecture notes here... Shift+Enter for new lines."
              className="w-full min-h-[300px] bg-transparent focus:outline-none resize-none text-slate-900 dark:text-slate-100 text-xl leading-[2] font-medium placeholder:text-slate-300 dark:placeholder:text-slate-800 scrollbar-hide"
            ></textarea>
          </div>
        </div>

        {summary && (
          <div className="space-y-4 animate-scaleIn">
            <div className="flex items-center gap-2 text-indigo-500 font-black uppercase text-[10px] tracking-widest ml-4">
              <i className="fa-solid fa-wand-magic-sparkles"></i> AI Key Takeaways
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-[3rem] border-2 border-indigo-100 dark:border-indigo-900/50 p-12 relative overflow-hidden">
              <i className="fa-solid fa-quote-left absolute top-8 right-8 text-indigo-200 dark:text-indigo-900/30 text-8xl opacity-20"></i>
              <div className="prose dark:prose-invert max-w-none relative z-10">
                <div className="text-slate-800 dark:text-slate-300 whitespace-pre-wrap text-lg leading-[1.8] font-semibold italic">
                  {summary}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!summary && !loading && (
        <div className="py-20 text-center space-y-4 opacity-40">
          <i className="fa-solid fa-file-pen text-6xl text-slate-300"></i>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Type above to activate AI summary engine</p>
        </div>
      )}
    </div>
  );
};

export default SmartNotes;
