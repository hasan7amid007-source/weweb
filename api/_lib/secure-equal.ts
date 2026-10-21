import { timingSafeEqual } from 'node:crypto'

/**
 * Constant-time compare of two byte sequences.
 * Callers must pass Uint8Array (not Buffer) — TS 5.9 + @types/node Buffer
 * is not assignable to timingSafeEqual's ArrayBufferView parameter.
 */
export function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false
  return timingSafeEqual(a, b)
}

/** UTF-8 bytes without Buffer (avoids Buffer↔ArrayBufferView typing clash). */
export function utf8Bytes(value: string): Uint8Array {
  return new TextEncoder().encode(value)
}

/** Hex-decode into a standalone Uint8Array backed by ArrayBuffer. */
export function hexBytes(hex: string): Uint8Array {
  const raw = Buffer.from(hex, 'hex')
  return Uint8Array.from(raw)
}
