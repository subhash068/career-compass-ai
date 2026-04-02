import apiClient from '@/api/axiosClient';
import type { ProfileResponse, ProfileUpdate } from '@/types/profile';

export const profileApi = {
  getProfile: async (): Promise<ProfileResponse> => {
    try {
      const response = await apiClient.get('/profile/');
      return response.data;
    } catch (error: any) {
      console.error('Profile get error:', error);
      const status = error.response?.status;
      if (status === 500) {
        throw new Error('Server error (500) - Profile service temporarily unavailable. Please try again.');
      } else if (status === 0 || error.message.includes('CORS')) {
        throw new Error('CORS/Network error - Check if backend is running on localhost:5000 and restart browser.');
      }
      throw error;
    }
  },

  updateProfile: async (data: ProfileUpdate): Promise<ProfileResponse> => {
    // Ensure phone is included (null explicitly)
    const updateData = data; // phone now in ProfileUpdate
    try {
      const response = await apiClient.put('/profile/', updateData);
      return response.data;
    } catch (error: any) {
      console.error('Profile update error:', error);
      const status = error.response?.status;
      if (status === 500) {
        throw new Error('Server error (500) - Profile update failed. Check backend logs.');
      } else if (status === 0 || error.message.includes('CORS')) {
        throw new Error('CORS/Network error - Verify backend running and CORS settings.');
      }
      throw error;
    }
  },

  createProfile: async (data: ProfileUpdate): Promise<ProfileResponse> => {
    const updateData = data; // phone now in ProfileUpdate
    const response = await apiClient.post('/profile/', updateData);
    return response.data;
  },

  deleteProfile: async (): Promise<{ message: string; user_id: number }> => {
    const response = await apiClient.delete('/profile/');
    return response.data;
  },

};


