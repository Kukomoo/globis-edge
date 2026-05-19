#!/bin/bash

# Safe cleanup script for Globis Edge repository
# Removes:
#   1. All agent-related .md files (AGENTS.md, agent configs)
#   2. All video-generation process docs (docs/video-production/*, video/*)
#
# PRESERVES (intentionally kept):
#   - All core files (README, PRD, INVARIANTS, ETHICS, CONSTITUTION, FINAL_AUDIT, CLAUDE)
#   - All blueprint docs (docs/blueprint/* - these are architecture, not process)
#   - All source code and tests
#   - All deployment guides
#   - archive/ folder (historical reference)

set -e

echo "🧹 Safe Cleanup: Removing agent docs and video-generation process files"
echo "======================================================================="
echo ""

# Verify we're in the right directory
if [ ! -f "README.md" ] || [ ! -f "PRD.md" ]; then
    echo "❌ Error: Not in Globis Edge root directory (README.md or PRD.md not found)"
    exit 1
fi

echo "📋 Files to DELETE:"
echo ""

# 1. Agent-related files
echo "Agent-related files:"
agent_files=(
    "docs/architecture/AGENTS.md"
    "POLISHING_COMPLETE.md"
    "SUBMISSION_COMPLETE.md"
    "📌_START_HERE.md"
)

for file in "${agent_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  - $file"
    fi
done

echo ""
echo "Video-generation process files (keeping finished video is OK, removing generation guides):"
video_files=(
    "docs/video-production/CHROME_BATCH_GENERATION_GUIDE.md"
    "docs/video-production/GLOBIS_EDGE_VIDEO_PROMPT.md"
    "docs/video-production/README_VIDEO_PRODUCTION.md"
    "docs/video-production/REMOTION_EXECUTION_COMPLETE.md"
    "docs/video-production/REMOTION_READY.txt"
    "docs/video-production/SCENE_GENERATION_QUICK_REF.md"
    "docs/video-production/SCENE_GENERATION_WORKFLOW.md"
    "docs/video-production/START_HERE_VIDEO.md"
    "docs/video-production/VIDEO_BRIEF_FOR_JUDGES.md"
    "docs/video-production/VIDEO_GENERATION_WORKFLOW.md"
    "docs/video-production/remotion-setup.md"
)

for file in "${video_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  - $file"
    fi
done

# Entire video/ folder
if [ -d "video" ]; then
    echo "  - video/ (entire folder - demo script, assembly plan, etc.)"
fi

echo ""
echo "📋 Files to KEEP (core project files):"
keep_files=(
    "README.md"
    "PRD.md"
    "INVARIANTS.md"
    "ETHICS.md"
    "CONSTITUTION.md"
    "FINAL_AUDIT.md"
    "CLAUDE.md"
)

for file in "${keep_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    fi
done

echo ""
echo "📋 Directories to KEEP:"
echo "  ✓ src/ (all source code)"
echo "  ✓ tests/ (all tests)"
echo "  ✓ globis-edge-ui/ (React frontend)"
echo "  ✓ globis-edge-video/ (video app - keep, this is code not process)"
echo "  ✓ deployment/ (Pi5 deployment configs)"
echo "  ✓ docs/blueprint/ (architecture docs - keep)"
echo "  ✓ docs/deployment/ (keep)"
echo "  ✓ archive/ (historical reference)"
echo "  ✓ prompts/ (keep)"

echo ""
echo "======================================================================="
echo "⚠️  Review above. Continue with deletion? (type 'yes' to confirm)"
read -r response

if [ "$response" != "yes" ]; then
    echo "❌ Aborted."
    exit 1
fi

echo ""
echo "🔄 Deleting files..."

# Delete agent files
for file in "${agent_files[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "  ✓ Deleted $file"
    fi
done

# Delete video-generation process files
for file in "${video_files[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "  ✓ Deleted $file"
    fi
done

# Delete video/ folder entirely
if [ -d "video" ]; then
    rm -rf "video"
    echo "  ✓ Deleted video/ folder"
fi

# Clean up empty docs/video-production/ folder if it exists and is empty
if [ -d "docs/video-production" ] && [ -z "$(ls -A docs/video-production)" ]; then
    rmdir "docs/video-production"
    echo "  ✓ Removed empty docs/video-production/ directory"
fi

echo ""
echo "✅ Verification - core files still present:"
all_present=true
for file in "${keep_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ MISSING: $file"
        all_present=false
    fi
done

if [ "$all_present" = false ]; then
    echo ""
    echo "❌ ERROR: Some core files are missing! This should not happen."
    exit 1
fi

echo ""
echo "======================================================================="
echo "✨ Cleanup complete!"
echo ""
echo "Summary:"
deleted_count=$((${#agent_files[@]} + ${#video_files[@]} + 1))
echo "  - Deleted $deleted_count files/folders (agent + video-generation process docs)"
echo "  - Kept all 7 core files"
echo "  - Kept all source code, tests, deployments"
echo ""
echo "📊 Repository is now concise and focused:"
echo "  - No agent-related documentation"
echo "  - No video-generation process guides"
echo "  - Only essential project files remain"
echo ""
echo "Next: git add . && git commit -m 'chore: remove agent docs and video-generation guides'"
echo ""
