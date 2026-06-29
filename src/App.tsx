import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Flame, 
  HelpCircle, 
  Lightbulb, 
  AlertCircle,
  Clock,
  ListTodo,
  BookOpen,
  CalendarDays,
  Trash2,
  CheckCircle2,
  Share2
} from 'lucide-react';
import AIPromptInput from './components/AIPromptInput';
import ScheduleTimeline from './components/ScheduleTimeline';
import TaskList from './components/TaskList';
import DailyJournal from './components/DailyJournal';
import ProfileModal from './components/ProfileModal';
import { Task, ScheduleItem, JournalEntry, JournalAnalysisResponse, ScheduleResponse, UserProfile, PendingTask, SearchSource } from './types';

// Calendar helper exports
import { generateICSContent, downloadICSFile } from './utils/calendarHelper';

export default function App() {
  // Load initial states from localStorage
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('life_saver_schedule');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [priorityInsights, setPriorityInsights] = useState<string[]>(() => {
    const saved = localStorage.getItem('life_saver_insights');
    return saved ? JSON.parse(saved) : [];
  });

  const [productivityTip, setProductivityTip] = useState<string>(() => {
    return localStorage.getItem('life_saver_tip') || '';
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('life_saver_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('life_saver_journal');
    return saved ? JSON.parse(saved) : [];
  });

  // User profile state
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('life_saver_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Pending tasks memory state
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>(() => {
    const saved = localStorage.getItem('life_saver_pending_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // Search grounding states
  const [isSearchGroundingActive, setIsSearchGroundingActive] = useState<boolean>(() => {
    return localStorage.getItem('life_saver_grounding_active') === 'true';
  });

  const [searchSources, setSearchSources] = useState<SearchSource[]>(() => {
    const saved = localStorage.getItem('life_saver_search_sources');
    return saved ? JSON.parse(saved) : [];
  });

  // Auto-seed a test pending task on mount if none exist to make verification easy
  useEffect(() => {
    const saved = localStorage.getItem('life_saver_pending_tasks');
    if (!saved || JSON.parse(saved).length === 0) {
      const testTask: PendingTask = {
        id: 'test-robotics-101',
        title: 'Review robotics assignment notes',
        description: 'Review kinematics equations and controller design notes.',
        priority: 'high',
        date: 'Yesterday'
      };
      setPendingTasks([testTask]);
      localStorage.setItem('life_saver_pending_tasks', JSON.stringify([testTask]));
    }
  }, []);

  const handleDismissPendingTask = (id: string) => {
    const updated = pendingTasks.filter(t => t.id !== id);
    setPendingTasks(updated);
    localStorage.setItem('life_saver_pending_tasks', JSON.stringify(updated));
  };

  // Force open profile on first launch if not found
  useEffect(() => {
    if (!profile) {
      setIsProfileModalOpen(true);
    }
  }, [profile]);

  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [isAnalyzingJournal, setIsAnalyzingJournal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDownloadCalendarFile = () => {
    if (schedule.length === 0) {
      setErrorMsg("No active schedule to export.");
      return;
    }
    try {
      const content = generateICSContent(schedule);
      downloadICSFile('last_minute_life_saver_plan.ics', content);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(`Failed to generate calendar file: ${error.message || error}`);
    }
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('life_saver_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('life_saver_insights', JSON.stringify(priorityInsights));
  }, [priorityInsights]);

  useEffect(() => {
    localStorage.setItem('life_saver_tip', productivityTip);
  }, [productivityTip]);

  useEffect(() => {
    localStorage.setItem('life_saver_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('life_saver_journal', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('life_saver_grounding_active', String(isSearchGroundingActive));
  }, [isSearchGroundingActive]);

  useEffect(() => {
    localStorage.setItem('life_saver_search_sources', JSON.stringify(searchSources));
  }, [searchSources]);

  // Handle generating timeline plan
  const handleGenerateSchedule = async (prompt: string) => {
    setIsGeneratingSchedule(true);
    setErrorMsg(null);
    try {
      // Automatically save any tasks marked as incomplete at the end of the session
      const incompleteScheduleTasks = schedule.filter(item => !item.completed);
      let updatedPendingTasks = [...pendingTasks];
      if (incompleteScheduleTasks.length > 0) {
        const todayStr = new Date().toLocaleDateString();
        const newPending: PendingTask[] = incompleteScheduleTasks.map(item => ({
          id: item.id || Math.random().toString(36).substring(2, 9),
          title: item.title,
          description: item.description,
          priority: item.priority,
          date: todayStr
        }));
        
        // Filter out any duplicates (by title match to prevent cluttering)
        const filteredPrev = pendingTasks.filter(p => !newPending.some(n => n.title.toLowerCase() === p.title.toLowerCase()));
        updatedPendingTasks = [...filteredPrev, ...newPending];
        setPendingTasks(updatedPendingTasks);
        localStorage.setItem('life_saver_pending_tasks', JSON.stringify(updatedPendingTasks));
      }

      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: prompt, profile, pendingTasks: updatedPendingTasks })
      });

      if (!res.ok) {
        throw new Error(`Failed to generate schedule (${res.status})`);
      }

      const data: ScheduleResponse = await res.json();
      
      // Map server response to client state (assign random ids for client checklist usage)
      const formattedBlocks: ScheduleItem[] = data.timeBlocks.map((block) => ({
        ...block,
        id: Math.random().toString(36).substring(2, 9),
        completed: false
      }));

      setSchedule(formattedBlocks);
      setPriorityInsights(data.priorityInsights || []);
      setProductivityTip(data.productivityTip || '');
      setIsSearchGroundingActive(!!data.isSearchGroundingActive);
      setSearchSources(data.searchSources || []);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Something went wrong when reaching the server. Please check your credentials or network.');
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  // Toggle complete on schedule item
  const handleToggleScheduleItem = (id: string) => {
    setSchedule(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  // Clear timeline plan
  const handleResetSchedule = () => {
    if (window.confirm("Are you sure you want to discard this generated schedule plan?")) {
      setSchedule([]);
      setPriorityInsights([]);
      setProductivityTip('');
      setIsSearchGroundingActive(false);
      setSearchSources([]);
    }
  };

  // Task list triggers
  const handleAddTask = (title: string, priority: 'high' | 'medium' | 'low', category: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      completed: false,
      priority,
      category,
      createdAt: new Date().toLocaleDateString()
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // Journal analysis trigger
  const handleAnalyzeJournal = async (content: string): Promise<JournalAnalysisResponse> => {
    setIsAnalyzingJournal(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/journal-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!res.ok) {
        throw new Error(`Failed to analyze journal (${res.status})`);
      }

      return await res.json();
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Failed to reach the journal analyzer server.');
      throw error;
    } finally {
      setIsAnalyzingJournal(false);
    }
  };

  const handleAddJournalEntry = (content: string, analysis: JournalAnalysisResponse) => {
    const newEntry: JournalEntry = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toLocaleString(),
      content,
      mood: analysis.mood,
      insights: analysis.insights,
      tags: analysis.tags
    };
    setJournalEntries(prev => [...prev, newEntry]);
  };

  // Global clearing for debug/reset
  const handleResetAllData = () => {
    if (window.confirm("Reset all local schedules, tasks, journals, and user profile back to default empty state?")) {
      setSchedule([]);
      setPriorityInsights([]);
      setProductivityTip('');
      setTasks([]);
      setJournalEntries([]);
      setProfile(null);
      setPendingTasks([]);
      setIsSearchGroundingActive(false);
      setSearchSources([]);
      localStorage.removeItem('life_saver_profile');
      localStorage.removeItem('life_saver_pending_tasks');
      localStorage.removeItem('life_saver_grounding_active');
      localStorage.removeItem('life_saver_search_sources');
      setErrorMsg(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans" id="app-root-container">
      {/* Top Warning Banner / Alert */}
      {errorMsg && (
        <div className="bg-rose-950 border-b border-rose-800 text-rose-200 px-4 py-2.5 text-xs text-center flex items-center justify-center gap-2">
          <AlertCircle size={14} className="animate-pulse" />
          <span>{errorMsg}</span>
          <button 
            onClick={() => setErrorMsg(null)}
            className="underline font-bold ml-2 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary App Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-amber-500/10">
            <Flame size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-lg tracking-tight text-zinc-100">Last-Minute Life Saver</h1>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">
                v1.1
              </span>
            </div>
            <p className="text-xs text-zinc-400">Chaos containment cockpit powered by Gemini 3.5</p>
          </div>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center gap-3">
          {profile && (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
              title="Edit personalized profile"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>{profile.name}</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-zinc-300 font-medium">Auto-Saving Locally</span>
          </div>
          
          <button
            onClick={handleResetAllData}
            className="px-3 py-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-rose-400 rounded-lg transition-all"
            title="Wipe database cache"
          >
            Wipe Cache
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Intro Hero Box (Only if both schedule and tasks are empty to guide first-time user) */}
        {schedule.length === 0 && tasks.length === 0 && (
          <div className="bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-rose-500/5 border border-amber-500/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-full font-semibold">
                <Sparkles size={12} />
                No stress, you got this.
              </div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-zinc-100">
                Turn your brain dump into an absolute masterplan.
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Whether you just woke up late for work, have a brutal exam tomorrow, or are battling a mountain of miscellaneous domestic tasks—paste your story on the left. The AI extracts deadlines, clusters, breaks, and schedules them elegantly.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-center min-w-[120px]">
                <Clock size={20} className="text-amber-500 mx-auto mb-1.5" />
                <span className="block text-xs font-semibold text-zinc-300">Hour Blocking</span>
              </div>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-center min-w-[120px]">
                <ListTodo size={20} className="text-cyan-400 mx-auto mb-1.5" />
                <span className="block text-xs font-semibold text-zinc-300">Crisis Tasks</span>
              </div>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-center min-w-[120px]">
                <BookOpen size={20} className="text-emerald-400 mx-auto mb-1.5" />
                <span className="block text-xs font-semibold text-zinc-300">Mind Dumping</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Creator / Prompt Panel (4 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <AIPromptInput 
              onGenerate={handleGenerateSchedule} 
              isLoading={isGeneratingSchedule} 
            />

            {/* Quick Stats Panel */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl grid grid-cols-3 gap-4">
              <div className="text-center p-2 bg-zinc-950 rounded-xl border border-zinc-800/60">
                <span className="block text-[10px] uppercase font-mono font-bold text-zinc-500">Timeline</span>
                <span className="block text-lg font-display font-bold text-amber-500 mt-1">
                  {schedule.length} <span className="text-xs text-zinc-600 font-sans">blocks</span>
                </span>
              </div>
              <div className="text-center p-2 bg-zinc-950 rounded-xl border border-zinc-800/60">
                <span className="block text-[10px] uppercase font-mono font-bold text-zinc-500">Tasks</span>
                <span className="block text-lg font-display font-bold text-cyan-400 mt-1">
                  {tasks.filter(t => !t.completed).length} <span className="text-xs text-zinc-600 font-sans">left</span>
                </span>
              </div>
              <div className="text-center p-2 bg-zinc-950 rounded-xl border border-zinc-800/60">
                <span className="block text-[10px] uppercase font-mono font-bold text-zinc-500">Journals</span>
                <span className="block text-lg font-display font-bold text-emerald-400 mt-1">
                  {journalEntries.length} <span className="text-xs text-zinc-600 font-sans">logs</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Timeline Container (7 Cols) */}
          <div className="lg:col-span-7 h-full">
            <ScheduleTimeline 
              schedule={schedule}
              priorityInsights={priorityInsights}
              productivityTip={productivityTip}
              onToggleComplete={handleToggleScheduleItem}
              onReset={handleResetSchedule}
              onDownloadCalendarFile={handleDownloadCalendarFile}
              pendingTasks={pendingTasks}
              onDismissPendingTask={handleDismissPendingTask}
              isSearchGroundingActive={isSearchGroundingActive}
              searchSources={searchSources}
            />
          </div>
        </div>

        {/* Bottom Section: Side Chores Checklist & Emotional Decompression Journal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TaskList 
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />

          <DailyJournal 
            entries={journalEntries}
            onAddEntry={handleAddJournalEntry}
            isLoading={isAnalyzingJournal}
            onAnalyze={handleAnalyzeJournal}
          />
        </div>
      </main>

      {/* Ambient footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500 mt-12 bg-zinc-950">
        <p className="font-display font-medium text-zinc-400 mb-1">Last-Minute Life Saver</p>
        <p>A resilient client-server cockpit utilizing custom-mapped Gemini intelligence.</p>
      </footer>

      {/* User Profile Personalization Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={(updatedProfile) => {
          setProfile(updatedProfile);
          localStorage.setItem('life_saver_profile', JSON.stringify(updatedProfile));
        }}
        initialProfile={profile}
        isForceOpen={!profile}
      />
    </div>
  );
}
