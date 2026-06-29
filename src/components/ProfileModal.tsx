import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Check, Sparkles, User, Clock, ShieldCheck, Dumbbell, Target } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  initialProfile: UserProfile | null;
  isForceOpen: boolean;
}

export default function ProfileModal({
  isOpen,
  onClose,
  onSave,
  initialProfile,
  isForceOpen
}: ProfileModalProps) {
  const [name, setName] = useState('');
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  
  // commitments & goals
  const [commitments, setCommitments] = useState<string[]>([]);
  const [newCommitment, setNewCommitment] = useState('');
  
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState('');
  
  const [workStyle, setWorkStyle] = useState<'focused' | 'pomodoro' | 'fluid'>('pomodoro');
  const [error, setError] = useState<string | null>(null);

  // Load initial values if available
  useEffect(() => {
    if (isOpen) {
      if (initialProfile) {
        setName(initialProfile.name || '');
        setWakeUpTime(initialProfile.wakeUpTime || '07:00');
        setSleepTime(initialProfile.sleepTime || '23:00');
        setCommitments(initialProfile.commitments || []);
        setGoals(initialProfile.goals || []);
        setWorkStyle(initialProfile.workStyle || 'pomodoro');
        setError(null);
      } else {
        // Defaults
        setName('');
        setWakeUpTime('07:00');
        setSleepTime('23:00');
        setCommitments([]);
        setGoals([]);
        setWorkStyle('pomodoro');
        setError(null);
      }
    }
  }, [isOpen, initialProfile]);

  const handleAddCommitment = () => {
    const trimmed = newCommitment.trim();
    if (!trimmed) return;
    if (commitments.includes(trimmed)) {
      setError("This commitment is already added.");
      return;
    }
    setCommitments([...commitments, trimmed]);
    setNewCommitment('');
    setError(null);
  };

  const handleRemoveCommitment = (index: number) => {
    setCommitments(commitments.filter((_, i) => i !== index));
  };

  const handleAddGoal = () => {
    const trimmed = newGoal.trim();
    if (!trimmed) return;
    if (goals.length >= 3) {
      setError("You can add a maximum of 3 personal goals.");
      return;
    }
    if (goals.includes(trimmed)) {
      setError("This goal is already added.");
      return;
    }
    setGoals([...goals, trimmed]);
    setNewGoal('');
    setError(null);
  };

  const handleRemoveGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name to personalize the app.");
      return;
    }
    if (!wakeUpTime || !sleepTime) {
      setError("Wake-up and sleep times are required.");
      return;
    }

    onSave({
      name: name.trim(),
      wakeUpTime,
      sleepTime,
      commitments,
      goals,
      workStyle
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isForceOpen) onClose();
          }}
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
                  {isForceOpen ? 'Initialize Your Profile' : 'Personalize Your Profile'}
                </h2>
                <p className="text-[11px] text-zinc-400">
                  Customizes AI schedules, sleep constraints, and goals.
                </p>
              </div>
            </div>
            {!isForceOpen && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-400 font-mono">
                ⚠ {error}
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <User size={12} className="text-amber-500" />
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Vinay"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 focus:outline-none text-xs text-zinc-100 transition-colors"
                required
              />
            </div>

            {/* Wake / Sleep Bounds */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={12} className="text-blue-400" />
                  Wake-Up Time
                </label>
                <input
                  type="time"
                  value={wakeUpTime}
                  onChange={(e) => setWakeUpTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 focus:outline-none text-xs text-zinc-100 font-mono transition-colors"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={12} className="text-indigo-400" />
                  Sleep Time
                </label>
                <input
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 focus:outline-none text-xs text-zinc-100 font-mono transition-colors"
                  required
                />
              </div>
            </div>

            {/* Preferred Work Style */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-400" />
                Preferred Work Style
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setWorkStyle('pomodoro')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                    workStyle === 'pomodoro'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md shadow-amber-500/5'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider block">Short Bursts</span>
                  <div>
                    <span className="text-[11px] font-semibold block text-zinc-100">Pomodoro</span>
                    <span className="text-[9px] text-zinc-500 leading-tight block mt-0.5">25-50 min focused blocks + rest.</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkStyle('focused')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                    workStyle === 'focused'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-md shadow-blue-500/5'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider block">Deep Focus</span>
                  <div>
                    <span className="text-[11px] font-semibold block text-zinc-100">Long Sessions</span>
                    <span className="text-[9px] text-zinc-500 leading-tight block mt-0.5">90-120 min unbroken deep work.</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkStyle('fluid')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                    workStyle === 'fluid'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/5'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider block">Fluidity</span>
                  <div>
                    <span className="text-[11px] font-semibold block text-zinc-100">Adaptive / Mix</span>
                    <span className="text-[9px] text-zinc-500 leading-tight block mt-0.5">Custom durations and adaptive blocks.</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Recurring Daily Commitments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Dumbbell size={12} className="text-purple-400" />
                  Daily Commitments
                </label>
                <span className="text-[9px] text-zinc-500 font-mono">e.g. classes, gym, prayer</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Gym at 6:00 PM, Chemistry Class"
                  value={newCommitment}
                  onChange={(e) => setNewCommitment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCommitment();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 focus:outline-none text-xs text-zinc-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddCommitment}
                  className="px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-zinc-100 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              {commitments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {commitments.map((commitment, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-mono"
                    >
                      <span>{commitment}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCommitment(idx)}
                        className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Personal Goals (max 3) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Target size={12} className="text-pink-400" />
                  Personal Goals (Max 3)
                </label>
                <span className="text-[9px] text-zinc-500 font-mono">
                  {goals.length}/3 added
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Drink more water, Stand up every hour"
                  value={newGoal}
                  disabled={goals.length >= 3}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddGoal();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 focus:outline-none text-xs text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={handleAddGoal}
                  disabled={goals.length >= 3}
                  className="px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-zinc-100 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={14} />
                </button>
              </div>

              {goals.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {goals.map((goal, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-mono"
                    >
                      <Check size={10} className="text-emerald-500" />
                      <span>{goal}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(idx)}
                        className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-2">
            {!isForceOpen && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-xs text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
            >
              <Check size={14} />
              <span>Save & Personalize</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
