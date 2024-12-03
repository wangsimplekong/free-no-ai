import React from 'react';
import { Header } from '../../components/layout/Header';
import { ProfileSettings } from './components/ProfileSettings';
import { SecuritySettings } from './components/SecuritySettings';
import { useAuthStore } from '../../stores/auth.store';

export const ProfilePage: React.FC = () => {
  const user = useAuthStore(state => state.user);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-8">个人设置</h1>
        
        <div className="space-y-6">
          <ProfileSettings user={user} />
          <SecuritySettings />
        </div>
      </main>
    </div>
  );
};