# 30-Scene Video Assembly Plan

This repo already has a 30-scene continuity guide in [FRONTLINE_DESK_VISUAL_SEQUENCE.md](/Users/kukomo/Documents/Claude/Projects/Globis%20Edge/video/FRONTLINE_DESK_VISUAL_SEQUENCE.md). The local assembly path below is intentionally minimal and only depends on `ffmpeg` and `ffprobe`, both of which are available on this machine.

## Expected clip layout

- Put rendered scene clips in `/Users/kukomo/Documents/Claude/Projects/Globis Edge/video/sequence_assets/clips/`
- Use lexical scene names so the sort order matches the story order:
  - `scene01.mp4`
  - `scene02.mp4`
  - `...`
  - `scene30.mp4`
- The assembler expects exactly 30 clips

## Continuity-friendly defaults

- Normalise every clip to `1920x1080`, `24 fps`, `yuv420p`
- Use `libx264` with `CRF 18` for a clean master that still stays practical to iterate on
- Apply a gentle `0.35s` `xfade=fade` between scenes to reduce visible hard cuts while preserving the handoff between clips
- Add a silent stereo AAC track so the export behaves well in players and editors even before narration or score is added

These settings favor smooth scene-to-scene motion and predictable output over aggressive compression.

## Command

```bash
bash /Users/kukomo/Documents/Claude/Projects/Globis\ Edge/video/assemble_30_scene_video.sh
```

## Dry run

Use this first to validate file count, sort order, and the generated filter graph without rendering:

```bash
bash /Users/kukomo/Documents/Claude/Projects/Globis\ Edge/video/assemble_30_scene_video.sh --dry-run
```

## Output

- Final MP4:
  `/Users/kukomo/Documents/Claude/Projects/Globis Edge/video/sequence_assets/output/globis_edge_30_scene_assembly.mp4`

## Safest fallback if clip quality varies

If some generated clips arrive with inconsistent frame sizes, frame rates, or container formats, keep using the same script. It normalises each source clip before the crossfade stage, which is the safest local path short of moving into a full NLE workflow.
