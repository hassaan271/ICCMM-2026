import { createRoot } from 'react-dom/client';
import { loadLiveContent } from './content/store';
import type { PageKey } from './utils/routes';
import './styles/base.css';
import './styles/sections.css';
import './styles/interface.css';
import './styles/glass.css';
import './styles/pages.css';

// Each .html entry sets <body data-page="…">; the same app renders the matching page.
// The live CMS content is loaded first, then the app (and the data modules it reads) is imported.
const page = (document.body.dataset.page as PageKey) || 'home';
loadLiveContent()
  .then(() => import('./App'))
  .then(({ App }) => createRoot(document.getElementById('root')!).render(<App page={page} />));

if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__scrollTo = (y: number) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
}
