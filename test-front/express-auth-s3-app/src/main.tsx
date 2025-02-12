import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ReactQueryProvider from './hooks/ReactQuery';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ReactQueryProvider>
            <App />
        </ReactQueryProvider>
    </StrictMode>,
);
