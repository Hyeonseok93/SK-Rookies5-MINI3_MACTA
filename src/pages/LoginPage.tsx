import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LockKeyhole, LogIn, User } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { getAuthErrorMessage, login } from '../api/auth';
import { useToast } from '../components/common/Toast';

const MAX_FIELD_LENGTH = 50;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasShownAuthToast = useRef(false);

  // Check for login requirement flag from AuthGuard
  useEffect(() => {
    if (location.state?.requireLogin && !hasShownAuthToast.current) {
      showToast('로그인이 필요한 서비스입니다.', 'error');
      hasShownAuthToast.current = true;
    }
  }, [location.state, showToast]);

  const validateForm = () => {
    if (loginId.trim().length === 0) {
      return '아이디를 입력해야 됩니다.';
    }

    if (password.trim().length === 0) {
      return '비밀번호를 입력해야 됩니다.';
    }

    if (loginId.length > MAX_FIELD_LENGTH) {
      return `아이디는 ${MAX_FIELD_LENGTH}자 이내로 입력해야 됩니다.`;
    }

    if (password.length > MAX_FIELD_LENGTH) {
      return `비밀번호는 ${MAX_FIELD_LENGTH}자 이내로 입력해야 됩니다.`;
    }

    return '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({ loginId, password });
      showToast(response.message, 'success');
      
      // Redirect back to original destination if exists, otherwise home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (requestError) {
      showToast(getAuthErrorMessage(requestError, '로그인에 실패했습니다.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="min-h-[calc(100vh-8rem)] px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-8 shadow-xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">로그인</h1>
            <p className="mt-2 text-sm text-gray-400">MACTA 계정으로 경매 서비스를 이용하세요.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">아이디</span>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={loginId}
                  onChange={(event) => setLoginId(event.target.value)}
                  autoComplete="username"
                  className="w-full rounded-lg border border-[#1e3a5f] bg-[#0a1628] py-3 pl-11 pr-4 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                  placeholder="아이디"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">비밀번호</span>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-[#1e3a5f] bg-[#0a1628] py-3 pl-11 pr-4 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                  placeholder="비밀번호"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn className="size-5" />
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            아직 회원이 아니신가요?{' '}
            <Link to="/signup" className="font-semibold text-blue-400 hover:text-blue-300">
              회원가입 하기
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
