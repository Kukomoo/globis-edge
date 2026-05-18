#!/usr/bin/env python3
"""Generate a stylized 30-scene frontline desk video sequence.

This is a fully local pipeline:
1. Write SVG keyframes with a shared visual language.
2. Render PNG keyframes with ffmpeg.
3. Animate each PNG into a 5-second clip with subtle motion.
4. Stitch the clips together with short crossfades for continuity.
"""

from __future__ import annotations

import argparse
import math
import subprocess
from dataclasses import dataclass
from pathlib import Path


FPS = 30
CLIP_SECONDS = 5
CLIP_FRAMES = FPS * CLIP_SECONDS
CANVAS_W = 1920
CANVAS_H = 1080
WORLD_W = 3200
WORLD_H = 1800
ROOT = Path(__file__).resolve().parent
ASSET_ROOT = ROOT / "sequence_assets"
SVG_DIR = ASSET_ROOT / "svgs"
KEYFRAME_DIR = ASSET_ROOT / "keyframes"
CLIP_DIR = ASSET_ROOT / "clips"


@dataclass(frozen=True)
class Scene:
    index: int
    title: str
    viewbox: tuple[int, int, int, int]
    motion: str
    paper_order: float
    screen_glow: float
    device_glow: float
    dusk: float
    hawa_gaze: float
    mother_relax: float
    child_step: float
    hand_focus: bool = False
    topdown: bool = False
    crowd: float = 0.0


