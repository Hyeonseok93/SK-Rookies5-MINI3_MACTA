import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, UserPlus, UserRound } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { getAuthErrorMessage, signup } from '../api/auth';

const MAX_FIELD_LENGTH = 50;
const MIN_PASSWORD_LENGTH = 8;

export function SignupPage() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (loginId.trim().length === 0) {
      return '아이디를 입력해야 됩니다.';
    }

    if (password.trim().length === 0) {
      return '비밀번호를 입력해야 됩니다.';
    }

    if (nickname.trim().length === 0) {
      return '닉네임을 입력해야 됩니다.';
    }

    if (email.trim().length === 0) {
      return '이메일을 입력해야 됩니다.';
    }

    if (loginId.length > MAX_FIELD_LENGTH) {
      return `아이디는 ${MAX_FIELD_LENGTH}자 이내로 입력해야 됩니다.`;
    }

    if (password.length > MAX_FIELD_LENGTH) {
      return `비밀번호는 ${MAX_FIELD_LENGTH}자 이내로 입력해야 됩니다.`;
    }

    if (nickname.length > MAX_FIELD_LENGTH) {
      return `닉네임은 ${MAX_FIELD_LENGTH}자 이내로 입력해야 됩니다.`;
    }

    if (email.length > MAX_FIELD_LENGTH) {
      return `이메일은 ${MAX_FIELD_LENGTH}자 이내로 입력해야 됩니다.`;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상 입력해야 됩니다.`;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return '이메일은 올바른 형식으로 입력해야 됩니다.';
    }

    return '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await signup({ login_id: loginId, password, nickname, email });
      alert('회원가입이 완료되었습니다.');
      navigate('/login');
    } catch (requestError) {
      alert(getAuthErrorMessage(requestError, '회원가입에 실패했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="min-h-[calc(100vh-8rem)] px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-8 shadow-xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">회원가입</h1>
            <p className="mt-2 text-sm text-gray-400">경매 참여에 사용할 계정을 생성하세요.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">아이디</span>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={loginId}
                  onChange={(event) => setLoginId(event.target.value)}
                  autoComplete="username"
                  className="w-full rounded-lg border border-[#1e3a5f] bg-[#0a1628] py-3 pl-11 pr-4 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                  placeholder="login_id"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">비밀번호</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                className="w-full rounded-lg border border-[#1e3a5f] bg-[#0a1628] px-4 py-3 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="8자 이상"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">닉네임</span>
              <input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                autoComplete="nickname"
                className="w-full rounded-lg border border-[#1e3a5f] bg-[#0a1628] px-4 py-3 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="닉네임"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">이메일</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  className="w-full rounded-lg border border-[#1e3a5f] bg-[#0a1628] py-3 pl-11 pr-4 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus className="size-5" />
              {isSubmitting ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300">
              로그인 하기
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
