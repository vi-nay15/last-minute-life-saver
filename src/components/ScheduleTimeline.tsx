import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Briefcase, 
  User, 
  Coffee, 
  RotateCcw, 
  AlertTriangle, 
  Sparkles,
  Info,
  ExternalLink,
  ChevronRight,
  CalendarDays,
  X,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ScheduleItem, PendingTask, SearchSource } from '../types';

interface ScheduleTimelineProps {
  schedule: ScheduleItem[];
  priorityInsights: string[];
  productivityTip: string;
  onToggleComplete: (id: string) => void;
  onReset: () => void;
  onDownloadCalendarFile: () => void;
  pendingTasks?: PendingTask[];
  onDismissPendingTask?: (id: string) => void;
  isSearchGroundingActive?: boolean;
  searchSources?: SearchSource[];
}

const TYPE_ICONS = {
  work: <Briefcase size={14} className="text-cyan-400" />,
  personal: <User size={14} className="text-emerald-400" />,
  routine: <RotateCcw size={14} className="text-blue-400" />,
  break: <Coffee size={14} className="text-pink-400" />,
  critical: <AlertTriangle size={14} className="text-rose-400" />
};

const TYPE_STYLES = {
  work: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  personal: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  routine: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  break: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  critical: "bg-rose-500/10 text-rose-400 border-rose-500/20 border"
};

