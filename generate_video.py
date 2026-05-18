#!/usr/bin/env python3
"""
Globis Edge 2.0 — 30-Scene Video Generator
Generates 30 scenes using image prompts and assembles into a 3-minute video
"""

import os
import json
import time
from pathlib import Path
from datetime import datetime

# Scene prompts (simplified for efficiency)
SCENE_PROMPTS = [
    # Scene 1
    "Mid-century editorial illustration, handpainted desert scene. Caseworker Hawa in teal headscarf stands behind wooden desk with scattered papers and teal folder. Refugee mother and two children wait nearby. Warm ochre sand, rust-red ridges, turquoise sky. Visible grain, stippled texture. Wide angle, calm observational mood.",

    # Scene 2
    "Close top-down view of wooden desk. Two records and ID cards visible. Teal folder on right. Hawa's hands frame documents. Family silhouettes in distance. Same palette as Scene 1: warm ochre sand, turquoise sky. Visible grain.",

    # Scene 3
    "Medium shot at desk height. Hawa seated behind desk facing mother. One child beside mother, one behind. Sand foreground. Desk and papers bright band between them. Tents and ridges background. Same aesthetic: mid-century illustration, visible grain, warm ochre, rust-red, turquoise.",

    # Scene 4
    "Portrait of Hawa from waist up behind desk. Teal headscarf pop against warm sand and turquoise sky. Parchment papers foreground. Mother and children soft silhouettes background. Mid-century style, visible grain, calm concentrated expression.",

    # Scene 5
    "Wider desk view. Small Pi 5 device visible near teal folder, sand-tone casing with teal indicator light glowing. Hawa behind desk, family waiting right. Pale sun above horizon. Mid-century illustration style, visible grain, warm palette.",

    # Scene 6
    "Tight close-up on Hawa's hand near device, fingers poised. Teal folder and ID cards diagonal pattern. Background horizon compressed. Device sand-tone, teal light bright. Mid-century style, visible grain, anticipatory mood.",

    # Scene 7
    "Wider desk composition. Pi 5 device, simple screen angled toward Hawa at 45°, intake papers, ID card, teal notebook. Hawa's torso left, family soft on right. Screen shows abstract teal and sand rectangles, no text. Mid-century illustration, visible grain.",

    # Scene 8
    "Very tight overhead crop. Two overlapping records with visible conflict (birth years differ). Hawa's notes between them. Sand-yellow desk, device corner visible with teal light. Mid-century style, visible grain. Quiet tension through stillness.",

    # Scene 9
    "Low desk-level angle looking over scattered forms toward device and screen. Hawa teal-scarved silhouette beyond. Mother and children tiny far right. Long stippled shadows on desk. Mid-century illustration, visible grain, tension building.",

    # Scene 10
    "From Hawa's side of desk: her hands on conflicting documents foreground. Device and screen mid-frame. Mother seated opposite with one child leaning in, another standing behind. Warm sand background, hints of tents. Mid-century style, visible grain.",

    # Scene 11
    "Close desk view. Screen and device embedded in desk world. Few papers and ID card partially overlapping. Hawa's sleeved arm with teal fabric enters left. Screen shows abstract teal and sand motion. Device indicator breathes slowly. Mid-century style.",

    # Scene 12
    "Same desk-screen composition. One paper edge slightly raised. Hawa's hand shifted toward pen. Screen content subtly changed—rectangles shifted asymmetrically, flagging discrepancy. Visible grain. Quiet pause, shadow change, tightened fingers.",

    # Scene 13
    "Wider balanced desk shot. Papers now more ordered, some under teal folder. Device center-right. Screen calm showing abstract patterns. Background horizon with tents and ridges visible above desk. Hands alert but resting. Mid-century style.",

    # Scene 14
    "Medium shot of Hawa looking up from desk toward mother. Teal scarf catches warm light with soft glow. Device edge of frame. Family larger and clearer against sand and rocky ridges. Mother's eyes show trust. Mid-century illustration.",

    # Scene 15
    "Warm conversational shot across desk: Hawa left, mother right, child near edge, another standing behind. Desk and papers bright band. Turquoise sky and tents simplified background. Hand gestures exchange. Camera sway, intimate grounding. Mid-century style.",

    # Scene 16
    "Close desk angle from right. New intake paper with rust-toned corner near device, suggesting another case. Previously processed stack neatly behind, anchored by teal folder. Hawa's hand entering left to place new paper. Continuity of work evident. Mid-century style.",

    # Scene 17
    "Overhead three-quarter angle down at desk: Hawa leans in over desk, screen, device. Teal scarf forms triangle with key objects. Background horizon compressed into thin line. Sand foreground heavily stippled. Concentration deepens. Mid-century illustration.",

    # Scene 18
    "Tight close-up on Hawa's hand paused above sensitive paper. Device and screen beneath. Palette slightly cooled with softer yellows, deeper shadows signaling caution. Papers near-motionless. Visible grain. Protective system at work.",

    # Scene 19
    "Wider shot including Hawa, family, device, screen in one calm frame, loose triangle composition. Device small but visible. Papers organized. Sky warmed slightly—dusk approaching. Hawa's shoulders relax. Family posture softens. Mid-century style.",

    # Scene 20
    "Wide reception area view: Hawa at desk foreground (teal scarf bright), few waiting families mid-ground (3–4 soft silhouettes), tents and fencing under hazy turquoise sky. Device faintly visible on Hawa's desk. Foreground heavily stippled sand. Mid-century illustration.",

    # Scene 21
    "Close desk view where loose papers slide into tidy stack beside device. Current intake form on top, freshly processed. Hawa's hands guiding papers. Each edges up with soft rustling motion. Camera holds still witnessing order emerge. Mid-century style.",

    # Scene 22
    "Intimate angle where Hawa and mother both look toward shared screen between them. Children nearby. Teal-tinted light from screen softly illuminates faces. Background simplified to sand and sky, almost fading. Screen glow gentle. Mid-century illustration.",

    # Scene 23
    "Closer shot on mother's face and one child. Hawa partially visible left, slightly out of focus. Screen glow linking them. Sand and sky framing. Mother's deliberate nod animated slowly. Child watches sense resolution. Everything calm and held. Mid-century style.",

    # Scene 24
    "Desk-level view of Hawa's hand making final confirmation gesture beside glowing device and orderly papers. Mother and children visible behind, noticeably calmer. Papers neat. Device teal light steady. Hand gesture gentle and deliberate. Mid-century illustration.",

    # Scene 25
    "Slightly pulled-back desk composition: organized records, teal folder, aligned ID cards, resting device with steady teal dot. Papers in clear folders. Calm sand. Distant tents and vast sky give breathing room. Hawa poised and ready. Mid-century style.",

    # Scene 26
    "Tight hero close-up on Pi 5 device, teal indicator pulsing slowly. Grain and stippled texture clear on casing and desk. Corner of teal folder in frame. Papers slightly out of focus behind. Device light casts faint glow. Mid-century illustration.",

    # Scene 27
    "Pulling away into very wide horizon shot: vast stippled desert, rocky ridges warm reds, small cluster of tents and tiny desk with Hawa and device as only vivid teal accent. Sky deeper turquoise, approaching dusk. Small human silhouettes distant. Mid-century style.",

    # Scene 28
    "Dusk hero shot: Hawa seated behind desk, organized records and device in front. Few distant figures moving safely in fading light (processed families). Sky deep turquoise and violet. Sand warm. Teal scarf and device glow brightest. Mid-century illustration.",

    # Scene 29
    "Intimate group shot near desk: Hawa, mother, two children together relaxed. Papers neat on desk. Device small but present. Wind softer in clothing. Family whole, documented, safe. Sky dusk. Group fills more of frame. Calm resolved body language. Mid-century style.",

    # Scene 30
    "Wide closing dusk view of reception area: Hawa at desk ready for next family. Previous family walking away right mid-ground with quiet dignity toward shelter. Desk, papers, teal folder, device anchor foreground. Sky darkening, stippled stars appearing. Approaching next family visible distance. Mid-century illustration, infinite work, infinite hope."
]

