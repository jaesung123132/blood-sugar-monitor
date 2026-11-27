import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('화면을 그릴 root 요소를 찾을 수 없습니다.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// 홈 화면 설치(PWA)와 인터넷이 끊겼을 때 화면 유지를 위한 서비스 워커입니다.
// 개발 중에는 오래된 화면이 남지 않도록 배포 빌드에서만 등록합니다.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // 등록에 실패해도 앱 사용에는 지장이 없습니다.
    });
  });
}
