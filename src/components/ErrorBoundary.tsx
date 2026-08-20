import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Top-level error boundary so an unexpected exception anywhere in the
 * component tree shows a friendly recovery screen instead of a blank
 * white page. This only catches render/lifecycle errors in the React
 * tree (not errors inside event handlers or async code), which is the
 * standard React error boundary behavior.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Keep this as a plain console.error (not removed by the security
    // audit's "no console.log" cleanup) so real errors are still visible
    // in browser devtools / Vercel logs for debugging.
    console.error('Unhandled error in component tree:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFDF8] px-6">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">🌊</div>
            <h1 className="text-xl font-black text-slate-900 mb-2">
              일시적인 오류가 발생했습니다
            </h1>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              페이지를 불러오는 중 문제가 생겼어요. 새로고침 후에도 계속되면
              잠시 후 다시 시도해 주세요.
            </p>
            <button
              onClick={this.handleReload}
              className="px-6 py-3 rounded-full bg-emerald-800 text-white font-bold hover:bg-emerald-900 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