# Scene metadata with timing and descriptions
SCENE_METADATA = [
    {"title": "Establish the World", "duration": 5},
    {"title": "Slide Over Records", "duration": 5},
    {"title": "Set Up the Conversation", "duration": 5},
    {"title": "Focus on Hawa", "duration": 5},
    {"title": "Reveal the Device", "duration": 5},
    {"title": "Hand and Device", "duration": 5},
    {"title": "Device and Screen", "duration": 5},
    {"title": "Conflicting Records", "duration": 5},
    {"title": "Low-Angle Tension", "duration": 5},
    {"title": "Human at the Center", "duration": 5},
    {"title": "Quiet Processing", "duration": 5},
    {"title": "Catching an Issue", "duration": 5},
    {"title": "Desk Settles", "duration": 5},
    {"title": "Look Up to the Mother", "duration": 5},
    {"title": "Conversation Across Desk", "duration": 5},
    {"title": "New Intake Case", "duration": 5},
    {"title": "Lean In on Sensitive Info", "duration": 5},
    {"title": "Protective Stop", "duration": 5},
    {"title": "Decision Handed Back", "duration": 5},
    {"title": "Show the Whole Intake Area", "duration": 5},
    {"title": "Papers Click Into Place", "duration": 5},
    {"title": "Shared Understanding", "duration": 5},
    {"title": "The Nod", "duration": 5},
    {"title": "Final Confirmation", "duration": 5},
    {"title": "Quiet, Working Desk", "duration": 5},
    {"title": "Device Hero Shot", "duration": 5},
    {"title": "Edge, Not Cloud", "duration": 5},
    {"title": "Hawa at Dusk", "duration": 5},
    {"title": "Final Group", "duration": 5},
    {"title": "Closing Tableau", "duration": 5},
]

