// Upload processing. Every image is decoded and re-encoded with sharp (which also strips metadata and any
// embedded payload), resized to the sizes the public components expect, and stored as WebP.
import { randomBytes } from 'node:crypto';
import type { Asset } from './store.js';

export const MAX_UPLOAD = 4 * 1024 * 1024; // Vercel functions accept request bodies up to 4.5 MB
export const KINDS = ['portrait', 'pair', 'poster', 'single', 'square', 'pdf'] as const;
export type Kind = (typeof KINDS)[number];

export class UploadError extends Error {}

function sniff(b: Buffer): 'jpeg' | 'png' | 'webp' | 'gif' | 'avif' | 'pdf' | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if (b.toString('ascii', 0, 4) === 'GIF8') return 'gif';
  if (b.toString('ascii', 4, 8) === 'ftyp' && /avif|avis|heic|heix|mif1/.test(b.toString('ascii', 8, 12))) return 'avif';
  if (b.toString('ascii', 0, 5) === '%PDF-') return 'pdf';
  return null;
}

const slug = (s: string) => s.toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'file';

export async function processUpload(kind: Kind, data: Buffer, originalName: string, user: string) {
  if (!KINDS.includes(kind)) throw new UploadError('Unknown upload type.');
  if (data.length === 0) throw new UploadError('The file is empty.');
  if (data.length > MAX_UPLOAD) throw new UploadError('The file is larger than 4 MB.');
  const type = sniff(data);
  const id = `${slug(originalName)}-${randomBytes(4).toString('hex')}`;
  const base = `/api/media/${id}`;
  const files: { key: string; type: string; data: Buffer }[] = [];
  const asset: Asset = { id, kind, url: '', originalName: originalName.slice(0, 200), files: [], createdAt: new Date().toISOString(), createdBy: user };

  if (kind === 'pdf') {
    if (type !== 'pdf') throw new UploadError('Only PDF files can be uploaded here.');
    files.push({ key: `${id}.pdf`, type: 'application/pdf', data });
    asset.url = `${base}.pdf`;
    asset.extra = { size: data.length };
  } else {
    if (!type || type === 'pdf') throw new UploadError('Only JPEG, PNG, WebP, GIF or AVIF images can be uploaded.');
    const sharp = (await import('sharp')).default;
    const src = () => sharp(data, { limitInputPixels: 60_000_000, animated: false }).rotate();
    let meta;
    try { meta = await src().metadata(); } catch { throw new UploadError('The image could not be read. It may be damaged.'); }
    // Dimensions after EXIF rotation
    const rotated = (meta.orientation ?? 1) >= 5;
    const W = (rotated ? meta.height : meta.width) ?? 0;
    const H = (rotated ? meta.width : meta.height) ?? 0;
    if (W < 32 || H < 32) throw new UploadError('The image is too small.');
    const webp = (q = 82) => ({ quality: q, effort: 5 });
    const out = async (key: string, img: ReturnType<typeof src>) => {
      const buf = await img.webp(webp()).toBuffer({ resolveWithObject: true });
      files.push({ key, type: 'image/webp', data: buf.data });
      return buf.info;
    };

    if (kind === 'portrait') {
      // 4:5 crop, at most 720×900, never upscaled; plus a 360×450 copy
      const w = Math.min(720, W, Math.floor((H * 4) / 5));
      const h = Math.round((w * 5) / 4);
      const opts = { fit: 'cover' as const, position: sharp.strategy.attention };
      await out(`${id}.webp`, src().resize(w, h, opts));
      if (w > 360) await out(`${id}-360.webp`, src().resize(360, 450, opts));
      asset.url = `${base}.webp`;
      asset.w = w; asset.h = h;
      asset.extra = { src360: w > 360 ? `${base}-360.webp` : undefined, lowRes: w < 300 || undefined };
    } else if (kind === 'pair') {
      const big = await out(`${id}-1200.webp`, src().resize({ width: Math.min(1200, W), withoutEnlargement: true }));
      await out(`${id}-640.webp`, src().resize({ width: Math.min(640, W), withoutEnlargement: true }));
      asset.url = base; // the site appends -640.webp / -1200.webp
      asset.w = big.width; asset.h = big.height;
    } else if (kind === 'poster') {
      const big = await out(`${id}.webp`, src().resize({ width: Math.min(1600, W), withoutEnlargement: true }));
      await out(`${id}-560.webp`, src().resize({ width: Math.min(560, W), withoutEnlargement: true }));
      asset.url = base; // the site appends .webp / -560.webp
      asset.w = big.width; asset.h = big.height;
    } else if (kind === 'square') {
      const side = Math.min(256, W, H);
      await out(`${id}.webp`, src().resize(side, side, { fit: 'cover', position: sharp.strategy.attention }));
      asset.url = `${base}.webp`;
      asset.w = side; asset.h = side;
    } else {
      const img = await out(`${id}.webp`, src().resize({ width: Math.min(1200, W), withoutEnlargement: true }));
      asset.url = `${base}.webp`;
      asset.w = img.width; asset.h = img.height;
    }
  }
  asset.files = files.map((f) => ({ key: f.key, type: f.type, size: f.data.length }));
  if (asset.extra) asset.extra = JSON.parse(JSON.stringify(asset.extra));
  return { asset, files };
}

/** Sections and item labels that reference an asset (by its id in /api/media/<id>…). */
export function findUsage(content: Record<string, unknown>, id: string) {
  const needle = `/api/media/${id}`;
  return Object.entries(content).filter(([, v]) => JSON.stringify(v ?? null).includes(needle)).map(([k]) => k);
}
