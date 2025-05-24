/**
 * Standup Service Types
 */

export interface StandupEntry {
  id: string;
  userId: string;
  companyId: string;
  date: string;
  yesterday: string;
  today: string;
  blockers?: string;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  createdAt?: string;
  updatedAt?: string;
}

export interface StandupTask {
  id: string;
  standupEntryId?: string;
  userId: string;
  companyId: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface StandupAnswer {
  id: string;
  userId: string;
  companyId: string;
  question: string;
  answer: string;
  context?: Record<string, any>;
  createdAt?: string;
}

export interface StandupService {
  /**
   * Get standup entries for a user
   */
  getUserEntries(userId: string, limit?: number): Promise<StandupEntry[]>;
  
  /**
   * Get standup entries for a company
   */
  getCompanyEntries(companyId: string, date?: string): Promise<StandupEntry[]>;
  
  /**
   * Create a standup entry
   */
  createEntry(entry: Omit<StandupEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<StandupEntry>;
  
  /**
   * Update a standup entry
   */
  updateEntry(entryId: string, updates: Partial<StandupEntry>): Promise<StandupEntry>;
  
  /**
   * Generate tasks from standup entry
   */
  generateTasks(entryId: string): Promise<StandupTask[]>;
  
  /**
   * Get tasks for a user
   */
  getUserTasks(userId: string, status?: StandupTask['status']): Promise<StandupTask[]>;
  
  /**
   * Get tasks for a company
   */
  getCompanyTasks(companyId: string, status?: StandupTask['status']): Promise<StandupTask[]>;
  
  /**
   * Create a task
   */
  createTask(task: Omit<StandupTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<StandupTask>;
  
  /**
   * Update a task
   */
  updateTask(taskId: string, updates: Partial<StandupTask>): Promise<StandupTask>;
  
  /**
   * Delete a task
   */
  deleteTask(taskId: string): Promise<void>;
  
  /**
   * Get standup answers for context
   */
  getAnswerHistory(userId: string, limit?: number): Promise<StandupAnswer[]>;
  
  /**
   * Save an answer
   */
  saveAnswer(answer: Omit<StandupAnswer, 'id' | 'createdAt'>): Promise<StandupAnswer>;
  
  /**
   * Generate AI response for standup
   */
  generateAiResponse(userId: string, companyId: string, question: string, context?: Record<string, any>): Promise<string>;
}