import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, AlertCircle, ShieldAlert, Ghost, ServerCrash } from 'lucide-react';

interface ErrorPageProps {
  code?: '404' | '403' | '500' | 'error';
  title?: string;
  message?: string;
  resetErrorBoundary?: () => void;
}

export function ErrorPage({ code = '404', title, message, resetErrorBoundary }: ErrorPageProps) {
  const navigate = useNavigate();

  const errorConfig = {
    '404': {
      icon: <Ghost className="w-24 h-24 text-blue-500/50" />,
      defaultTitle: '404 - Page Not Found',
      defaultMessage: '찾으시는 페이지가 사라졌거나 잘못된 경로입니다.',
      bgGradient: 'from-blue-600/10 to-transparent'
    },
    '403': {
      icon: <ShieldAlert className="w-24 h-24 text-orange-500/50" />,
      defaultTitle: '403 - Access Denied',
      defaultMessage: '이 페이지에 접근할 권한이 없습니다.',
      bgGradient: 'from-orange-600/10 to-transparent'
    },
    '500': {
      icon: <ServerCrash className="w-24 h-24 text-red-500/50" />,
      defaultTitle: '500 - Server Error',
      defaultMessage: '서버에 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      bgGradient: 'from-red-600/10 to-transparent'
    },
    'error': {
      icon: <AlertCircle className="w-24 h-24 text-purple-500/50" />,
      defaultTitle: 'Unexpected Error',
      defaultMessage: '앱 실행 중 예상치 못한 오류가 발생했습니다.',
      bgGradient: 'from-purple-600/10 to-transparent'
    }
  };

  const config = errorConfig[code];

  const handleGoHome = () => {
    if (resetErrorBoundary) resetErrorBoundary();
    navigate('/');
  };

  const handleGoBack = () => {
    if (resetErrorBoundary) resetErrorBoundary();
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4 relative overflow-hidden">
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r ${config.bgGradient} rounded-full blur-3xl opacity-30 animate-pulse`}></div>
      
      <div className="max-w-md w-full text-center relative z-10">
        <div className="mb-8 flex justify-center animate-bounce duration-1000">
          {config.icon}
        </div>
        
        <h1 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">
          {title || config.defaultTitle}
        </h1>
        
        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
          {message || config.defaultMessage}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#1e3a5f] text-white rounded-2xl font-bold hover:bg-[#2e4a6f] transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            이전으로
          </button>
          
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl shadow-blue-500/20"
          >
            <Home className="w-5 h-5" />
            홈으로 가기
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-800 font-black text-8xl pointer-events-none select-none tracking-tighter opacity-10">
        MACTA
      </div>
    </div>
  );
}
