// Content and media storage. Production uses Firebase (Firestore, plus Cloud Storage when
// FIREBASE_STORAGE_BUCKET is set); local development without Firebase credentials uses the .cms-data folder.
import { promises as fs } from 'node:fs';
import { join, resolve } from 'node:path';

export type Entry = { value: unknown; version: number; updatedAt: string; updatedBy: string };
export type MediaFile = { key: string; type: string; size: number };
export type Asset = {
  id: string;
  kind: string;
  /** Value to put in a content field */
  url: string;
  w?: number;
  h?: number;
  extra?: Record<string, unknown>;
  originalName: string;
  files: MediaFile[];
  createdAt: string;
  createdBy: string;
};

export class Conflict extends Error {}

export interface Store {
  name: string;
  getAll(): Promise<Record<string, Entry>>;
  put(key: string, value: unknown, baseVersion: number | null, user: string): Promise<Entry>;
  listAssets(): Promise<Asset[]>;
  saveAsset(asset: Asset, files: { key: string; type: string; data: Buffer }[]): Promise<void>;
  deleteAsset(asset: Asset): Promise<void>;
  getFile(key: string): Promise<{ type: string; data: Buffer } | null>;
}

export const KEY_RE = /^[a-z0-9][a-z0-9-]{0,120}\.(webp|pdf)$/;
export const typeOf = (key: string) => (key.endsWith('.pdf') ? 'application/pdf' : 'image/webp');

/* ───────────── Local folder (development only) ───────────── */

function localStore(root: string): Store {
  const contentFile = join(root, 'content.json');
  const assetsFile = join(root, 'assets.json');
  const filesDir = join(root, 'files');
  const readJson = async <T>(f: string, d: T): Promise<T> => { try { return JSON.parse(await fs.readFile(f, 'utf8')); } catch { return d; } };
  const writeJson = async (f: string, v: unknown) => { await fs.mkdir(root, { recursive: true }); await fs.writeFile(f + '.tmp', JSON.stringify(v, null, 1)); await fs.rename(f + '.tmp', f); };
  let queue = Promise.resolve();
  const serial = <T>(fn: () => Promise<T>) => { const p = queue.then(fn); queue = p.then(() => undefined, () => undefined); return p; };
  return {
    name: 'local',
    getAll: () => readJson(contentFile, {}),
    put: (key, value, base, user) => serial(async () => {
      const all = await readJson<Record<string, Entry>>(contentFile, {});
      const cur = all[key];
      if (cur && base !== null && cur.version !== base) throw new Conflict();
      const e: Entry = { value, version: (cur?.version ?? 0) + 1, updatedAt: new Date().toISOString(), updatedBy: user };
      all[key] = e;
      await writeJson(contentFile, all);
      return e;
    }),
    listAssets: () => readJson(assetsFile, []),
    saveAsset: (asset, files) => serial(async () => {
      await fs.mkdir(filesDir, { recursive: true });
      for (const f of files) await fs.writeFile(join(filesDir, f.key), f.data);
      const list = await readJson<Asset[]>(assetsFile, []);
      await writeJson(assetsFile, [asset, ...list.filter((a) => a.id !== asset.id)]);
    }),
    deleteAsset: (asset) => serial(async () => {
      for (const f of asset.files) await fs.rm(join(filesDir, f.key), { force: true });
      const list = await readJson<Asset[]>(assetsFile, []);
      await writeJson(assetsFile, list.filter((a) => a.id !== asset.id));
    }),
    getFile: async (key) => {
      if (!KEY_RE.test(key)) return null;
      try { return { type: typeOf(key), data: await fs.readFile(join(filesDir, key)) }; } catch { return null; }
    },
  };
}

/* ───────────── Firebase ───────────── */

function firebaseCredentials() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (raw) {
    const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    const sa = JSON.parse(json);
    return { projectId: sa.project_id as string, clientEmail: sa.client_email as string, privateKey: sa.private_key as string };
  }
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (projectId && clientEmail && privateKey) return { projectId, clientEmail, privateKey };
  return null;
}

const CHUNK = 900_000;