SCENES = [
    Scene(1, "Establish", (200, 180, 2600, 1462), "push_in", 0.15, 0.00, 0.10, 0.00, 0.20, 0.10, 0.05),
    Scene(2, "Records", (980, 760, 1180, 664), "drift_right", 0.18, 0.00, 0.15, 0.00, 0.20, 0.10, 0.05, topdown=True),
    Scene(3, "Conversation", (820, 520, 1500, 844), "hold_sway", 0.18, 0.00, 0.16, 0.00, 0.35, 0.12, 0.08),
    Scene(4, "Hawa Portrait", (980, 420, 1100, 619), "push_in", 0.18, 0.00, 0.16, 0.00, 0.45, 0.12, 0.08),
    Scene(5, "Reveal Device", (1080, 580, 1250, 703), "drift_right", 0.20, 0.03, 0.28, 0.00, 0.40, 0.12, 0.08),
    Scene(6, "Hand Device", (1340, 820, 760, 428), "push_in", 0.22, 0.04, 0.35, 0.00, 0.40, 0.12, 0.08, hand_focus=True),
    Scene(7, "Device Screen", (1250, 760, 980, 551), "push_in", 0.22, 0.12, 0.38, 0.00, 0.40, 0.12, 0.08),
    Scene(8, "Conflicting Records", (1220, 780, 900, 506), "hold", 0.24, 0.12, 0.40, 0.00, 0.40, 0.12, 0.08, topdown=True),
    Scene(9, "Low Angle", (1100, 840, 1200, 675), "drift_right", 0.24, 0.16, 0.48, 0.00, 0.40, 0.12, 0.08),
    Scene(10, "Human Center", (980, 640, 1380, 776), "push_in", 0.26, 0.18, 0.50, 0.00, 0.42, 0.14, 0.10),
    Scene(11, "Quiet Processing", (1350, 820, 780, 439), "hold", 0.26, 0.20, 0.52, 0.00, 0.42, 0.14, 0.10),
    Scene(12, "Issue Noticed", (1350, 820, 780, 439), "hold", 0.28, 0.23, 0.54, 0.00, 0.45, 0.14, 0.10),
    Scene(13, "Desk Settles", (1080, 660, 1280, 720), "pull_back", 0.45, 0.20, 0.50, 0.00, 0.48, 0.16, 0.10),
    Scene(14, "Look Up", (930, 500, 1260, 709), "drift_left", 0.45, 0.18, 0.42, 0.00, 0.62, 0.20, 0.10),
    Scene(15, "Across Desk", (820, 560, 1500, 844), "hold_sway", 0.48, 0.18, 0.40, 0.00, 0.65, 0.22, 0.10),
    Scene(16, "New Intake", (1180, 760, 1080, 608), "drift_left", 0.50, 0.20, 0.42, 0.05, 0.60, 0.22, 0.10, hand_focus=True),
    Scene(17, "Lean In", (1120, 700, 1180, 664), "push_in", 0.52, 0.26, 0.48, 0.08, 0.70, 0.22, 0.10),
    Scene(18, "Protective Stop", (1320, 800, 820, 461), "hold", 0.54, 0.24, 0.50, 0.10, 0.72, 0.20, 0.10, hand_focus=True),
    Scene(19, "Decision Returns", (860, 520, 1500, 844), "pull_back", 0.58, 0.18, 0.38, 0.12, 0.72, 0.35, 0.10),
    Scene(20, "Intake Area", (120, 240, 2800, 1575), "pan_wide", 0.58, 0.14, 0.32, 0.15, 0.70, 0.35, 0.10, crowd=0.65),
    Scene(21, "Papers Align", (1180, 780, 1040, 585), "drift_right", 0.76, 0.14, 0.30, 0.18, 0.70, 0.40, 0.10),
    Scene(22, "Shared Screen", (980, 620, 1280, 720), "push_in", 0.76, 0.32, 0.34, 0.22, 0.76, 0.48, 0.10),
    Scene(23, "The Nod", (1700, 520, 980, 551), "push_in", 0.78, 0.34, 0.34, 0.24, 0.76, 0.55, 0.10),
    Scene(24, "Final Confirm", (1260, 780, 940, 529), "hold", 0.84, 0.30, 0.42, 0.28, 0.78, 0.60, 0.10, hand_focus=True),
    Scene(25, "Working Desk", (1040, 690, 1280, 720), "drift_left", 0.92, 0.14, 0.30, 0.32, 0.78, 0.62, 0.10),
    Scene(26, "Device Hero", (1460, 830, 620, 349), "push_in", 0.92, 0.10, 0.48, 0.34, 0.78, 0.62, 0.10),
    Scene(27, "Edge Not Cloud", (0, 260, 3200, 1800), "wide_breath", 0.92, 0.08, 0.42, 0.40, 0.78, 0.62, 0.10, crowd=0.25),
    Scene(28, "Hawa at Dusk", (900, 480, 1360, 765), "push_in", 0.94, 0.12, 0.56, 0.72, 0.82, 0.64, 0.10, crowd=0.15),
    Scene(29, "Final Group", (980, 520, 1320, 743), "push_in", 0.96, 0.12, 0.44, 0.78, 0.82, 0.80, 0.10),
    Scene(30, "Closing Tableau", (160, 260, 2800, 1575), "pan_settle", 0.96, 0.08, 0.38, 0.88, 0.78, 0.90, 0.10, crowd=0.20),
]


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def mix_hex(c1: str, c2: str, t: float) -> str:
    c1 = c1.lstrip("#")
    c2 = c2.lstrip("#")
    rgb1 = [int(c1[i : i + 2], 16) for i in (0, 2, 4)]
    rgb2 = [int(c2[i : i + 2], 16) for i in (0, 2, 4)]
    rgb = [round(lerp(a, b, t)) for a, b in zip(rgb1, rgb2)]
    return "#" + "".join(f"{v:02x}" for v in rgb)


