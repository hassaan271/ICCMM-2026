// Vercel serverless function for the CMS API. vercel.json rewrites every /api/* path here.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handle } from '../server/router.js';

export const config = { api: { bodyParser: false } };

export default function cms(req: IncomingMessage, res: ServerResponse) {
  return handle(req, res);
}
