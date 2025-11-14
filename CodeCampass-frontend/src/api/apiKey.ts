import api from './index';
import type { ApiResponse } from './auth';

export interface OpenAIKeyInfo {
  key: string;
  is_set: boolean;
  full_key: boolean;
}

export const apiKeyApi = {
  // 获取 OpenAI API Key
  getOpenAIKey: (): Promise<ApiResponse<OpenAIKeyInfo>> =>
    api.get('/api/getOpenAIKey'),

  // 设置 OpenAI API Key
  setOpenAIKey: (key: string): Promise<ApiResponse> =>
    api.post('/api/setOpenAIKey', null, { params: { key } }),

  // 删除 OpenAI API Key
  deleteOpenAIKey: (): Promise<ApiResponse> =>
    api.delete('/api/deleteOpenAIKey'),
};




