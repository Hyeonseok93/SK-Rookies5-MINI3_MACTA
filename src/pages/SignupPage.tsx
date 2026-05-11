import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, UserPlus, UserRound, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { getAuthErrorMessage, signup } from '../api/auth';
import { useToast } from '../components/common/Toast';

const MAX_FIELD_LENGTH = 50;
const MIN_PASSWORD_LENGTH = 8;

export function SignupPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (loginId.trim().length === 0) newErrors.loginId = '아이디를 입력해야 됩니다.';
    else if (loginId.length > MAX_FIELD_LENGTH) newErrors.loginId = `아이디는 ${MAX_FIELD_LENGTH}자 이내여야 됩니다.`;

    if (password.trim().length === 0) newErrors.password = '비밀번호를 입력해야 됩니다.';
    else if (password.length < MIN_PASSWORD_LENGTH) newErrors.password = `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 됩니다.`;
    else if (password.length > MAX_FIELD_LENGTH) newErrors.password = `비밀번호는 ${MAX_FIELD_LENGTH}자 이내여야 됩니다.`;

    if (nickname.trim().length === 0) newErrors.nickname = '닉네임을 입력해야 됩니다.';
    else if (nickname.length > MAX_FIELD_LENGTH) newErrors.nickname = `닉네임은 ${MAX_FIELD_LENGTH}자 이내여야 됩니다.`;

    if (email.trim().length === 0) newErrors.email = '이메일을 입력해야 됩니다.';
    else if (email.length > MAX_FIELD_LENGTH) newErrors.email = `이메일은 ${MAX_FIELD_LENGTH}자 이내여야 됩니다.`;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = '이메일 형식이 올바르지 않습니다.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      showToast('입력 정보를 다시 확인해 주세요.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await signup({ loginId, password, nickname, email });
      showToast('회원가입이 완료되었습니다!', 'success');
      navigate('/login');
    } catch (requestError) {
      showToast(getAuthErrorMessage(requestError, '회원가입에 실패했습니다.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>뒤로가기</span>
        </button>

        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-[#1e3a5f]">
            <h1 className="text-3xl font-bold text-white mb-2">회원가입</h1>
            <p className="text-gray-400">MACTA의 일원이 되어 경매의 즐거움을 경험하세요.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6" noValidate>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Nickname */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-300">닉네임</label>
                  {errors.nickname && (
                    <span className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.nickname}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <UserRound className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.nickname ? 'text-red-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      if (errors.nickname) setErrors(prev => {
                        const next = {...prev};
                        delete next.nickname;
                        return next;
                      });
                    }}
                    placeholder="닉네임"
                    className={`w-full pl-12 pr-4 py-3 bg-[#0a1628] border rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all ${
                      errors.nickname ? 'border-red-500/50 focus:border-red-500' : 'border-[#1e3a5f] focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-300">이메일</label>
                  {errors.email && (
                    <span className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.email ? 'text-red-400' : 'text-gray-500'}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => {
                        const next = {...prev};
                        delete next.email;
                        return next;
                      });
                    }}
                    placeholder="example@macta.com"
                    className={`w-full pl-12 pr-4 py-3 bg-[#0a1628] border rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all ${
                      errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-[#1e3a5f] focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              {/* Login ID */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-300">아이디</label>
                  {errors.loginId && (
                    <span className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.loginId}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <UserPlus className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.loginId ? 'text-red-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => {
                      setLoginId(e.target.value);
                      if (errors.loginId) setErrors(prev => {
                        const next = {...prev};
                        delete next.loginId;
                        return next;
                      });
                    }}
                    placeholder="아이디"
                    className={`w-full pl-12 pr-4 py-3 bg-[#0a1628] border rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all ${
                      errors.loginId ? 'border-red-500/50 focus:border-red-500' : 'border-[#1e3a5f] focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-300">비밀번호</label>
                  {errors.password && (
                    <span className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.password ? 'text-red-400' : 'text-gray-500'}`} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors(prev => {
                        const next = {...prev};
                        delete next.password;
                        return next;
                      });
                    }}
                    placeholder="8자 이상 입력"
                    className={`w-full pl-12 pr-4 py-3 bg-[#0a1628] border rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all ${
                      errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-[#1e3a5f] focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>가입 처리 중...</span>
                  </>
                ) : (
                  <span>회원가입 완료</span>
                )}
              </button>
            </div>

            <div className="text-center text-sm text-gray-400 pt-2">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                로그인 하기
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
