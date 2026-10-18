/**
 * Entrypoint for Quick Edit section video.
 * Sole source: public/page/qe-scene.jpg (ChatGPT Oct 18 office scene).
 * Implementation: gen-qe-ffmpeg-only.mjs — 30s / 1080p / eased 15% push to people.
 * No UI mock, no qe-team, no xfade.
 */
import { pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
await import(pathToFileURL(join(here, 'gen-qe-ffmpeg-only.mjs')).href)
