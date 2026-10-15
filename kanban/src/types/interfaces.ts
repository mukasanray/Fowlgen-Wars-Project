// TypeScript interfaces for OpenSpec ↔ GitHub Kanban Integration
 
export interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  github?: string;
  email?: string;
}

export interface GitHubProject {
  id: string;
  name: string;
}

export interface GitHubIssue {
  id: string;
  title: string;
  url: string;
  body: string;
  labels: string[];
  state: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface GitHubProjectItem {
  id: string;
  title: string;
  body: string;
  status: string;
  column: {
    name: string;
  };
}

export interface OpenSpecFeature {
  name: string;
  directory: string;
  proposal: string;
  tasks: string[];
  completedTasks: number;
  totalTasks: number;
}

export interface KanbanColumn {
  name: string;
  status: string;
  color: string;
}

export interface KanbanConfig {
  projectId: string;
  projectName: string;
  assignee: string;
  defaultLabels: string[];
  columns: KanbanColumn[];
  statusMapping: Record<string, string>;
}

export interface SyncResult {
  timestamp: string;
  featuresProcessed: number;
  itemsCreated: number;
  itemsUpdated: number;
  errors: string[];
  success: boolean;
}

export interface DashboardData {
  features: OpenSpecFeature[];
  columns: KanbanColumn[];
  metrics: {
    totalFeatures: number;
    inProgress: number;
    completed: number;
    backlog: number;
  };
  lastUpdated: string;
}