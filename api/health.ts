import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Responds to health-check requests with a JSON object indicating service health.
 *
 * Sends `{ ok: true }` as the JSON response.
 *
 * @param res - Vercel response object used to send the JSON payload
 */
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.json({ ok: true })
}
