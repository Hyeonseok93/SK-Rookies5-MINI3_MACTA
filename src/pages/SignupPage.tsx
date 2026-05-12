import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, UserPlus, UserRound, Lock, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
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
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingLoginId, setIsCheckingLoginId] = useState(false);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const [checkedLoginId, setCheckedLoginId] = useState('');
  const [checkedNickname, setCheckedNickname] = useState('');
  const [checkedEmail, setCheckedEmail] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (loginId.trim().length === 0) {
      newErrors.loginId = '아이디를 입력해야 됩니다.';
    } else if (loginId.length > MAX_FIELD_LENGTH) {
      newErrors.loginId = `아이디는 ${MAX_FIELD_LENGTH}자 이내여야 됩니다.`;
    } else if (checkedLoginId !== loginId) {
      newErrors.loginId = '아이디 중복 확인이 필요합니다.';
    }

    if (nickname.trim().length === 0) {
      newErrors.nickname = '닉네임을 입력해야 됩니다.';
    } else if (nickname.length > MAX_FIELD_LENGTH) {
      newErrors.nickname = `닉네임은 ${MAX_FIELD_LENGTH}자 이내여야 됩니다.`;
    } else if (checkedNickname !== nickname) {
      newErrors.nickname = '닉네임 중복 확인이 필요합니다.';
    }

    if (email.trim().length === 0) {
      newErrors.email = '이메일을 입력해야 됩니다.';
    } else if (email.length > MAX_FIELD_LENGTH) {
      newErrors.email = `이메일은 ${MAX_FIELD_LENGTH}자 이내여야 됩니다.`;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '이메일 형식이 올바르지 않습니다.';
    } else if (checkedEmail !== email) {
      newErrors.email = '이메일 중복 확인이 필요합니다.';
    }

    if (password.trim().length === 0) {
      newErrors.password = '비밀번호를 입력해야 됩니다.';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 됩니다.`;
    } else if (password.length > MAX_FIELD_LENGTH) {
      newErrors.password = `비밀번호는 ${MAX_FIELD_LENGTH}자 이내여야 됩니다.`;
    }

    if (passwordConfirm.trim().length === 0) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해야 됩니다.';
    } else if (password !== passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckLoginId = async () => {
    if (!loginId.trim()) {
      setErrors(prev => ({ ...prev, loginId: '아이디를 입력해주세요.' }));
      return;
    }
    setIsCheckingLoginId(true);
    // 임시: API 호출 대신 성공 시뮬레이션
    setTimeout(() => {
      setCheckedLoginId(loginId);
      showToast('사용 가능한 아이디입니다.', 'success');
      setErrors(prev => {
        const next = { ...prev };
        delete next.loginId;
        return next;
      });
      setIsCheckingLoginId(false);
    }, 500);
  };

  const handleCheckNickname = async () => {
    if (!nickname.trim()) {
      setErrors(prev => ({ ...prev, nickname: '닉네임을 입력해주세요.' }));
      return;
    }
    setIsCheckingNickname(true);
    // 임시: API 호출 대신 성공 시뮬레이션
    setTimeout(() => {
      setCheckedNickname(nickname);
      showToast('사용 가능한 닉네임입니다.', 'success');
      setErrors(prev => {
        const next = { ...prev };
        delete next.nickname;
        return next;
      });
      setIsCheckingNickname(false);
    }, 500);
  };

  const handleCheckEmail = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors(prev => ({ ...prev, email: '올바른 이메일 형식을 입력해주세요.' }));
      return;
    }
    setIsCheckingEmail(true);
    // 임시: API 호출 대신 성공 시뮬레이션
    setTimeout(() => {
      setCheckedEmail(email);
      showToast('사용 가능한 이메일입니다.', 'success');
      setErrors(prev => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
      setIsCheckingEmail(false);
    }, 500);
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
              {/* Login ID */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">아이디</label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
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
                    {checkedLoginId === loginId && loginId !== '' && (
                      <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckLoginId}
                    disabled={isCheckingLoginId || (checkedLoginId === loginId && loginId !== '')}
                    className="px-4 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {isCheckingLoginId ? <Loader2 className="w-4 h-4 animate-spin" /> : '중복확인'}
                  </button>
                </div>
                {errors.loginId && (
                  <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.loginId}
                  </p>
                )}
              </div>

              {/* Nickname */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">닉네임</label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
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
                    {checkedNickname === nickname && nickname !== '' && (
                      <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckNickname}
                    disabled={isCheckingNickname || (checkedNickname === nickname && nickname !== '')}
                    className="px-4 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {isCheckingNickname ? <Loader2 className="w-4 h-4 animate-spin" /> : '중복확인'}
                  </button>
                </div>
                {errors.nickname && (
                  <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.nickname}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-300">이메일</label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
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
                    {checkedEmail === email && email !== '' && (
                      <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckEmail}
                    disabled={isCheckingEmail || (checkedEmail === email && email !== '')}
                    className="px-4 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {isCheckingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : '중복확인'}
                  </button>
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">비밀번호</label>
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
                {errors.password && (
                  <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Password Confirm */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">비밀번호 확인</label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.passwordConfirm ? 'text-red-400' : 'text-gray-500'}`} />
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => {
                      setPasswordConfirm(e.target.value);
                      if (errors.passwordConfirm) setErrors(prev => {
                        const next = {...prev};
                        delete next.passwordConfirm;
                        return next;
                      });
                    }}
                    placeholder="비밀번호 재입력"
                    className={`w-full pl-12 pr-4 py-3 bg-[#0a1628] border rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all ${
                      errors.passwordConfirm ? 'border-red-500/50 focus:border-red-500' : 'border-[#1e3a5f] focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.passwordConfirm && (
                  <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.passwordConfirm}
                  </p>
                )}
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
