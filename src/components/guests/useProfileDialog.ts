import { useCallback, useEffect, useState } from 'react';
import { guestById } from '../../data/guests';

/* Profile dialog state shared by the Speakers and Guests pages. `#guest-<id>` in the URL opens that profile. */
export function useProfileDialog() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useCallback((id: string) => { setOpenId(id); history.replaceState(null, '', `#guest-${id}`); }, []);
  const close = useCallback(() => { setOpenId(null); if (location.hash.startsWith('#guest-')) history.replaceState(null, '', location.pathname + location.search); }, []);

  useEffect(() => {
    const fromHash = () => { const id = location.hash.replace('#guest-', ''); if (location.hash.startsWith('#guest-') && guestById(id)) setOpenId(id); };
    const t = setTimeout(fromHash, 400);
    window.addEventListener('hashchange', fromHash);
    return () => { clearTimeout(t); window.removeEventListener('hashchange', fromHash); };
  }, []);

  return { openId, open, close };
}
