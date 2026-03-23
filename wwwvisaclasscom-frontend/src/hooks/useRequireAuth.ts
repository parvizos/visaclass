import { useNavigate } from 'react-router-dom';
import { getCurrentUserLocal } from '@/lib/localAuth';

export const useRequireAuth = () => {
  const navigate = useNavigate();

  const requireAuth = (callback?: () => void) => {
    // Check for backend token
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    // Check for local auth
    const localUser = getCurrentUserLocal();
    
    console.log('requireAuth called:', { token: !!token, localUser: !!localUser });
    
    if (!token && !localUser) {
      // Not authenticated - redirect to auth page with return URL
      console.log('Not authenticated, redirecting to auth...');
      navigate('/auth?mode=login&redirect=/apply');
      return false;
    }
    
    // Authenticated - execute callback if provided
    console.log('Authenticated, executing callback or navigating to /apply');
    if (callback) {
      callback();
    } else {
      navigate('/apply');
    }
    return true;
  };

  return { requireAuth };
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  const localUser = getCurrentUserLocal();
  return !!token || !!localUser;
};
