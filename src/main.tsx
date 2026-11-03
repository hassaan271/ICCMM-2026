import { createRoot } from 'react-dom/client';
import { App } from './App';
import type { PageKey } from './utils/routes';
import './styles/base.css';
import './styles/sections.css';
import './styles/interface.css';
import './styles/glass.css';

// Each .html entry sets <body data-page="…">; the same app renders the matching page.
const page = (document.body.dataset.page as PageKey) || 'home';
createRoot(document.getElementById('root')!).render(<App page={page} />);

if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__scrollTo = (y: number) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
}
