import { apiClient } from '../../../lib/axios';
import type { LoginFormData, RegisterFormData } from '../auth.validation';
import type { User, ApiSuccessResponse } from '../../../types';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (data: LoginFormData) => {
    const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>('/auth/login', data);
    return response.data.data;
  },

  register: async (data: RegisterFormData) => {
    const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  },
};
