import api from './index';
import type {
  Project,
  CreateProjectParams,
  UpdateProjectParams,
  AskProjectParams,
} from '@/types/project';
import type { ApiResponse } from './auth';

export const projectApi = {
  // 创建项目
  createProject: (params: CreateProjectParams): Promise<ApiResponse<Project>> =>
    api.post('/api/createProject', null, { params }),

  // 获取项目列表
  listProjects: (): Promise<{ projects: Project[] }> =>
    api.get('/api/listProjects').then((response: any) => {
      const projects = response.projects || [];
      // 确保每个项目都有必需的字段
      return { 
        projects: projects.map((p: any) => ({
          ...p,
          id: p.id || 0,
          name: p.name || '',
          owner_id: p.owner_id || 0,
          created_at: p.created_at || new Date().toISOString(),
          updated_at: p.updated_at || new Date().toISOString(),
        }))
      };
    }),

  // 获取项目信息
  getProjectInfo: (name: string): Promise<ApiResponse<Project>> =>
    api.get('/api/getProjectInfo', { params: { name } }),

  // 更新项目
  updateProject: (params: UpdateProjectParams): Promise<ApiResponse<Project>> =>
    api.put('/api/updateProject', null, { params }),

  // 删除项目
  deleteProject: (name: string): Promise<ApiResponse> =>
    api.delete('/api/deleteProject', { params: { name } }),

  // 导入项目仓库
  importProjectRepo: (name: string): Promise<ApiResponse> =>
    api.post('/api/importProjectRepo', null, { params: { name } }),

  // 项目问答
  askProject: (params: AskProjectParams): Promise<ApiResponse<{ answer: string }>> =>
    api.post('/api/askProject', null, { params }).then((response: any) => {
      return {
        code: response.code || 0,
        message: response.message || '',
        data: { answer: response.answer || response.message || '' },
      };
    }),
};