def scene_palette(scene: Scene) -> dict[str, str]:
    dusk = scene.dusk
    return {
        "sky_top": mix_hex("#8fc8ca", "#28506a", dusk),
        "sky_bottom": mix_hex("#c8d5c6", "#5d6a82", dusk),
        "sand": mix_hex("#d7b26b", "#b98b5b", dusk),
        "sand_dark": mix_hex("#bf8f4f", "#8c6241", dusk),
        "ridge_1": mix_hex("#cb6d3b", "#854835", dusk),
        "ridge_2": mix_hex("#9c4f37", "#5f3a32", dusk),
        "teal": mix_hex("#2f7473", "#4db6b0", dusk * 0.6),
        "teal_soft": mix_hex("#4d9b95", "#7ed7d2", dusk * 0.6),
        "paper": mix_hex("#f3e5c7", "#ddc9a8", dusk * 0.5),
        "paper_shadow": mix_hex("#d7c099", "#9e8768", dusk * 0.7),
        "desk": mix_hex("#8f6849", "#6d4f3d", dusk * 0.5),
        "desk_dark": mix_hex("#6d4d37", "#51382c", dusk * 0.6),
        "cloth": mix_hex("#90846d", "#766a59", dusk * 0.4),
        "outline": mix_hex("#47362b", "#2e2522", dusk * 0.5),
        "sun": mix_hex("#f3e8b0", "#d9c7a0", dusk),
    }


def svg_header(scene: Scene, palette: dict[str, str]) -> str:
    vx, vy, vw, vh = scene.viewbox
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{CANVAS_W}" height="{CANVAS_H}" viewBox="{vx} {vy} {vw} {vh}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{palette['sky_top']}"/>
      <stop offset="100%" stop-color="{palette['sky_bottom']}"/>
    </linearGradient>
    <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{palette['sand']}"/>
      <stop offset="100%" stop-color="{palette['sand_dark']}"/>
    </linearGradient>
    <filter id="grain" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0 0.08 0.12"/>
      </feComponentTransfer>
    </filter>
    <filter id="softgrain" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="11" result="noise"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0 0.04 0.08"/>
      </feComponentTransfer>
    </filter>
    <radialGradient id="screenGlow">
      <stop offset="0%" stop-color="{palette['teal_soft']}" stop-opacity="{0.28 + scene.screen_glow * 0.45:.2f}"/>
      <stop offset="100%" stop-color="{palette['teal_soft']}" stop-opacity="0"/>
    </radialGradient>
  </defs>