async function firebaseStore(): Promise<Store> {
  const creds = firebaseCredentials()!;
  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET?.trim();
  const app = getApps()[0] ?? initializeApp({ credential: cert(creds), projectId: creds.projectId, ...(bucketName ? { storageBucket: bucketName } : {}) });
  const db = getFirestore(app);
  const content = db.collection('cms_content');
  const assets = db.collection('cms_assets');
  const files = db.collection('cms_files');
  const bucket = bucketName ? (await import('firebase-admin/storage')).getStorage(app).bucket(bucketName) : null;

  return {
    name: bucket ? 'firebase (Firestore + Cloud Storage)' : 'firebase (Firestore)',
    async getAll() {
      const snap = await content.get();
      const out: Record<string, Entry> = {};
      snap.forEach((d) => {
        const x = d.data();
        out[d.id] = { value: JSON.parse(x.json), version: x.version, updatedAt: x.updatedAt, updatedBy: x.updatedBy };
      });
      return out;
    },
    async put(key, value, base, user) {
      const ref = content.doc(key);
      return db.runTransaction(async (tx) => {
        const cur = await tx.get(ref);
        const version = cur.exists ? (cur.data()!.version as number) : 0;
        if (cur.exists && base !== null && version !== base) throw new Conflict();
        const e = { version: version + 1, updatedAt: new Date().toISOString(), updatedBy: user };
        tx.set(ref, { ...e, json: JSON.stringify(value) });
        return { ...e, value };
      });
    },
    async listAssets() {
      const snap = await assets.orderBy('createdAt', 'desc').get();
      return snap.docs.map((d) => d.data() as Asset);
    },
    async saveAsset(asset, list) {
      for (const f of list) {
        if (bucket) {
          await bucket.file(`cms-media/${f.key}`).save(f.data, { contentType: f.type, resumable: false, metadata: { cacheControl: 'public, max-age=31536000, immutable' } });
        } else {
          const n = Math.ceil(f.data.length / CHUNK);
          const batch = db.batch();
          batch.set(files.doc(f.key), { type: f.type, size: f.data.length, chunks: n, data: n === 1 ? f.data : null });
          if (n > 1) for (let i = 0; i < n; i++) batch.set(files.doc(`${f.key}__${i}`), { data: f.data.subarray(i * CHUNK, (i + 1) * CHUNK) });
          await batch.commit();
        }
      }
      await assets.doc(asset.id).set(JSON.parse(JSON.stringify(asset)));
    },
    async deleteAsset(asset) {
      for (const f of asset.files) {
        if (bucket) await bucket.file(`cms-media/${f.key}`).delete({ ignoreNotFound: true });
        else {
          const d = await files.doc(f.key).get();
          const n = (d.data()?.chunks as number) ?? 1;
          const batch = db.batch();
          batch.delete(files.doc(f.key));
          if (n > 1) for (let i = 0; i < n; i++) batch.delete(files.doc(`${f.key}__${i}`));
          await batch.commit();
        }
      }
      await assets.doc(asset.id).delete();
    },
    async getFile(key) {
      if (!KEY_RE.test(key)) return null;
      if (bucket) {
        const file = bucket.file(`cms-media/${key}`);
        const [exists] = await file.exists();
        if (!exists) return null;
        const [data] = await file.download();
        return { type: typeOf(key), data };
      }
      const d = await files.doc(key).get();
      if (!d.exists) return null;
      const x = d.data()!;
      if (x.chunks === 1) return { type: x.type, data: Buffer.from(x.data) };
      const parts = await db.getAll(...Array.from({ length: x.chunks }, (_, i) => files.doc(`${key}__${i}`)));
      return { type: x.type, data: Buffer.concat(parts.map((p) => Buffer.from(p.data()!.data))) };
    },
  };
}

let cached: Promise<Store> | null = null;

export class NotConfigured extends Error {}

export function getStore(): Promise<Store> {
  if (cached) return cached;
  const mode = process.env.CMS_STORAGE?.trim();
  const hasFirebase = !!firebaseCredentials();
  if (mode === 'local' || (!mode && !hasFirebase && !process.env.VERCEL)) {
    cached = Promise.resolve(localStore(resolve(process.env.CMS_DATA_DIR || '.cms-data')));
  } else if (hasFirebase) {
    cached = firebaseStore();
    cached.catch(() => { cached = null; });
  } else {
    return Promise.reject(new NotConfigured('Firebase is not configured: set FIREBASE_SERVICE_ACCOUNT (or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY).'));
  }
  return cached;
}
