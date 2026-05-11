import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAccessTokenCookie } from '../../api/tokenCookie';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * A wrapper component that redirects unauthenticated users to the login page.
 * The alert message is handled by the LoginPage to prevent duplicate toasts.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  
  const isLoggedIn = useMemo(() => {
    const user = localStorage.getItem('macta_user');
    return Boolean(getAccessTokenCookie() && user);
  }, []);

  if (!isLoggedIn) {
    // Redirect to login, but save the current location to redirect back after login
    // and pass a flag to show the login requirement message
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          requireLogin: true 
        }} 
        replace 
      />
    );
  }

  return <>{children}</>;
}
