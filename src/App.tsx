import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/checkout/:id" element={
              <AuthGuard>
                <CheckoutPage />
              </AuthGuard>
            } />
            
            {/* Protected Routes */}
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
            
            {/* Error Pages */}
            <Route path="/forbidden" element={<ErrorPage code="403" />} />
            <Route path="/error" element={<ErrorPage code="500" />} />
            <Route path="*" element={<ErrorPage code="404" />} />
          </Routes>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
