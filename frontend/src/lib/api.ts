// Use relative path for nginx proxy, or full URL for direct access
//const API_BASE_URL ="http://localhost:5000";
const API_BASE_URL ="https://career-compass-backend-production-162c.up.railway.app";
// const API_BASE_URL ="http://10.109.91.179:5000";

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', response.status, errorData);
      console.error('Detail array:', JSON.stringify(errorData.detail));
      // Handle Pydantic validation errors which come as arrays
      let errorMessage = `HTTP ${response.status}`;
      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
        } else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        }
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
      return { error: errorMessage };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API Network Error:', error);
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

  // Auth endpoints
  async register(email: string, name: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    });
  }

  async login(email: string, password: string) {
     return this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
  });
  }
 

async getProfile(token: string) {
    return this.request('/profile/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Skills endpoints
  async submitAssessment(token: string, skills: any[]) {
    return this.request('/skills/submit', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ skills }),
    });
  }

  async analyzeSkills(token: string) {
    return this.request('/skills/analyze', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateSingleSkill(token: string, skillId: string, level: string, confidence: number, score: number) {
    return this.request('/skills/update-single', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        skill_id: parseInt(skillId.split('-')[1]),
        level,
        confidence,
        score,
      }),
    });
  }

  async getUserSkills(token: string) {
    return this.request('/skills/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Career endpoints
  async getRecommendations(token: string, topN: number = 5) {
    return this.request(`/career/matches`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }


  // Learning endpoints
  async generateLearningPath(token: string, targetRoleId: string) {
    return this.request('/learning/paths', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ target_role_id: parseInt(targetRoleId) }),
    });
  }

  async getLearningPaths(token: string) {
    return this.request('/learning/paths', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getLearningPath(token: string, pathId: string) {
    return this.request(`/learning/path/${pathId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async completeLearningStep(token: string, pathId: string, stepId: string) {
    return this.request(`/learning/path/${pathId}/step/${stepId}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }


  // Chatbot endpoints
  async processQuery(token: string, message: string, sessionId?: string) {
    return this.request('/chatbot/message', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message, session_id: sessionId ? parseInt(sessionId) : null }),
    });
  }

  async getChatSessions(token: string) {
    return this.request('/chatbot/sessions', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getSessionMessages(token: string, sessionId: string) {
    return this.request(`/chatbot/session/${sessionId}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }


  // Password reset endpoints
  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(resetToken: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
    });
  }

async updateProfile(token: string, data: { first_name?: string | null; last_name?: string | null; phone?: string | null; location?: string | null; experience_years?: number | null; bio?: string | null; current_role?: string | null }) {
    // Ensure full ProfileUpdate shape, nulls explicitly included
    const body = {
      first_name: data.first_name ?? null,
      last_name: data.last_name ?? null,
      phone: data.phone ?? null,
      location: data.location ?? null,
      experience_years: data.experience_years ?? null,
      bio: data.bio ?? null,
      current_role: data.current_role ?? null,
    };
    
    console.log('Sending profile update to /profile/:', JSON.stringify(body));
    
    return this.request('/profile/', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  }


};

export const api = new ApiService(API_BASE_URL);
