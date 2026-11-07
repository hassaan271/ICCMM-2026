// Guest portraits. Each guest's `photo` (edited in the CMS at /admin) records the files, size, crop focus and
// source/licence notes. Files are ≤720 px wide at 4:5, with an optional 360 px variant; `lowRes` marks
// sources under 300 px wide. Without a photo the site shows a neutral monogram plate.
import { guestById } from './index';

export const portraitOf = (id: string) => {
  const img = guestById(id)?.photo;
  if (!img || !img.src) return null;
  return {
    src: img.src,
    srcSet: img.src360 && img.w > 360 ? `${img.src360} 360w, ${img.src} ${img.w}w` : undefined,
    w: img.w, h: img.h, focus: img.focus ?? '50% 30%', lowRes: !!img.lowRes,
  };
};
