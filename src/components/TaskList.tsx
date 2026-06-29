import React, { useState } from 'react';
import { Plus, Trash2, ListTodo, CheckSquare, Square, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (title: string, priority: 'high' | 'medium' | 'low', category: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskList({ tasks, onAddTask, onToggleTask, onDeleteTask }: TaskListProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [category, setCategory] = useState('General');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask(title.trim(), priority, category);
    setTitle('');
  };

  const getPriorityColor = (p: 'high' | 'medium' | 'low') => {
    switch (p) {
      case 'high': return 'bg-rose-500/15 text-rose-400 border-rose-500/20';
      case 'medium': return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
      case 'low': return 'bg-zinc-800 text-zinc-400 border-zinc-700/50';
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // completed goes to bottom
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    // higher priority goes to top
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between" id="task-list-card">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
            <ListTodo size={18} />
          </div>
          <div>
            <h2 className="font-display font-semibold text-base text-zinc-100">Rescue Checklist</h2>
            <p className="text-[11px] text-zinc-400">Track and crush side-quests or standalone chores.</p>
          </div>
        </div>

        {/* Task Input Form */}
        <form onSubmit={handleSubmit} className="space-y-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a crisis task (e.g., Email professor...)"
            className="w-full bg-transparent border-none text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-0 p-1"
            required
          />
          
          <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
            {/* Priority Selector */}
            <div className="flex gap-1">
              {(['high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`text-[9px] px-2 py-1 rounded-md uppercase font-semibold transition-all ${
                    priority === p 
                      ? p === 'high' ? 'bg-rose-500 text-zinc-950' 
                        : p === 'medium' ? 'bg-amber-500 text-zinc-950' 
                        : 'bg-zinc-700 text-zinc-100'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Category / Submit */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="w-16 bg-zinc-900 text-zinc-300 text-[10px] px-2 py-1 rounded-md border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500 text-center"
              />
              <button
                type="submit"
                className="p-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-md transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </form>

        {/* Tasks List */}
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {sortedTasks.length === 0 ? (
              <p className="text-zinc-500 text-xs text-center py-4 italic">No side quests logged yet. You're fully focused!</p>
            ) : (
              sortedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all ${
                    task.completed 
                      ? 'bg-zinc-950/40 border-zinc-950 opacity-50' 
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="text-zinc-500 hover:text-amber-500 transition-colors shrink-0"
                    >
                      {task.completed ? (
                        <CheckSquare size={16} className="text-amber-500" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium truncate ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {task.title}
                      </p>
                      <div className="flex gap-1.5 mt-0.5 items-center">
                        <span className={`text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.category && (
                          <span className="text-[9px] text-zinc-500 font-mono truncate max-w-[80px]">
                            #{task.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 rounded-md transition-colors shrink-0 ml-2"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
