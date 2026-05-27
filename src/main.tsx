import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { seedIfEmpty } from './lib/db';

// تحميل البيانات الأولية عند أول تشغيل
seedIfEmpty().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
