import { useState } from 'react';
import { apiService } from '../services/api';

interface AuthPromptProps {
  onAuthComplete: () => void;
}

function AuthPrompt({ onAuthComplete }: AuthPromptProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      const { auth_url } = await apiService.getAuthUrl();
      window.location.href = auth_url;
    } catch (err) {
      console.error('認証URLの取得に失敗:', err);
      alert('認証に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAuth}
      disabled={isLoading}
      className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
    >
      {isLoading ? '処理中...' : 'Drive連携'}
    </button>
  );
}

export default AuthPrompt;
