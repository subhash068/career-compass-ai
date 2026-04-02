import axiosClient from './axiosClient';

export interface AISettings {
  enable_llm: boolean;
  enable_rag: boolean;
  enable_evaluation: boolean;
  enable_memory: boolean;
  llm_model: string;
  llm_temperature: number;
  llm_max_tokens: number;
  rag_top_k: number;
  rag_similarity_threshold: number;
  skill_inference_threshold: number;
  embedding_model: string;
  is_admin: boolean;
}

export interface AISettingsUpdate {
  enable_llm?: boolean;
  enable_rag?: boolean;
  enable_evaluation?: boolean;
  enable_memory?: boolean;
  llm_model?: string;
  llm_temperature?: number;
  rag_top_k?: number;
  skill_inference_threshold?: number;
}

export interface AIStatus {
  ai_enabled: boolean;
  llm_enabled: boolean;
  rag_enabled: boolean;
  features: {
    llm: boolean;
    rag: boolean;
    evaluation: boolean;
    memory: boolean;
  };
}

export const aiSettingsApi = {
  getSettings: (token: string) => 
    axiosClient.get('/api/admin/ai-settings/', {
      headers: { Authorization: `Bearer ${token}` }
    }),

  updateSettings: (token: string, settings: AISettingsUpdate) =>
    axiosClient.put('/api/admin/ai-settings/', settings, {
      headers: { Authorization: `Bearer ${token}` }
    }),

  getStatus: () => 
    axiosClient.get('/api/admin/ai-settings/status'),
};
