export interface Project {
  id: number;
  name: string;
  description?: string;
  repo_url?: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateProjectParams {
  name: string;
  description?: string;
  repo_url?: string;
}

export interface UpdateProjectParams {
  pre_name: string;
  name?: string;
  description?: string;
  repo_url?: string;
}

export interface ProjectInfoResponse {
  code: number;
  message: string;
  data: Project;
}

export interface ProjectListResponse {
  code: number;
  message: string;
  projects: Project[];
}

export interface AskProjectParams {
  name: string;
  question: string;
}

export interface AskProjectResponse {
  code: number;
  message: string;
  answer: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
}