"""


def background_layers(scene: Scene, palette: dict[str, str]) -> str:
    dusk = scene.dusk
    sun_y = lerp(260, 380, dusk)
    sky = f'<rect width="{WORLD_W}" height="{WORLD_H}" fill="url(#sky)"/>'
    sun = f'<circle cx="2540" cy="{sun_y:.1f}" r="{lerp(90, 55, dusk):.1f}" fill="{palette["sun"]}" fill-opacity="{lerp(0.55, 0.28, dusk):.2f}"/>'
    ridge_back = (
        f'<path d="M0,950 C250,820 420,840 650,910 C880,980 1090,820 1390,880 '
        f'C1650,930 1910,760 2200,840 C2480,920 2750,720 3200,850 L3200,1800 L0,1800 Z" '
        f'fill="{palette["ridge_1"]}" fill-opacity="{lerp(0.95,0.85,dusk):.2f}"/>'
    )
    ridge_front = (
        f'<path d="M0,1120 C220,1040 480,1080 760,1140 C1030,1200 1330,990 1650,1040 '
        f'C1940,1080 2210,980 2520,1030 C2800,1080 2980,1010 3200,1060 L3200,1800 L0,1800 Z" '
        f'fill="{palette["ridge_2"]}" fill-opacity="{lerp(0.92,0.88,dusk):.2f}"/>'
    )
    ground = f'<rect y="1020" width="{WORLD_W}" height="{WORLD_H - 1020}" fill="url(#sand)"/>'
    tents = []
    for tx, ty, scale in [(480, 980, 1.0), (670, 950, 0.8), (820, 995, 0.7)]:
        tents.append(
            f'<g opacity="{lerp(0.95,0.72,dusk):.2f}">'
            f'<polygon points="{tx},{ty} {tx+120*scale},{ty-95*scale} {tx+250*scale},{ty}" fill="{mix_hex(palette["paper"], palette["sand"], 0.35)}"/>'
            f'<rect x="{tx+18*scale}" y="{ty}" width="{210*scale}" height="{56*scale}" fill="{mix_hex(palette["paper"], palette["sand_dark"], 0.2)}"/>'
            f'</g>'
        )
    fences = []
    for i in range(7):
        x = 980 + i * 160
        fences.append(f'<rect x="{x}" y="1000" width="10" height="70" fill="{palette["outline"]}" opacity="0.35"/>')
    silhouettes = []
    for i in range(6):
        if i / 5 > scene.crowd:
            continue
        x = 1120 + i * 170
        y = 980 + (i % 2) * 22
        silhouettes.append(
            f'<g opacity="{0.16 + scene.crowd * 0.16:.2f}" fill="{palette["outline"]}">'
            f'<circle cx="{x}" cy="{y-48}" r="18"/><rect x="{x-14}" y="{y-40}" width="28" height="78" rx="12"/>'
            f'</g>'
        )
    overlay = f'<rect width="{WORLD_W}" height="{WORLD_H}" fill="{palette["paper"]}" opacity="0.08" filter="url(#grain)"/>'
    return "\n".join([sky, sun, ridge_back, ridge_front, ground, *tents, *fences, *silhouettes, overlay])


def paper_stack(scene: Scene, palette: dict[str, str]) -> str:
    ordered = scene.paper_order
    items = []
    base_x = 1110
    base_y = 1008
    for i in range(8):
        jitter_x = lerp((i % 3 - 1) * 18, (i % 2) * 6, ordered)
        jitter_y = lerp((i % 4) * 7, i * 2.5, ordered)
        rot = lerp((i % 5 - 2) * 2.4, (i % 2 - 0.5) * 0.5, ordered)
        width = 190 - i * 6
        height = 118 - i * 5
        x = base_x + i * 20 + jitter_x
        y = base_y - i * 8 + jitter_y
        items.append(
            f'<g transform="translate({x:.1f},{y:.1f}) rotate({rot:.1f})">'
            f'<rect x="0" y="0" width="{width}" height="{height}" rx="6" fill="{palette["paper_shadow"]}" opacity="0.55"/>'
            f'<rect x="-8" y="-8" width="{width}" height="{height}" rx="6" fill="{palette["paper"]}" stroke="{palette["outline"]}" stroke-opacity="0.18"/>'
            f'<rect x="12" y="16" width="{width*0.62:.1f}" height="12" rx="4" fill="{palette["paper_shadow"]}" opacity="0.35"/>'
            f'<rect x="12" y="38" width="{width*0.48:.1f}" height="10" rx="4" fill="{palette["paper_shadow"]}" opacity="0.25"/>'
            f'</g>'
        )
    cards = []
    for i in range(3):
        x = 1495 + i * 105
        y = 1035 + (i % 2) * 18
        cards.append(
            f'<g transform="translate({x},{y}) rotate({-6 + i * 4})">'
            f'<rect width="96" height="62" rx="8" fill="{mix_hex(palette["paper"], palette["sand"], 0.18)}" stroke="{palette["outline"]}" stroke-opacity="0.2"/>'
            f'<rect x="10" y="12" width="26" height="24" rx="4" fill="{palette["paper_shadow"]}" opacity="0.55"/>'
            f'<rect x="44" y="16" width="38" height="8" rx="3" fill="{palette["paper_shadow"]}" opacity="0.35"/>'
            f'<rect x="44" y="30" width="28" height="6" rx="3" fill="{palette["paper_shadow"]}" opacity="0.22"/>'
            f'</g>'
        )
    teal_folder = (
        f'<g transform="translate(1630,968) rotate({lerp(-8, -2, ordered):.1f})">'
        f'<rect width="250" height="158" rx="10" fill="{palette["teal"]}" opacity="0.98"/>'
        f'<rect x="18" y="24" width="178" height="18" rx="8" fill="{palette["teal_soft"]}" opacity="0.35"/>'
        f'</g>'
    )
    return "\n".join([*items, teal_folder, *cards])


def desk(scene: Scene, palette: dict[str, str]) -> str:
    top = (
        f'<polygon points="980,930 1935,930 2065,1095 860,1095" fill="{mix_hex(palette["desk"], palette["paper"], 0.05)}" '
        f'stroke="{palette["outline"]}" stroke-opacity="0.25"/>'
    )
    front = (
        f'<polygon points="860,1095 2065,1095 2030,1335 930,1335" fill="{palette["desk"]}" '
        f'stroke="{palette["outline"]}" stroke-opacity="0.28"/>'
    )
    shelf = f'<rect x="1140" y="1165" width="560" height="28" rx="10" fill="{palette["desk_dark"]}" opacity="0.35"/>'
    return "\n".join([front, shelf, top])


def device_and_screen(scene: Scene, palette: dict[str, str]) -> str:
    device_glow = scene.device_glow
    screen_glow = scene.screen_glow
    screen = (
        f'<g transform="translate(1700,835) rotate(-5)">'
        f'<ellipse cx="150" cy="150" rx="180" ry="140" fill="url(#screenGlow)" opacity="{0.35 + screen_glow * 0.5:.2f}"/>'
        f'<rect x="0" y="0" width="260" height="170" rx="16" fill="{mix_hex(palette["desk_dark"], palette["outline"], 0.25)}" stroke="{palette["outline"]}" stroke-opacity="0.3"/>'
        f'<rect x="18" y="18" width="224" height="134" rx="10" fill="{mix_hex(palette["sky_top"], palette["teal"], 0.55)}"/>'
        f'<rect x="34" y="40" width="84" height="48" rx="10" fill="{palette["teal_soft"]}" opacity="{0.22 + screen_glow * 0.35:.2f}"/>'
        f'<rect x="130" y="34" width="82" height="20" rx="8" fill="{palette["paper"]}" opacity="0.15"/>'
        f'<rect x="130" y="66" width="72" height="14" rx="7" fill="{palette["paper"]}" opacity="0.12"/>'
        f'<rect x="34" y="100" width="176" height="26" rx="8" fill="{palette["paper"]}" opacity="0.10"/>'
        f'<rect x="102" y="170" width="56" height="40" rx="8" fill="{mix_hex(palette["desk_dark"], palette["outline"], 0.2)}"/>'
        f'</g>'
    )
    device = (
        f'<g transform="translate(1515,985)">'
        f'<ellipse cx="110" cy="74" rx="{90 + device_glow * 50:.1f}" ry="{36 + device_glow * 12:.1f}" fill="{palette["teal_soft"]}" opacity="{0.10 + device_glow * 0.22:.2f}"/>'
        f'<rect x="0" y="0" width="220" height="110" rx="18" fill="{mix_hex(palette["cloth"], palette["sand"], 0.15)}" stroke="{palette["outline"]}" stroke-opacity="0.25"/>'
        f'<rect x="16" y="18" width="110" height="18" rx="6" fill="{palette["paper"]}" opacity="0.12"/>'
        f'<circle cx="178" cy="56" r="15" fill="{palette["teal_soft"]}" opacity="{0.45 + device_glow * 0.45:.2f}"/>'
        f'<circle cx="178" cy="56" r="32" fill="{palette["teal_soft"]}" opacity="{0.06 + device_glow * 0.08:.2f}"/>'
        f'</g>'
    )
    return "\n".join([screen, device])


def person(x: float, y: float, scale: float, robe: str, scarf: str, palette: dict[str, str], *, pose: float = 0.0, child: bool = False) -> str:
    head_r = 40 * scale * (0.75 if child else 1.0)
    body_h = 210 * scale * (0.72 if child else 1.0)
    body_w = 130 * scale * (0.7 if child else 1.0)
    arm_shift = 16 * pose * scale
    return (
        f'<g transform="translate({x:.1f},{y:.1f})">'
        f'<ellipse cx="{body_w*0.48:.1f}" cy="{body_h+38*scale:.1f}" rx="{body_w*0.55:.1f}" ry="{26*scale:.1f}" fill="{palette["outline"]}" opacity="0.08"/>'
        f'<path d="M{body_w*0.1:.1f},{body_h*0.22:.1f} C{body_w*0.06:.1f},{body_h*0.72:.1f} {body_w*0.18:.1f},{body_h:.1f} {body_w*0.48:.1f},{body_h:.1f} '
        f'C{body_w*0.78:.1f},{body_h:.1f} {body_w*0.94:.1f},{body_h*0.74:.1f} {body_w*0.88:.1f},{body_h*0.22:.1f} '
        f'C{body_w*0.74:.1f},{body_h*0.10:.1f} {body_w*0.26:.1f},{body_h*0.10:.1f} {body_w*0.1:.1f},{body_h*0.22:.1f} Z" '
        f'fill="{robe}" stroke="{palette["outline"]}" stroke-opacity="0.22"/>'
        f'<path d="M{body_w*0.12:.1f},{body_h*0.36:.1f} C{body_w*0.10-arm_shift:.1f},{body_h*0.54:.1f} {body_w*0.05-arm_shift:.1f},{body_h*0.70:.1f} {body_w*0.02-arm_shift:.1f},{body_h*0.84:.1f}" stroke="{robe}" stroke-width="{20*scale:.1f}" stroke-linecap="round" opacity="0.95"/>'
        f'<path d="M{body_w*0.84:.1f},{body_h*0.36:.1f} C{body_w*0.88+arm_shift:.1f},{body_h*0.50:.1f} {body_w*0.96+arm_shift:.1f},{body_h*0.66:.1f} {body_w*1.02+arm_shift:.1f},{body_h*0.80:.1f}" stroke="{robe}" stroke-width="{20*scale:.1f}" stroke-linecap="round" opacity="0.95"/>'
        f'<circle cx="{body_w*0.5:.1f}" cy="{head_r+8:.1f}" r="{head_r:.1f}" fill="{mix_hex(robe, palette["paper"], 0.28)}" stroke="{palette["outline"]}" stroke-opacity="0.18"/>'
        f'<path d="M{body_w*0.08:.1f},{head_r*1.10:.1f} C{body_w*0.18:.1f},{head_r*0.15:.1f} {body_w*0.82:.1f},{head_r*0.12:.1f} {body_w*0.92:.1f},{head_r*1.14:.1f} '
        f'L{body_w*0.76:.1f},{head_r*1.95:.1f} C{body_w*0.66:.1f},{head_r*1.76:.1f} {body_w*0.34:.1f},{head_r*1.76:.1f} {body_w*0.24:.1f},{head_r*1.96:.1f} Z" fill="{scarf}"/>'
        f'</g>'
    )


def hand_overlay(scene: Scene, palette: dict[str, str]) -> str:
    if not scene.hand_focus:
        return ""
    return (
        f'<g opacity="0.92" transform="translate(1320,880) rotate(-8)">'
        f'<path d="M0,90 C70,48 142,28 218,18 C256,12 312,18 324,44 C338,76 292,116 252,122 C194,132 110,134 30,124 Z" '
        f'fill="{mix_hex(palette["paper"], palette["sand_dark"], 0.28)}" stroke="{palette["outline"]}" stroke-opacity="0.18"/>'
        f'</g>'
    )


def scene_figures(scene: Scene, palette: dict[str, str]) -> str:
    hawa = person(
        1180,
        650,
        1.08,
        mix_hex(palette["cloth"], palette["sand"], 0.08),
        palette["teal"],
        palette,
        pose=scene.hawa_gaze - 0.5,
    )
    mother = person(
        2180,
        760 - scene.mother_relax * 18,
        0.98,
        mix_hex(palette["paper_shadow"], palette["sand_dark"], 0.18),
        mix_hex(palette["paper"], palette["sand"], 0.30),
        palette,
        pose=scene.mother_relax - 0.4,
    )
    child_1 = person(
        2385 + scene.child_step * 40,
        852 - scene.child_step * 10,
        0.60,
        mix_hex(palette["sand"], palette["paper"], 0.15),
        mix_hex(palette["paper"], palette["sand"], 0.18),
        palette,
        pose=0.10,
        child=True,
    )
    child_2 = person(
        2285,
        900,
        0.52,
        mix_hex(palette["sand_dark"], palette["paper"], 0.08),
        mix_hex(palette["paper"], palette["sand_dark"], 0.16),
        palette,
        pose=-0.10,
        child=True,
    )
    return "\n".join([hawa, mother, child_1, child_2])


def scene_svg(scene: Scene) -> str:
    palette = scene_palette(scene)
    border_wash = f'<rect width="{WORLD_W}" height="{WORLD_H}" fill="{palette["paper"]}" opacity="0.06"/>'
    final_grain = f'<rect width="{WORLD_W}" height="{WORLD_H}" fill="{palette["outline"]}" opacity="0.04" filter="url(#softgrain)"/>'
    return "\n".join(
        [
            svg_header(scene, palette),
            background_layers(scene, palette),
            scene_figures(scene, palette),
            desk(scene, palette),
            paper_stack(scene, palette),
            device_and_screen(scene, palette),
            hand_overlay(scene, palette),
            border_wash,
            final_grain,
            "</svg>",
        ]
    )


def write_svgs() -> list[Path]:
    SVG_DIR.mkdir(parents=True, exist_ok=True)
    files = []
    for scene in SCENES:
        path = SVG_DIR / f"scene_{scene.index:02d}.svg"
        path.write_text(scene_svg(scene), encoding="utf-8")
        files.append(path)
    return files


def render_keyframes(svg_paths: list[Path]) -> list[Path]:
    KEYFRAME_DIR.mkdir(parents=True, exist_ok=True)
    files = []
    for svg_path in svg_paths:
        generated_png = KEYFRAME_DIR / f"{svg_path.name}.png"
        final_png = KEYFRAME_DIR / f"{svg_path.stem}.png"
        run(
            [
                "qlmanage",
                "-t",
                "-s",
                str(CANVAS_W),
                "-o",
                str(KEYFRAME_DIR),
                str(svg_path),
            ]
        )
        if generated_png.exists():
            generated_png.replace(final_png)
        files.append(final_png)
    return files


def render_keyframes_ffmpeg(svg_paths: list[Path]) -> list[Path]:
    """Unused fallback kept for reference if local ffmpeg ever gains svg decode."""
    KEYFRAME_DIR.mkdir(parents=True, exist_ok=True)
    files = []
    for svg_path in svg_paths:
        png_path = KEYFRAME_DIR / f"{svg_path.stem}.png"
        run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(svg_path),
                "-frames:v",
                "1",
                str(png_path),
            ]
        )
        files.append(png_path)
    return files


def motion_filter(scene: Scene) -> str:
    if scene.motion == "push_in":
        return (
            "zoompan="
            "z='if(eq(on,1),1.0,min(zoom+0.00045,1.07))':"
            "x='iw/2-(iw/zoom/2)':"
            "y='ih/2-(ih/zoom/2)':"
            f"d=1:s={CANVAS_W}x{CANVAS_H}:fps={FPS}"
        )
    if scene.motion == "pull_back":
        return (
            "zoompan="
            "z='if(eq(on,1),1.06,max(zoom-0.00038,1.0))':"
            "x='iw/2-(iw/zoom/2)':"
            "y='ih/2-(ih/zoom/2)':"
            f"d=1:s={CANVAS_W}x{CANVAS_H}:fps={FPS}"
        )
    if scene.motion == "drift_right":
        return (
            "zoompan="
            "z='if(eq(on,1),1.02,min(zoom+0.00018,1.05))':"
            "x='iw/2-(iw/zoom/2) - 36 + on*0.22':"
            "y='ih/2-(ih/zoom/2)':"
            f"d=1:s={CANVAS_W}x{CANVAS_H}:fps={FPS}"
        )
    if scene.motion == "drift_left":
        return (
            "zoompan="
            "z='if(eq(on,1),1.02,min(zoom+0.00018,1.05))':"
            "x='iw/2-(iw/zoom/2) + 36 - on*0.22':"
            "y='ih/2-(ih/zoom/2)':"
            f"d=1:s={CANVAS_W}x{CANVAS_H}:fps={FPS}"
        )
    if scene.motion == "pan_wide":
        return (
            "zoompan="
            "z='if(eq(on,1),1.0,min(zoom+0.0001,1.015))':"
            "x='iw/2-(iw/zoom/2) - 85 + on*0.55':"
            "y='ih/2-(ih/zoom/2)':"
            f"d=1:s={CANVAS_W}x{CANVAS_H}:fps={FPS}"
        )
    if scene.motion == "wide_breath":
        return (
            "zoompan="
            "z='if(eq(on,1),1.015,1.015 + 0.01*sin(on/27))':"
            "x='iw/2-(iw/zoom/2)':"
            "y='ih/2-(ih/zoom/2)':"
            f"d=1:s={CANVAS_W}x{CANVAS_H}:fps={FPS}"
        )
    if scene.motion == "pan_settle":
        return (
            "zoompan="
            "z='if(eq(on,1),1.012,1.012)':"
            "x='iw/2-(iw/zoom/2) - 40 + if(lt(on,90), on*0.35, 31.5 - (on-90)*0.20)':"
            "y='ih/2-(ih/zoom/2)':"
            f"d=1:s={CANVAS_W}x{CANVAS_H}:fps={FPS}"
        )
    if scene.motion == "hold_sway":
        return (
            "zoompan="
            "z='if(eq(on,1),1.025,1.025 + 0.003*sin(on/18))':"
            "x='iw/2-(iw/zoom/2) + 8*sin(on/25)':"
            "y='ih/2-(ih/zoom/2) + 5*cos(on/28)':"
            f"d=1:s={CANVAS_W}x{CANVAS_H}:fps={FPS}"
        )
    return (
        "zoompan="
        "z='if(eq(on,1),1.02,1.02)':"
        "x='iw/2-(iw/zoom/2)':"
        "y='ih/2-(ih/zoom/2)':"
        f"d=1:s={CANVAS_W}x{CANVAS_H}:fps={FPS}"
    )


def render_clips(keyframes: list[Path]) -> list[Path]:
    CLIP_DIR.mkdir(parents=True, exist_ok=True)
    for stale_clip in CLIP_DIR.glob("scene_*.mp4"):
        stale_clip.unlink()
    clip_paths = []
    for scene, keyframe in zip(SCENES, keyframes):
        clip_path = CLIP_DIR / f"{keyframe.stem}.mp4"
        run(
            [
                "ffmpeg",
                "-y",
                "-loop",
                "1",
                "-framerate",
                str(FPS),
                "-t",
                str(CLIP_SECONDS),
                "-i",
                str(keyframe),
                "-vf",
                f"{motion_filter(scene)},format=yuv420p",
                "-an",
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                str(clip_path),
            ]
        )
        clip_paths.append(clip_path)
    return clip_paths


def stitch_video(clips: list[Path], output: Path) -> None:
    fade = 0.30
    offset = CLIP_SECONDS - fade
    cmd = ["ffmpeg", "-y"]
    for clip in clips:
        cmd.extend(["-i", str(clip)])
    parts = []
    last = "[0:v]"
    current_offset = offset
    for i in range(1, len(clips)):
        label = f"[v{i}]"
        parts.append(
            f"{last}[{i}:v]xfade=transition=fade:duration={fade}:offset={current_offset:.2f}{label}"
        )
        last = label
        current_offset += CLIP_SECONDS - fade
    filter_complex = ";".join(parts)
    cmd.extend(
        [
            "-filter_complex",
            filter_complex,
            "-map",
            last,
            "-an",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            str(output),
        ]
    )
    run(cmd)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        default=str(ROOT / "frontline_sequence.mp4"),
        help="Final stitched video path.",
    )
    args = parser.parse_args()

    svg_paths = write_svgs()
    keyframes = render_keyframes(svg_paths)
    clips = render_clips(keyframes)
    stitch_video(clips, Path(args.output))
    print(f"Generated {len(svg_paths)} SVGs, {len(keyframes)} keyframes, {len(clips)} clips.")
    print(f"Final video: {args.output}")


if __name__ == "__main__":
    main()
