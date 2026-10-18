"""Convert public/hero/*.jpg (baked checkerboard) -> transparent *.png."""
from __future__ import annotations

from collections import Counter, deque
from pathlib import Path

import numpy as np
from PIL import Image

HERO = Path(__file__).resolve().parents[1] / "public" / "hero"
NAMES = ("laptop", "phone", "phone-app", "watch", "desktop")


def detect_tiles(arr: np.ndarray) -> list[tuple[int, int, int]]:
    h, w = arr.shape[:2]
    step = max(1, min(w, h) // 50)
    edge = np.concatenate(
        [arr[0, ::step], arr[h - 1, ::step], arr[::step, 0], arr[::step, w - 1]], axis=0
    )
    q = (edge // 4) * 4
    counts = Counter(tuple(int(c) for c in row) for row in q)
    cands: list[tuple[int, int, int]] = []
    for color, _ in counts.most_common(50):
        r, g, b = color
        if max(r, g, b) - min(r, g, b) > 22:
            continue
        if min(r, g, b) < 140:
            continue
        cands.append(color)
    if not cands:
        return [(204, 204, 204), (255, 255, 255)]
    picked = [cands[0]]
    for c in cands[1:]:
        if sum(abs(c[i] - picked[0][i]) for i in range(3)) >= 14:
            picked.append(c)
            break
    if len(picked) == 1:
        picked.append((255, 255, 255) if sum(picked[0]) < 720 else (204, 204, 204))
    return picked


def near_neutral_mask(arr: np.ndarray, tiles: list[tuple[int, int, int]], tol: float = 42.0) -> np.ndarray:
    rf = arr[:, :, 0].astype(np.float32)
    gf = arr[:, :, 1].astype(np.float32)
    bf = arr[:, :, 2].astype(np.float32)
    chroma = np.maximum(np.maximum(rf, gf), bf) - np.minimum(np.minimum(rf, gf), bf)
    near = np.zeros(arr.shape[:2], dtype=bool)
    for tr, tg, tb in tiles:
        near |= (rf - tr) ** 2 + (gf - tg) ** 2 + (bf - tb) ** 2 <= tol * tol
    # Also treat any light near-gray as candidate (JPEG-smeared checkers)
    smeared = (chroma <= 28) & (rf >= 160) & (gf >= 160) & (bf >= 160)
    return near | smeared


def flood_edges(mask: np.ndarray) -> np.ndarray:
    h, w = mask.shape
    keep = np.zeros((h, w), dtype=np.uint8)
    q: deque[tuple[int, int]] = deque()

    def push(x: int, y: int) -> None:
        if 0 <= x < w and 0 <= y < h and mask[y, x] and keep[y, x] == 0:
            keep[y, x] = 1
            q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)
    while q:
        x, y = q.popleft()
        push(x + 1, y)
        push(x - 1, y)
        push(x, y + 1)
        push(x, y - 1)
        # diagonals help across JPEG-smeared checker seams
        push(x + 1, y + 1)
        push(x - 1, y - 1)
        push(x + 1, y - 1)
        push(x - 1, y + 1)
    return keep.astype(bool)


def grow_into_neutral(arr: np.ndarray, bg: np.ndarray, rounds: int = 6) -> np.ndarray:
    """Expand transparency into adjacent light-neutral pixels (JPEG fringe)."""
    rf = arr[:, :, 0].astype(np.float32)
    gf = arr[:, :, 1].astype(np.float32)
    bf = arr[:, :, 2].astype(np.float32)
    chroma = np.maximum(np.maximum(rf, gf), bf) - np.minimum(np.minimum(rf, gf), bf)
    growable = (chroma <= 32) & (np.minimum(np.minimum(rf, gf), bf) >= 150)
    out = bg.copy()
    for _ in range(rounds):
        pad = np.pad(out, 1, constant_values=False)
        neigh = (
            pad[1:-1, 2:]
            | pad[1:-1, :-2]
            | pad[2:, 1:-1]
            | pad[:-2, 1:-1]
            | pad[2:, 2:]
            | pad[:-2, :-2]
            | pad[2:, :-2]
            | pad[:-2, 2:]
        )
        out = out | (neigh & growable & ~out)
    return out


def clear_enclosed(arr: np.ndarray, raw: np.ndarray, edge_bg: np.ndarray) -> np.ndarray:
    enclosed = raw & ~edge_bg
    if not np.any(enclosed):
        return edge_bg
    h, w = arr.shape[:2]
    labels = np.zeros((h, w), dtype=np.int32)
    n = 0
    ys, xs = np.where(enclosed)
    q: deque[tuple[int, int]] = deque()
    for x0, y0 in zip(xs.tolist(), ys.tolist()):
        if labels[y0, x0]:
            continue
        n += 1
        q.append((x0, y0))
        labels[y0, x0] = n
        while q:
            x, y = q.popleft()
            for nx, ny in (
                (x + 1, y),
                (x - 1, y),
                (x, y + 1),
                (x, y - 1),
                (x + 1, y + 1),
                (x - 1, y - 1),
                (x + 1, y - 1),
                (x - 1, y + 1),
            ):
                if 0 <= nx < w and 0 <= ny < h and enclosed[ny, nx] and labels[ny, nx] == 0:
                    labels[ny, nx] = n
                    q.append((nx, ny))
    bg = edge_bg.copy()
    lum = arr.astype(np.float32).mean(axis=2)
    area_img = h * w
    for i in range(1, n + 1):
        comp = labels == i
        area = int(comp.sum())
        mean_lum = float(lum[comp].mean()) if area else 0
        # keep large bright screen panels
        if area > area_img * 0.035 and mean_lum >= 225:
            continue
        if area > 10000 and mean_lum >= 240:
            continue
        bg[comp] = True
    return bg


def convert(src: Path, dst: Path) -> None:
    print(f"loading {src.name}...", flush=True)
    im = Image.open(src).convert("RGB")
    if max(im.size) > 1600:
        im.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
    arr = np.asarray(im)
    tiles = detect_tiles(arr)
    print(f"  size={im.size} tiles={tiles}", flush=True)
    raw = near_neutral_mask(arr, tiles)
    edge = flood_edges(raw)
    bg = clear_enclosed(arr, raw, edge)
    bg = grow_into_neutral(arr, bg, rounds=8)
    print(f"  transparent={int(bg.sum())}/{bg.size}", flush=True)

    alpha = np.full(arr.shape[:2], 255, dtype=np.uint8)
    alpha[bg] = 0
    # soft fringe
    pad = np.pad(bg, 1, constant_values=False)
    fringe = (~bg) & (
        pad[1:-1, 2:] | pad[1:-1, :-2] | pad[2:, 1:-1] | pad[:-2, 1:-1]
    )
    rf = arr[:, :, 0].astype(np.int16)
    chroma = np.ptp(arr.astype(np.int16), axis=2)
    soft = fringe & (chroma <= 35) & (rf >= 140)
    alpha[soft] = 40

    Image.fromarray(np.dstack([arr, alpha]), "RGBA").save(dst, "PNG", optimize=True)
    print(f"  wrote {dst.name} ({dst.stat().st_size // 1024} KB)", flush=True)


def main() -> None:
    for name in NAMES:
        src, dst = HERO / f"{name}.jpg", HERO / f"{name}.png"
        if not src.exists():
            print(f"MISSING {src}", flush=True)
            continue
        convert(src, dst)
    print("done", flush=True)


if __name__ == "__main__":
    main()
