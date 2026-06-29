export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  createdAt: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: 'work' | 'personal' | 'routine' | 'break' | 'critical';
  completed: boolean;
  isCarriedOver?: boolean;
}

export interface PendingTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  date: string;
}

export interface SearchSource {
  title: string;
  uri: string;
}

export interface ScheduleResponse {
  timeBlocks: Omit<ScheduleItem, 'id' | 'completed'>[];
  priorityInsights: string[];
  productivityTip: string;
  isSearchGroundingActive?: boolean;
  searchSources?: SearchSource[];
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: string;
  insights?: string;
  tags?: string[];
}

export interface JournalAnalysisResponse {
  mood: string;
  insights: string;
  advice: string;
  tags: string[];
}

export interface UserProfile {
  name: string;
  wakeUpTime: string;
  sleepTime: string;
  commitments: string[];
  goals: string[];
  workStyle: 'focused' | 'pomodoro' | 'fluid';
}

