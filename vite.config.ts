import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 화면 빌드 설정입니다. 테스트(Vitest)도 이 설정을 그대로 사용합니다.
export default defineConfig({
  plugins: [react()],
});
