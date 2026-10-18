/**
 * Quick Edit MP4 for #quickedit — ffmpeg-static only (Ken Burns placeholder).
 *
 * Sole source: public/page/qe-scene.jpg
 *   (ChatGPT_Image_Oct_18_2026 collaborative office — people around monitor)
 *
 * 30s silent ≥1080p: eased ~15% camera push-in toward the people huddle.
 * Does NOT zoom into the mountain photo ON the monitor.
 * No UI mock, no qe-team, no xfade, no dual input.
 *
 * True people-animation I2V is not available in this environment — replace
 * this MP4 with a Runway/Kling/Luma generate when ready.
 */
import { spawn } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  statSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const scenePath = join(root, 'public', 'page', 'qe-scene.jpg')
const outMp4 = join(root, 'public', 'page', 'quick-edit.mp4')
const tmpRoot = join(root, '.tmp')
const tmpJpg = join(tmpRoot, `qe-scene.${process.pid}.jpg`)
const staging = join(tmpRoot, `qe-scene.${process.pid}.mp4`)
const MIN = 100_000

// Original still is 1024×576 (16:9) → output ≥1080p matching aspect
const W = 1920
const H = 1080
const FPS = 30
const DUR = 30
const FRAMES = FPS * DUR
const N = FRAMES - 1 // progress divisor: on=0 → start, on=N → end

if (!existsSync(scenePath)) throw new Error(`Missing scene JPG: ${scenePath}`)
if (!ffmpegPath) throw new Error('ffmpeg-static missing')

function run(args) {
  return new Promise((resolve, reject) => {
    const ff = spawn(ffmpegPath, args, { stdio: 'inherit' })
    ff.on('error', reject)
    ff.on('close', (c) => (c === 0 ? resolve() : reject(new Error(`ffmpeg exit ${c}`))))
  })
}

mkdirSync(tmpRoot, { recursive: true })
rmSync(staging, { force: true })
rmSync(tmpJpg, { force: true })

copyFileSync(scenePath, tmpJpg)

// Ease-in-out progress: e = 0.5 - 0.5*cos(PI*on/N)  ∈ [0,1]
// Zoom: 1 → 1.15 (~15% closer). Pan slightly left/up toward people (not mountain-on-monitor ≈ 0.58,0.38).
// Start center ≈ (0.50, 0.52) → end ≈ (0.47, 0.49)
const e = `(0.5-0.5*cos(PI*on/${N}))`
const vf =
  `scale=${W * 2}:${H * 2}:force_original_aspect_ratio=increase,` +
  `crop=${W * 2}:${H * 2},` +
  `zoompan=z='1+0.15*${e}':` +
  `x='max(0,min(iw-iw/zoom,iw*(0.50-0.03*${e})-(iw/zoom/2)))':` +
  `y='max(0,min(ih-ih/zoom,ih*(0.52-0.03*${e})-(ih/zoom/2)))':` +
  `d=${FRAMES}:s=${W}x${H}:fps=${FPS},` +
  `format=yuv420p`

console.log(
  `Encode ${DUR}s ${W}x${H}@${FPS} — eased push z=1→1.15 + pan → people (0.47,0.49)`,
)
console.log(`Source: ${scenePath}`)
console.log(`Tmp: ${tmpJpg}`)

await run([
  '-y',
  '-hide_banner',
  '-loop',
  '1',
  '-i',
  tmpJpg,
  '-vf',
  vf,
  '-t',
  String(DUR),
  '-r',
  String(FPS),
  '-c:v',
  'libx264',
  '-preset',
  'medium',
  '-crf',
  '18',
  '-pix_fmt',
  'yuv420p',
  '-movflags',
  '+faststart',
  '-an',
  staging,
])

rmSync(tmpJpg, { force: true })

const staged = statSync(staging).size
if (staged < MIN) {
  rmSync(staging, { force: true })
  throw new Error(`Staging too small: ${staged}`)
}

try {
  renameSync(staging, outMp4)
} catch {
  copyFileSync(staging, outMp4)
  rmSync(staging, { force: true })
}

console.log('Wrote', outMp4, `(${statSync(outMp4).size} bytes, ${DUR}s @ ${FPS}fps)`)
console.log('Source: qe-scene.jpg ONLY — no UI mock, no qe-team, no xfade')
