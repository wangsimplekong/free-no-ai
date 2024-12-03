import { useCallback } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { useLoginModal } from './useLoginModal';

export const useAuthCheck = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const { openLoginModal } = useLoginModal();

  const checkAuth = useCallback((callback?: () => void) => {
    if (!isAuthenticated) {
      openLoginModal();
      return false;
    }
    
    if (callback) {
      callback();
    }
    return true;
  }, [isAuthenticated, openLoginModal]);

  return { checkAuth, isAuthenticated };
};