def create_project_structure():
    """Create project directories for video assets"""
    base_dir = Path("/Users/kukomo/Documents/Claude/Projects/Globis Edge")

    dirs = [
        base_dir / "VIDEO_ASSETS" / "scenes",
        base_dir / "VIDEO_ASSETS" / "audio",
        base_dir / "VIDEO_ASSETS" / "final_video",
        base_dir / "scripts",
    ]

    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)
        print(f"✓ Created directory: {d}")

    return base_dir

def create_generation_log():
    """Log scene generation details for tracking"""
    log = {
        "project": "Globis Edge 2.0",
        "video_type": "30-scene illustration sequence",
        "total_duration": "3 minutes (180 seconds)",
        "scenes_count": 30,
        "duration_per_scene": 5,
        "style": "Mid-century editorial illustration, handpainted desert aesthetic",
        "palette": {
            "sand": "#E8D7A0",
            "rust": "#A84C3C",
            "sky": "#7FAFCA",
            "teal": "#4A8BA0"
        },
        "generated_at": datetime.now().isoformat(),
        "status": "initialized",
        "scenes": SCENE_METADATA
    }

    return log

def main():
    print("\n" + "="*80)
    print("GLOBIS EDGE 2.0 — VIDEO GENERATION WORKFLOW")
    print("="*80 + "\n")

    # Create project structure
    print("Step 1: Creating project structure...")
    base_dir = create_project_structure()
    print()

    # Generate log
    print("Step 2: Initializing generation log...")
    log = create_generation_log()

    log_path = base_dir / "VIDEO_ASSETS" / "generation_log.json"
    with open(log_path, "w") as f:
        json.dump(log, f, indent=2)
    print(f"✓ Log saved to: {log_path}\n")

    # Print scene list
    print("Step 3: Scene generation plan:")
    print("-" * 80)
    for i, (prompt, meta) in enumerate(zip(SCENE_PROMPTS, SCENE_METADATA), 1):
        print(f"\nScene {i:02d}: {meta['title']} ({meta['duration']}s)")
        print(f"Prompt: {prompt[:100]}...")

    print("\n" + "-" * 80)
    print(f"\nTotal: {len(SCENE_PROMPTS)} scenes")
    print(f"Total duration: {len(SCENE_PROMPTS) * 5} seconds = 3 minutes")
    print(f"Estimated generation time: 2-3 hours (manual via Meta AI)")
    print(f"Scene images directory: {base_dir / 'VIDEO_ASSETS' / 'scenes'}")

    print("\n" + "="*80)
    print("NEXT STEPS:")
    print("="*80)
    print("""
1. Use the scene prompts above to generate images via Meta AI (https://www.meta.ai)
   - Copy each prompt and paste into Meta AI's "Create image" interface
   - Select the best variation and download
   - Save as Scene_[N]_[Title].png to VIDEO_ASSETS/scenes/

2. Once all 30 scenes are downloaded:
   - Use DaVinci Resolve to assemble timeline (5 sec per scene)
   - Add audio tracks (ambient, SFX, music, optional VO)
   - Color grade and finalize
   - Export as H.264 MP4 (1080p, 24fps)

3. Upload final video to YouTube

4. Submit to Kaggle with supporting notebook

For detailed instructions, see:
- START_HERE_VIDEO.md
- VIDEO_GENERATION_WORKFLOW.md
- SCENE_GENERATION_QUICK_REF.md
    """)

    print("="*80 + "\n")

if __name__ == "__main__":
    main()
