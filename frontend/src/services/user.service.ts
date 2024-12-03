import api from '../lib/api';
import type { User } from '../types/auth.types';

interface UpdateProfileRequest {
  nickname?: string;
  avatar?: File;
}

interface UpdatePasswordRequest {
  newPassword: string;
  verificationCode: string;
}

class UserService {
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const formData = new FormData();

    const response = await api.post<{ code: number; message: string; data: User }>(
      '/api/user/profile',
      data
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.message || '更新失败');
    }
    return response.data.data;
  }

  async updatePassword(data: UpdatePasswordRequest): Promise<void> {
    const response = await api.post('/api/user/password', data);
    if (response.data.code !== 200) {
      throw new Error(response.data.message || '密码更新失败');
    }
  }
}

export const userService = new UserService();
export default userService;