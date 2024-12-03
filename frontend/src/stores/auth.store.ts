import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';
import type { 
  User, 
  LoginRequest, 
  RegisterRequest,
  LoginWithCodeRequest,
  ErrorResponse,
  TokenInfo,
  UserBenefits
} from '../types/auth.types';

interface AuthState {
  user: User | null;
  token: TokenInfo | null;
  benefits: UserBenefits | null;
  isLoading: boolean;
  error: ErrorResponse | null;
  
  login: (credentials: LoginRequest) => Promise<void>;
  loginWithVerification: (data: LoginWithCodeRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  isAuthenticated: () => boolean;
  updateBenefits: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      benefits: null,
      isLoading: false,
      error: null,

      isAuthenticated: () => {
        const state = get();
        return !!(state.user && state.token?.accessToken);
      },

      updateBenefits: async () => {
        const state = get();
        if (!state.isAuthenticated()) {
          set({ benefits: null });
          return;
        }

        try {
          const benefits = await authService.getUserBenefits();
          set({ benefits });
        } catch (error) {
          console.error('Failed to update benefits:', error);
        }
      },

      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.login(credentials);
          const { user, token, refreshToken } = response.data!;
          
          // First set the auth state
          set({
            user,
            token: {
              accessToken: token,
              refreshToken,
              expiresIn: 7 * 24 * 3600 // 7 days in seconds
            },
            isLoading: false,
            error: null
          });

          // Then fetch benefits after token is set
          const benefits = await authService.getUserBenefits();
          set({ benefits });
        } catch (error) {
          set({
            isLoading: false,
            error: error as ErrorResponse
          });
          throw error;
        }
      },

      loginWithVerification: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.loginWithCode(data);
          const { user, token, refreshToken } = response.data!;
          
          // First set the auth state
          set({
            user,
            token: {
              accessToken: token,
              refreshToken,
              expiresIn: 7 * 24 * 3600 // 7 days in seconds
            },
            isLoading: false,
            error: null
          });

          // Then fetch benefits after token is set
          const benefits = await authService.getUserBenefits();
          set({ benefits });
        } catch (error) {
          set({
            isLoading: false,
            error: error as ErrorResponse
          });
          throw error;
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.register(data);
          const { user, token, refreshToken } = response.data!;

          // First set the auth state
          set({
            user,
            token: {
              accessToken: token,
              refreshToken,
              expiresIn: 7 * 24 * 3600 // 7 days in seconds
            },
            isLoading: false,
            error: null
          });

          // Then fetch benefits after token is set
          const benefits = await authService.getUserBenefits();
          set({ benefits });
        } catch (error) {
          set({
            isLoading: false,
            error: error as ErrorResponse
          });
          throw error;
        }
      },

      logout: () => {
        authService.logout().finally(() => {
          set({
            user: null,
            token: null,
            benefits: null,
            isLoading: false,
            error: null
          });
        });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        benefits: state.benefits
      })
    }
  )
);

export default useAuthStore;