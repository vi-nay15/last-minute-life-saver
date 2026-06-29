import React, { useState } from 'react';
import { BookOpen, Brain, Sparkles, Calendar, Tag, Heart, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { JournalEntry, JournalAnalysisResponse } from '../types';

interface DailyJournalProps {
  entries: JournalEntry[];
  onAddEntry: (content: string, analysis: JournalAnalysisResponse) => void;
  isLoading: boolean;
  onAnalyze: (content: string) => Promise<JournalAnalysisResponse>;
}

export default function DailyJournal({ entries, onAddEntry, isLoading, onAnalyze }: DailyJournalProps) {
  const [content, setContent] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState<JournalAnalysisResponse | null>(null);

  const handleAnalyze = async () => {
    if (!content.trim() || isLoading) return;
    try {
      const result = await onAnalyze(content);
      setCurrentAnalysis(result);
      onAddEntry(content, result);
      setContent('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between" id="daily-journal-card">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="font-display font-semibold text-base text-zinc-100">Decompression Journal</h2>
            <p className="text-[11px] text-zinc-400">Dump your mind here. Get empathetic AI reframing and insights.</p>
          </div>
        </div>

        {/* Journal Form */}
        <div className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write down how your day is going, what's stressing you, or small wins..."
            className="w-full h-28 px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent resize-none transition-all"
            disabled={isLoading}
          />
          
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading || !content.trim()}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-950 disabled:text-zinc-600 text-zinc-200 font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 border border-zinc-700/50 transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analyzing Mood & Insights...</span>
              </>
            ) : (
              <>
                <Brain size={14} className="text-amber-500" />
                <span>Process thoughts with AI</span>
              </>
            )}
          </button>
        </div>

        {/* Highlight of Current/Last Analysis */}
        <AnimatePresence mode="wait">
          {currentAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-gradient-to-r from-amber-500/5 to-rose-500/5 border border-amber-500/20 rounded-xl p-3.5 space-y-2.5 relative overflow-hidden"
            >
              {/* Mood Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-amber-500 tracking-wider flex items-center gap-1">
                  <Smile size={12} />
                  Detected Mood: {currentAnalysis.mood}
                </span>
                <button
                  onClick={() => setCurrentAnalysis(null)}
                  className="text-zinc-500 hover:text-zinc-300 text-[10px] font-mono"
                >
                  Clear Highlight
                </button>
              </div>

              {/* Insights and Advice */}
              <div className="space-y-1.5">
                <p className="text-xs text-zinc-200 leading-relaxed italic">
                  "{currentAnalysis.insights}"
                </p>
                <p className="text-[11px] text-zinc-400 border-l border-amber-500/30 pl-2 leading-relaxed">
                  <strong className="text-amber-400 font-semibold">Advice: </strong>
                  {currentAnalysis.advice}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {currentAnalysis.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] bg-zinc-950 text-zinc-400 border border-zinc-800/80 px-2 py-0.5 rounded-md flex items-center gap-1"
                  >
                    <Tag size={8} />
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entry Timeline / History */}
        <div className="space-y-2.5 pt-2 border-t border-zinc-800">
          <h3 className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider font-semibold">Past Release Logs</h3>
          <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
            {entries.length === 0 ? (
              <p className="text-zinc-500 text-xs text-center py-4 italic">No previous thoughts recorded. Clear your mind here!</p>
            ) : (
              [...entries].reverse().map((entry) => (
                <div key={entry.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500 flex items-center gap-1 font-mono">
                      <Calendar size={10} />
                      {entry.date}
                    </span>
                    {entry.mood && (
                      <span className="text-amber-400/80 font-semibold bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                        {entry.mood}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">{entry.content}</p>
                  
                  {entry.insights && (
                    <p className="text-[10px] text-zinc-400 border-l border-zinc-800 pl-2 leading-relaxed">
                      <strong className="text-zinc-500">AI Insight: </strong>
                      {entry.insights}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
