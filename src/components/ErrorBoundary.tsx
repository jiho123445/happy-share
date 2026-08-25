import React from 'react';
import { AlertTriangle, RefreshCw, Phone } from 'lucide-react';
import { ACADEMY_INFO } from '../data/coursesData';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * ErrorBoundary - 화면 어딘가에서 예기치 못한 런타임 오류가 나더라도
 * 앱 전체가 흰 화면으로 멈추지 않고, 사용자에게 안내와 함께
 * 새로고침/전화문의 경로를 제공합니다.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: ErrorBoundaryProps;
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error('앱 렌더링 중 오류가 발생했습니다:', error, errorInfo);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 mb-1.5">
                일시적인 오류가 발생했습니다
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                페이지를 불러오는 중 문제가 생겼어요. 새로고침해 주시거나, 계속 문제가 있으면
                전화로 문의해 주세요.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>새로고침</span>
              </button>
              <a
                href={`tel:${ACADEMY_INFO.phoneClean}`}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>{ACADEMY_INFO.phone}</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
