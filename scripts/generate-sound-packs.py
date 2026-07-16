#!/usr/bin/env python3
"""Generate distinct sound-pack MP3s from classic LifeQuest SFX."""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLASSIC_DIR = ROOT / "assets" / "sounds"
PACKS_DIR = CLASSIC_DIR / "packs"

# Classic filename -> pack filename
FILE_MAP: dict[str, str] = {
    "button_tap.mp3": "button_tap.mp3",
    "success.mp3": "success.mp3",
    "error.mp3": "error.mp3",
    "achievement.mp3": "achievement_unlock.mp3",
    "milestone.mp3": "life_milestone.mp3",
    "age_up.mp3": "age_up.mp3",
    "level_up.mp3": "level_up.mp3",
    "coins.mp3": "coins_earned.mp3",
    "negative.mp3": "negative_event.mp3",
    "positive.mp3": "positive_event.mp3",
    "decision.mp3": "decision_made.mp3",
    "page_turn.mp3": "page_turn.mp3",
    "notification.mp3": "notification.mp3",
    "death.mp3": "death.mp3",
    "reincarnate.mp3": "reincarnate.mp3",
}

# FFmpeg -af chains tuned per pack profile (see soundPacks.ts descriptions).
PACK_FILTERS: dict[str, str] = {
  # Soft, subtle — thin, quiet, quick decay
  "minimal": (
      "highpass=f=750,lowpass=f=8500,"
      "volume=0.48,"
      "afade=t=out:st=0:d=0.18,"
      "atempo=1.12"
  ),
  # Warm, mellow — rounded lows, gentle room
  "jazz": (
      "bass=g=5,treble=g=-2,"
      "aecho=0.75:0.82:55:0.22,"
      "asetrate=44100*0.965,aresample=44100,"
      "volume=0.7"
  ),
  # Punchy dramatic — boosted lows/highs, short slapback
  "cinematic": (
      "bass=g=9,treble=g=4,"
      "aecho=0.85:0.9:35:0.38,"
      "compand=0.25|0.75:6:-70/-55|-18/-12|0/-2:6:0:-90:0.2,"
      "volume=0.94"
  ),
  # Legacy lo-fi tint — muffled, warm (catalog maps lofi cosmetic → minimal)
  "lofi": (
      "lowpass=f=3200,highpass=f=180,"
      "bass=g=3,"
      "volume=0.58,"
      "afade=t=out:st=0:d=0.22"
  ),
}


def require_ffmpeg() -> str:
    path = shutil.which("ffmpeg")
    if not path:
        print("ffmpeg not found — install ffmpeg to regenerate sound packs.", file=sys.stderr)
        sys.exit(1)
    return path


def render_pack(ffmpeg: str, pack_id: str, af_filter: str) -> int:
    out_dir = PACKS_DIR / pack_id
    out_dir.mkdir(parents=True, exist_ok=True)
    written = 0

    for classic_name, pack_name in FILE_MAP.items():
        src = CLASSIC_DIR / classic_name
        dst = out_dir / pack_name
        if not src.is_file():
            print(f"skip missing classic: {src}", file=sys.stderr)
            continue

        cmd = [
            ffmpeg,
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(src),
            "-af",
            af_filter,
            "-codec:a",
            "libmp3lame",
            "-q:a",
            "4",
            str(dst),
        ]
        subprocess.run(cmd, check=True)
        written += 1

    return written


def main() -> None:
    ffmpeg = require_ffmpeg()
    total = 0
    for pack_id, af_filter in PACK_FILTERS.items():
        count = render_pack(ffmpeg, pack_id, af_filter)
        print(f"{pack_id}: wrote {count} files -> {PACKS_DIR / pack_id}")
        total += count
    print(f"done — {total} pack sounds generated")


if __name__ == "__main__":
    main()
