import axiosClient from './axiosClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: 'user' | 'admin';
  };
}

export interface RegisterResponse {
  message: string;
  user_id: number;
  requires_verification: boolean;
}

export interface ProfileResponse {
  id: number;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
  experience_years?: number;
  bio?: string;
  role: 'user' | 'admin';
  currentRole?: string;
}

export interface ProfileUpdate {
  first_name?: string;
  last_name?: string;
  location?: string;
  experience_years?: number;
  bio?: string;
}

export type OtpPurpose = 'verify' | 'reset';

export interface SendOtpRequest {
  email: string;
  purpose: OtpPurpose;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
  purpose: OtpPurpose;
}

export interface VerifyOtpResponse {
  message: string;
  reset_token?: string;
}

export interface PrivacyRequestResult {
  request_id: string;
  status: string;
  type: string;
  timestamp: string;
  message: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await axiosClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const response = await axiosClient.get<ProfileResponse>('/profile/');
    return response.data;
  },

  updateProfile: async (data: ProfileUpdate): Promise<ProfileResponse> => {
    const response = await axiosClient.put<ProfileResponse>('/profile/', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Client-side logout, clear tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  refreshToken: async (): Promise<{ access_token: string }> => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axiosClient.post<{ access_token: string }>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  sendOtp: async (data: SendOtpRequest): Promise<{ message: string }> => {
    const response = await axiosClient.post<{ message: string }>('/auth/send-otp', data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const response = await axiosClient.post<VerifyOtpResponse>('/auth/verify-otp', data);
    return response.data;
  },

  requestPrivacy: async (type: string): Promise<PrivacyRequestResult> => {
    const response = await axiosClient.post<PrivacyRequestResult>('/privacy/request', { type });
    return response.data;
  },
};

