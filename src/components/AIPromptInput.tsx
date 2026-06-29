import React, { useState } from 'react';
import { Sparkles, Zap, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AIPromptInputProps {
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

const TEMPLATES = [
  {
    label: "🔥 Crisis Mode",
    text: "Woke up super late at 11:00 AM. I have a history essay due by 5:00 PM, a team call at 3:00 PM, need to walk the dog, clean my desk, and quickly gym before dinner."
  },
  {
    label: "📚 Final Exam Prep",
    text: "Wake up at 8:00 AM. Need to study 3 core chapters of chemistry, do a mock exam paper, take proper breaks, get fresh air, and prepare healthy meals. Bedtime by 11:00 PM."
  },
  {
    label: "💼 Chaotic Workday",
    text: "Start at 9:00 AM. I have 4 back-to-back client meetings in the morning, need to write a proposal, review team PRs, answer 30 emails, and schedule a vet appointment."
  }
];

export default function AIPromptInput({ onGenerate, isLoading }: AIPromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onGenerate(prompt);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden h-full flex flex-col justify-between" id="ai-prompt-input-card">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg text-zinc-100">Describe Your Chaos</h2>
            <p className="text-xs text-zinc-400">Describe your day, deadlines, and feelings in plain text.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., I'm totally overwhelmed. I have an interview at 2 PM, need to clean my apartment, pick up groceries, work on a React project, and jog..."
            className="w-full h-44 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none transition-all duration-200"
            required
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-zinc-950 font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all duration-300 transform active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-zinc-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Assembling Ultimate Plan...</span>
              </>
            ) : (
              <>
                <Zap size={18} />
                <span>Rescue Me with AI</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-6 pt-6 border-t border-zinc-800">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Stressed? Try a Quick Starter:</p>
        <div className="flex flex-col gap-2">
          {TEMPLATES.map((tpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPrompt(tpl.text)}
              disabled={isLoading}
              className="text-left w-full p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:text-zinc-100 transition-colors duration-200"
            >
              <div className="font-semibold text-amber-500 mb-0.5">{tpl.label}</div>
              <p className="line-clamp-1 text-zinc-400">{tpl.text}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
