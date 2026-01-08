
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const data = [
  { name: 'Mon', hours: 4 },
  { name: 'Tue', hours: 6 },
  { name: 'Wed', hours: 3 },
  { name: 'Thu', hours: 8 },
  { name: 'Fri', hours: 5 },
  { name: 'Sat', hours: 2 },
  { name: 'Sun', hours: 1 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Welcome back, Scholar!</h2>
        <p className="text-slate-500">Here's your academic overview for today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">Study Streaks</span>
            <i className="fa-solid fa-fire text-orange-500"></i>
          </div>
          <div className="text-3xl font-bold text-slate-900">12 Days</div>
          <p className="text-xs text-green-600 mt-2">+2 from last week</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">Notes Taken</span>
            <i className="fa-solid fa-file-pen text-indigo-500"></i>
          </div>
          <div className="text-3xl font-bold text-slate-900">48</div>
          <p className="text-xs text-slate-500 mt-2">12 summarized by AI</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">Research Tasks</span>
            <i className="fa-solid fa-search text-blue-500"></i>
          </div>
          <div className="text-3xl font-bold text-slate-900">24</div>
          <p className="text-xs text-slate-500 mt-2">Across 4 subjects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Study Hours (This Week)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Research Topics</h3>
          <div className="space-y-4">
            {[
              { topic: 'Quantum Entanglement', date: '2 hours ago', status: 'Deep Dive' },
              { topic: 'Monetary Policy Impact', date: 'Yesterday', status: 'Summarized' },
              { topic: 'Photosynthesis Cycle', date: '2 days ago', status: 'Visualized' },
              { topic: 'Renaissance Architecture', date: 'Oct 24', status: 'Drafting' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.topic}</p>
                  <p className="text-xs text-slate-500">{item.date}</p>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-600">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
