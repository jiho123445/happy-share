import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { reportClientError } from './lib/firestoreService';
import './index.css';

// ErrorBoundary는 React 렌더링 중에 발생한 오류만 잡을 수 있습니다.
// 이벤트 핸들러 안에서 난 오류나 처리되지 않은 Promise 거부(rejection)는
// ErrorBoundary를 그냥 지나쳐 버립니다. 그런 오류도 놓치지 않도록 전역
// 리스너를 추가해 같은 errorLogs 컬렉션에 기록합니다.
window.addEventListener('error', (event) => {
  const err = event.error instanceof Error ? event.error : new Error(String(event.message || '알 수 없는 오류'));
  reportClientError({
    message: err.message,
    stack: err.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    context: 'window.onerror',
  });
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const err = reason instanceof Error ? reason : new Error(String(reason));
  reportClientError({
    message: err.message,
    stack: err.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    context: 'unhandledrejection',
  });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
