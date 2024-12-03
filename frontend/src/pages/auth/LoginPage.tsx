import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VerificationType } from '../../types/auth.types';
import { authService } from '../../services/auth.service';
import { VerificationForm } from '../../components/auth/VerificationForm';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationType, setVerificationType] = useState<VerificationType>(VerificationType.SMS);

  const handleVerificationComplete = async (verificationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.loginWithVerification({
        verificationId,
        type: verificationType
      });
      
      // Store auth token
      localStorage.setItem('token', response.data.token);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={() => setVerificationType(VerificationType.SMS)}
              className={`px-4 py-2 rounded-lg ${
                verificationType === VerificationType.SMS
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              SMS
            </button>
            <button
              onClick={() => setVerificationType(VerificationType.EMAIL)}
              className={`px-4 py-2 rounded-lg ${
                verificationType === VerificationType.EMAIL
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Email
            </button>
          </div>

          <VerificationForm
            type={verificationType}
            purpose="LOGIN"
            onVerificationComplete={handleVerificationComplete}
          />

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div className="text-sm text-center">
            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Don't have an account? Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};