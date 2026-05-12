import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ErrorPage } from '../../pages/ErrorPage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorPage 
          code="error" 
          title="App Crash" 
          message="앱 실행 중 일시적인 오류가 발생했습니다. 홈으로 이동해 다시 시도해주세요."
          resetErrorBoundary={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
