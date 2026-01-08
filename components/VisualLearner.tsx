
import React, { useState } from 'react';
import { generateVisualAid } from '../services/gemini';
interface Props {
  theme: 'dark' | 'light';
}
const VisualLearner: React.FC<Props> = ({ theme }) => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const url = await generateVisualAid(prompt);
      setImageUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Visual Learner</h2>
        <p className="text-slate-500">Transform abstract concepts into educational diagrams and illustrations.</p>
      </header>

      <div className="flex gap-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe a concept (e.g., 'DNA Double Helix Structure')"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md"
        >
          {loading ? <i className="fa-solid fa-palette fa-spin mr-2"></i> : null}
          Generate
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl min-h-[400px] flex flex-col items-center justify-center p-8 relative">
        {loading ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-medium">Visualizing your concept...</p>
          </div>
        ) : imageUrl ? (
          <div className="w-full max-w-2xl animate-scaleIn">
            <img src={imageUrl} alt={prompt} className="w-full rounded-xl shadow-2xl border border-slate-100" />
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl flex items-center justify-between">
              <span className="text-indigo-800 font-medium text-sm">Educational Visualization: {prompt}</span>
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = imageUrl;
                  link.download = `${prompt.replace(/\s+/g, '_')}.png`;
                  link.click();
                }}
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
                title="Download Image"
              >
                <i className="fa-solid fa-download text-lg"></i>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <i className="fa-solid fa-image text-4xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Generate Study Visuals</h3>
            <p className="text-slate-500">
              Seeing is believing. Enter a topic above to generate a custom high-quality diagram for your study notes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualLearner;
