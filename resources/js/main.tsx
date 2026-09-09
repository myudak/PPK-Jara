import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/App';
import '@/../css/app.css';

const root = document.getElementById('root');

if (!root) {
    throw new Error('JARA could not find its root element.');
}

createRoot(root).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