export default function ScheduleTimeline({ 
  schedule, 
  priorityInsights, 
  productivityTip, 
  onToggleComplete,
  onReset,
  onDownloadCalendarFile,
  pendingTasks = [],
  onDismissPendingTask,
  isSearchGroundingActive = false,
  searchSources = []
}: ScheduleTimelineProps) {

  const getPriorityStyle = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-zinc-400 bg-zinc-800 text-zinc-400 border-zinc-700/50';
    }
  };

  const completedCount = schedule.filter(item => item.completed).length;
  const progressPercent = schedule.length > 0 ? Math.round((completedCount / schedule.length) * 100) : 0;

  if (schedule.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-[550px]" id="empty-schedule-state">
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-full mb-4 text-zinc-500">
          <Clock size={36} />
        </div>
        <h3 className="font-display font-medium text-lg text-zinc-200 mb-2">No Active Lifesaver Plan</h3>
        <p className="text-sm text-zinc-500 max-w-sm mb-6">
          Describe your chaos on the left, and our AI will break it down into an ultra-ordered, hour-by-hour timeline.
        </p>
        <div className="flex gap-2">
          <div className="text-[10px] uppercase font-mono px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-md">
            Hour-by-hour tracking
          </div>
          <div className="text-[10px] uppercase font-mono px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-md">
            Gemini Intelligence
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl h-full flex flex-col justify-between" id="schedule-timeline-card">
      <div className="space-y-6">
        {/* Header with Title and Reset */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-display font-semibold text-lg text-zinc-100 flex items-center gap-2">
              <span>Today's Rescue Timeline</span>
              <span className="text-xs font-mono font-normal bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                {progressPercent}% Complete
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Hour-by-hour time blocks optimized for focus.</p>
          </div>
          <button 
            onClick={onReset}
            className="p-1.5 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg transition-all duration-200"
            title="Wipe plan and start fresh"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Productivity Tip Box */}
        {productivityTip && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3 items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 text-[9px] font-mono uppercase bg-amber-500/10 text-amber-500/70 rounded-bl border-l border-b border-amber-500/20">
              AI Tip
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-amber-400 mb-0.5">Focus Strategy</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{productivityTip}</p>
            </div>
          </div>
        )}

        {/* Pending from before section */}
        {pendingTasks && pendingTasks.length > 0 && (
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Pending from before
              </h3>
              <span className="text-[9px] text-zinc-500 font-mono">
                {pendingTasks.length} {pendingTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-3 bg-zinc-900/40 border border-zinc-800/40 p-2 py-1.5 rounded-lg text-xs group">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-200 truncate">{task.title}</span>
                      <span className="text-[8px] text-zinc-500 shrink-0 font-mono">({task.date})</span>
                    </div>
                    {task.description && (
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">{task.description}</p>
                    )}
                  </div>
                  {onDismissPendingTask && (
                    <button
                      type="button"
                      onClick={() => onDismissPendingTask(task.id)}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-all cursor-pointer shrink-0"
                      title="Dismiss from pending memory"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline Scrollable Area */}
        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
          {schedule.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative flex gap-4 p-4 rounded-xl border transition-all duration-200 group ${
                item.completed 
                  ? 'bg-zinc-950/40 border-zinc-900/60 opacity-60' 
                  : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700/60'
              }`}
            >
              {/* Timeline Connector Line */}
              {index < schedule.length - 1 && (
                <div className="absolute left-10 top-14 bottom-[-16px] w-[2px] bg-zinc-800 group-hover:bg-zinc-700" />
              )}

              {/* Complete Checkbox */}
              <button
                onClick={() => onToggleComplete(item.id)}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-full shrink-0"
              >
                {item.completed ? (
                  <CheckCircle2 size={20} className="text-amber-500 fill-amber-500/10" />
                ) : (
                  <Circle size={20} className="text-zinc-600 hover:text-amber-500 transition-colors" />
                )}
              </button>

              {/* Main Content */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-xs font-mono font-medium flex items-center gap-1.5 ${item.completed ? 'text-zinc-500' : 'text-amber-400'}`}>
                    <Clock size={12} />
                    {item.time}
                  </span>
                  
                  {/* Tags */}
                  <div className="flex gap-1.5">
                    {item.isCarriedOver && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold border bg-amber-500/10 text-amber-500 border-amber-500/20">
                        Carried Over
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold border ${TYPE_STYLES[item.type] || TYPE_STYLES.work} flex items-center gap-1`}>
                      {TYPE_ICONS[item.type] || TYPE_ICONS.work}
                      {item.type}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold border ${getPriorityStyle(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className={`font-display font-medium text-sm text-zinc-100 ${item.completed ? 'line-through text-zinc-500' : ''}`}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Universal Calendar Exporter Control Panel */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mt-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-amber-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-zinc-300">Universal Calendar Export</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">iCalendar (.ics) format</span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Take this timeline on the go. Download the <code className="text-amber-400 bg-zinc-900 px-1 py-0.5 rounded font-mono">.ics</code> file to import your time blocks directly into Google Calendar, Apple Calendar, or Microsoft Outlook.
        </p>

        <button
          onClick={onDownloadCalendarFile}
          disabled={schedule.length === 0}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md shadow-amber-500/5 active:scale-[0.99]"
        >
          <CalendarDays size={14} />
          <span>Download Calendar File (.ics)</span>
        </button>
      </div>

      {/* Priority Insights Section */}
      {priorityInsights && priorityInsights.length > 0 && (
        <div className="mt-6 pt-6 border-t border-zinc-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs uppercase font-mono font-semibold tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Info size={14} className="text-amber-500" />
              Priority Coaching Insights
            </h4>
            {isSearchGroundingActive && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/25 animate-pulse font-mono font-bold">
                <Globe size={10} />
                AI used live search data
              </span>
            )}
          </div>
          <div className="space-y-2">
            {priorityInsights.map((insight, idx) => (
              <div key={idx} className="flex gap-2 text-xs text-zinc-300 bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg">
                <ChevronRight size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <span>{insight}</span>
              </div>
            ))}
          </div>

          {/* Grounded Search Sources list if available */}
          {isSearchGroundingActive && searchSources && searchSources.length > 0 && (
            <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3 space-y-2 mt-3">
              <div className="text-[10px] font-mono text-zinc-500 uppercase font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Sources grounded in Google Search:
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                {searchSources.map((source, sIdx) => (
                  <a
                    key={sIdx}
                    href={source.uri}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-amber-400 underline transition-colors"
                  >
                    <ExternalLink size={10} className="shrink-0" />
                    <span className="truncate max-w-[200px]">{source.title || "Web Resource"}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
