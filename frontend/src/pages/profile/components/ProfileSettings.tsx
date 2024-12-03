import React, { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { userService } from '../../../services/user.service';
import type { User } from '../../../types/auth.types';
import toast from 'react-hot-toast';

interface ProfileSettingsProps {
  user: User;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user.nickname || '');
  const [isLoading, setIsLoading] = useState(false);
  const updateUser = useAuthStore(state => state.updateUser);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const updatedUser = await userService.updateProfile({
        nickname: nickname.trim()
      });
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success('个人信息已更新');
    } catch (error) {
      toast.error('更新失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 2 * 1024 * 1024) {
      toast.error('图片大小不能超过2MB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('只支持JPG、PNG格式的图片');
      return;
    }

    try {
      setIsLoading(true);
      const updatedUser = await userService.updateProfile({
        avatar: file
      });
      updateUser(updatedUser);
      toast.success('头像已更新');
    } catch (error) {
      toast.error('头像更新失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-6">基本信息</h2>

      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.nickname || user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Camera className="w-8 h-8" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png"
                onChange={handleAvatarChange}
                disabled={isLoading}
              />
            </label>
          </div>
          <div>
            <div className="text-sm text-gray-500">支持 jpg、png 格式，文件小于 2MB</div>
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            用户名
          </label>
          <input
            type="text"
            value={user.username}
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
          />
        </div>

        {/* Nickname */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            昵称
          </label>
          {isEditing ? (
            <div className="flex space-x-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入昵称"
                maxLength={20}
              />
              <button
                onClick={handleSave}
                disabled={isLoading || !nickname.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center space-x-1"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>保存</span>
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNickname(user.nickname || '');
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="px-3 py-2 text-gray-900">
                {user.nickname || '未设置'}
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                编辑
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};