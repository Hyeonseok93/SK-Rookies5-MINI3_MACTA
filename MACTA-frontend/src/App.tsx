import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { MyPage } from './pages/MyPage';
import { RegisterAuctionPage } from './pages/RegisterAuctionPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ErrorPage } from './pages/ErrorPage';
import { ToastProvider } from './components/common/Toast';
import { AuthGuard } from './components/common/AuthGuard';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { restoreSession } from './api/auth';
import { useAuthStore } from './store/useAuthStore';

function AuthBootstrap({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const syncAuthState = useAuthStore((s) => s.syncAuthState);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await restoreSession();
      if (cancelled) return;
      if (user) {
        setUser(user);
      } else {
        syncAuthState();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser, syncAuthState]);

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <AuthBootstrap>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/checkout/:id" element={
                <AuthGuard>
                  <CheckoutPage />
                </AuthGuard>
              } />

              <Route path="/my-page" element={
                <AuthGuard>
                  <MyPage />
                </AuthGuard>
              } />
              <Route path="/register-auction" element={
                <AuthGuard>
                  <RegisterAuctionPage />
                </AuthGuard>
              } />
              <Route path="/notifications" element={
                <AuthGuard>
                  <NotificationsPage />
                </AuthGuard>
              } />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              <Route path="/forbidden" element={<ErrorPage code="403" />} />
              <Route path="/error" element={<ErrorPage code="500" />} />
              <Route path="*" element={<ErrorPage code="404" />} />
            </Routes>
          </AuthBootstrap>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
