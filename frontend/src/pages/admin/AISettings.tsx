import { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import { aiSettingsApi, AISettings, AIStatus } from "../../api/aiSettings.api";

// Available LLM models
const LLM_MODELS = [
  "gpt-3.5-turbo",
  "gpt-4",
  "gpt-4-turbo",
  "gpt-4o",
  "claude-3-opus",
  "claude-3-sonnet",
  "claude-3-haiku",
  "claude-3-5-sonnet",
  "llama-3-70b",
  "llama-3-8b",
  "mixtral-8x7b",
];

export default function AISettingsPage() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Local state for editable configuration values
  const [llmModel, setLlmModel] = useState<string>("");
  const [llmTemperature, setLlmTemperature] = useState<number>(0.7);
  const [ragTopK, setRagTopK] = useState<number>(5);
  const [skillInferenceThreshold, setSkillInferenceThreshold] = useState<number>(0.6);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [token]);

  const loadSettings = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [settingsResponse, statusResponse] = await Promise.all([
        aiSettingsApi.getSettings(token),
        aiSettingsApi.getStatus(),
      ]);
      // Extract data from axios response
      const settingsData = settingsResponse.data;
      const statusData = statusResponse.data;
      
setSettings(settingsData);
      setStatus(statusData);
      // Set isAdmin from settings response
      setIsAdmin(settingsData.is_admin || false);
      
      // Initialize local state with loaded values
      setLlmModel(settingsData.llm_model || "gpt-3.5-turbo");
      setLlmTemperature(settingsData.llm_temperature ?? 0.7);
      setRagTopK(settingsData.rag_top_k ?? 5);
      setSkillInferenceThreshold(settingsData.skill_inference_threshold ?? 0.6);
    } catch (error) {
      console.error("Failed to load AI settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof AISettings, value: boolean) => {
    if (!token || !settings || !isAdmin) return;
    setSaving(true);
    setMessage(null);
    try {
      const updateData: Record<string, boolean> = {};
      if (key === "enable_llm") updateData.enable_llm = value;
      if (key === "enable_rag") updateData.enable_rag = value;
      if (key === "enable_evaluation") updateData.enable_evaluation = value;
      if (key === "enable_memory") updateData.enable_memory = value;

      const response = await aiSettingsApi.updateSettings(token, updateData);
      const result = response.data;
      
      setSettings({
        ...settings,
        enable_llm: result.current_settings.enable_llm,
        enable_rag: result.current_settings.enable_rag,
        enable_evaluation: result.current_settings.enable_evaluation,
        enable_memory: result.current_settings.enable_memory,
      });
      setStatus({
        ...status!,
        ai_enabled: result.current_settings.enable_llm || result.current_settings.enable_rag,
        llm_enabled: result.current_settings.enable_llm,
        rag_enabled: result.current_settings.enable_rag,
        features: {
          llm: result.current_settings.enable_llm,
          rag: result.current_settings.enable_rag,
          evaluation: result.current_settings.enable_evaluation,
          memory: result.current_settings.enable_memory,
        },
      });
setMessage({ type: "success", text: "Settings updated successfully!" });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Failed to update settings";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleConfigChange = (key: string, value: number | string) => {
    setHasChanges(true);
    if (key === "llm_model") {
      setLlmModel(value as string);
    } else if (key === "llm_temperature") {
      setLlmTemperature(value as number);
    } else if (key === "rag_top_k") {
      setRagTopK(value as number);
    } else if (key === "skill_inference_threshold") {
      setSkillInferenceThreshold(value as number);
    }
  };

  const handleSaveConfig = async () => {
    if (!token || !isAdmin) return;
    setSaving(true);
    setMessage(null);
    try {
      const updateData = {
        llm_model: llmModel,
        llm_temperature: llmTemperature,
        rag_top_k: ragTopK,
        skill_inference_threshold: skillInferenceThreshold,
      };

      const response = await aiSettingsApi.updateSettings(token, updateData);
      const result = response.data;
      
      setSettings({
        ...settings!,
        llm_model: result.current_settings.llm_model ?? llmModel,
        llm_temperature: result.current_settings.llm_temperature ?? llmTemperature,
        rag_top_k: result.current_settings.rag_top_k ?? ragTopK,
        skill_inference_threshold: result.current_settings.skill_inference_threshold ?? skillInferenceThreshold,
      });
      setHasChanges(false);
      setMessage({ type: "success", text: "Configuration saved successfully!" });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Failed to save configuration";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Settings</h1>

      {/* Admin Notice */}
      {!isAdmin && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            You are viewing AI settings in read-only mode. Only administrators can modify these settings.
          </p>
        </div>
      )}

      {/* Status Banner */}
      {status && (
        <div className={`mb-6 p-4 rounded-lg ${
          status.ai_enabled ? "bg-green-100 border border-green-300" : "bg-gray-100 border border-gray-300"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                AI Status: {status.ai_enabled ? "Enabled" : "Disabled"}
              </h2>
              <p className="text-sm text-gray-600">
                {status.ai_enabled 
                  ? "AI features are currently active. Pages may load slower."
                  : "AI features are disabled for faster performance."}
              </p>
            </div>
            <div className="flex gap-2">
              {status.features.llm && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">LLM</span>
              )}
              {status.features.rag && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">RAG</span>
              )}
              {status.features.evaluation && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Evaluation</span>
              )}
              {status.features.memory && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Memory</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {message.text}
        </div>
      )}

      {/* Settings Toggle Cards */}
      <div className="grid gap-4 mb-6">
        {/* LLM Setting */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">LLM (Large Language Model)</h3>
              <p className="text-sm text-gray-600">
                Enable AI-powered responses and explanations
              </p>
            </div>
            {isAdmin ? (
              <button
                onClick={() => handleToggle("enable_llm", !settings?.enable_llm)}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings?.enable_llm ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings?.enable_llm ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            ) : (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                settings?.enable_llm ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
              }`}>
                {settings?.enable_llm ? "Enabled" : "Disabled"}
              </span>
            )}
          </div>
        </div>

        {/* RAG Setting */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">RAG (Retrieval Augmented Generation)</h3>
              <p className="text-sm text-gray-600">
                Enable semantic search and knowledge retrieval
              </p>
            </div>
            {isAdmin ? (
              <button
                onClick={() => handleToggle("enable_rag", !settings?.enable_rag)}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings?.enable_rag ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings?.enable_rag ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            ) : (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                settings?.enable_rag ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
              }`}>
                {settings?.enable_rag ? "Enabled" : "Disabled"}
              </span>
            )}
          </div>
        </div>

        {/* Evaluation Setting */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">AI Evaluation</h3>
              <p className="text-sm text-gray-600">
                Enable AI quality checks and metrics
              </p>
            </div>
            {isAdmin ? (
              <button
                onClick={() => handleToggle("enable_evaluation", !settings?.enable_evaluation)}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings?.enable_evaluation ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings?.enable_evaluation ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            ) : (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                settings?.enable_evaluation ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
              }`}>
                {settings?.enable_evaluation ? "Enabled" : "Disabled"}
              </span>
            )}
          </div>
        </div>

        {/* Memory Setting */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Conversation Memory</h3>
              <p className="text-sm text-gray-600">
                Enable learning from conversations
              </p>
            </div>
            {isAdmin ? (
              <button
                onClick={() => handleToggle("enable_memory", !settings?.enable_memory)}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings?.enable_memory ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings?.enable_memory ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            ) : (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                settings?.enable_memory ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
              }`}>
                {settings?.enable_memory ? "Enabled" : "Disabled"}
              </span>
            )}
          </div>
        </div>
      </div>

{/* Advanced Configuration Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-gray-800">Advanced Configuration</h3>
          </div>
          {isAdmin && hasChanges && (
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium transition-colors"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* LLM Model - Dropdown */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">LLM Model</p>
              </div>
            </div>
            {isAdmin ? (
              <select
                value={llmModel}
                onChange={(e) => handleConfigChange("llm_model", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              >
                {LLM_MODELS.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            ) : (
              <p className="font-semibold text-gray-800 text-sm">{llmModel}</p>
            )}
          </div>

          {/* Temperature - Range Slider */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Temperature</p>
              </div>
              <span className="text-sm font-bold text-orange-600">{llmTemperature.toFixed(1)}</span>
            </div>
            {isAdmin ? (
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={llmTemperature}
                  onChange={(e) => handleConfigChange("llm_temperature", parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0.0</span>
                  <span>2.0</span>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-orange-500 h-1.5 rounded-full" 
                    style={{ width: `${(llmTemperature / 2) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* RAG Top K - Range Slider */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">RAG Top K</p>
              </div>
            </div>
            {isAdmin ? (
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={ragTopK}
                  onChange={(e) => handleConfigChange("rag_top_k", parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-green-600">{ragTopK}</span>
                  <span className="text-xs text-gray-400">results</span>
                </div>
              </div>
            ) : (
              <p className="font-semibold text-gray-800">{ragTopK}</p>
            )}
          </div>

          {/* Skill Inference Threshold - Range Slider */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Skill Inference Threshold</p>
              </div>
              <span className="text-sm font-bold text-red-600">{skillInferenceThreshold.toFixed(1)}</span>
            </div>
            {isAdmin ? (
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={skillInferenceThreshold}
                  onChange={(e) => handleConfigChange("skill_inference_threshold", parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0.0</span>
                  <span>1.0</span>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-red-500 h-1.5 rounded-full" 
                    style={{ width: `${skillInferenceThreshold * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Embedding Model - Read Only */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Embedding Model</p>
              </div>
            </div>
            <p className="font-semibold text-gray-800 text-sm">{settings?.embedding_model || 'Not configured'}</p>
            <p className="text-xs text-gray-400 mt-2">Model used for semantic embeddings and vector search</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>These settings control the AI behavior and performance. Modify with caution.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
