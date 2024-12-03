import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { LoginModal } from '../components/auth/LoginModal';
import { useLoginModal } from '../hooks/useLoginModal';
import { useAuthStore } from '../stores/auth.store';

interface AuthContextType {
  openLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isOpen, openLoginModal, closeLoginModal } = useLoginModal();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated());
  const updateBenefits = useAuthStore(state => state.updateBenefits);

  // Close login modal when authentication is successful
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      closeLoginModal();
    }
  }, [isAuthenticated, isOpen, closeLoginModal]);

  // Update benefits information on mount and when auth state changes
  useEffect(() => {
    updateBenefits();
  }, [isAuthenticated, updateBenefits]);

  return (
    <AuthContext.Provider value={{ openLoginModal }}>
      {children}
      <LoginModal isOpen={isOpen} onClose={closeLoginModal} />
    </AuthContext.Provider>
  );
};