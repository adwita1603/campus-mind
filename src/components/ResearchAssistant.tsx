
import React, { useState } from 'react';
import { researchTopic } from '../src/services/services/gemini';

interface Props {
  theme: 'dark' | 'light';
}
const ResearchAssistant: React.FC<Props> = ({ theme }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ text: string; sources: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await researchTopic(query);
      setResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Research Assistant</h2>
        <p className="text-slate-500">Search the web for up-to-date facts with verified citations.</p>
      </header>

      <form onSubmit={handleResearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a research question (e.g., 'What are the latest breakthroughs in fusion energy?')"
          className="w-full pl-12 pr-24 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm"
        />
        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <button
          type="submit"
          disabled={loading || !query}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Explore'}
        </button>
      </form>

      {results && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm prose prose-slate max-w-none">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <i className="fa-solid fa-book-open text-indigo-500"></i>
              Findings
            </h3>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">{results.text}</div>
          </div>

          {results.sources.length > 0 && (
            <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4">Cited Sources</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-indigo-600">
                        {source.title || 'Referenced Webpage'}
                      </p>
                      <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-slate-400 mt-1"></i>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 truncate">{new URL(source.uri).hostname}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!results && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Global warming mitigation strategies 2024",
            "Impact of AI on software engineering salaries",
            "History of Silk Road trade routes",
            "Latest news on James Webb Telescope"
          ].map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => setQuery(suggestion)}
              className="p-4 text-left bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-slate-600 text-sm"
            >
              <i className="fa-solid fa-lightbulb mr-2 text-amber-400"></i>
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResearchAssistant;
