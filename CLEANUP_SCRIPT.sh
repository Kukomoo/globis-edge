#!/bin/bash

# Globis Edge Repository Cleanup Script
# Removes internal sprint documentation and consolidates project
# Run from repo root: bash CLEANUP_SCRIPT.sh

set -e  # Exit on error

echo "🧹 Globis Edge Cleanup Starting..."
echo "=================================="

# Files to delete (internal sprint documentation)
DELETE_FILES=(
    "PRIORITY_1_COMPLETION_SUMMARY.md"
    "PRIORITY_1_QUICK_REFERENCE.md"
    "PRIORITY_1_TEST_GUIDE.md"
    "PRIORITY_1_VERIFICATION_REPORT.md"
    "PRIORITY_2_1_FASTPATH_EXPLAINER.md"
    "PRIORITY_2_2_OVERRIDE_BUTTONS.md"
    "PRIORITY_2_4_GLOSSARY.md"
    "PRIORITY_2_COMPLETION_REPORT.md"
    "PRIORITY_2_FINAL_REPORT.md"
    "README_PRIORITY_1.md"
    "UI_AUDIT_EXECUTIVE_SUMMARY.txt"
    "UI_BUILD_COMPLETE.md"
    "UI_BUILD_PLAN.md"
    "UI_COMPLIANCE_AUDIT.md"
    "UI_DEPLOYMENT_GUIDE.md"
    "UI_FINAL_SUMMARY.txt"
    "UI_IMPLEMENTATION_STATUS.md"
    "UI_QUICK_START.md"
    "CLEANUP_INSTRUCTIONS.txt"
    "CLEANUP_REPORT.md"
    "SUBMISSION_READINESS.txt"
    "SUBMISSION_SUMMARY.md"
    "MANIFEST.txt"
    "HACKATHON_SUBMISSION_ANALYSIS.md"
    "DELIVERY_CHECKLIST.md"
    "CASEWORKER_CONSOLE_IMPLEMENTATION_SUMMARY.md"
    "QUICK_REFERENCE.md"
)

# Delete internal sprint documentation
echo "📦 Deleting internal sprint documentation..."
for file in "${DELETE_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "  ✓ Deleted $file"
    fi
done

# Move video-specific docs to dedicated folder
echo "📹 Organizing video documentation..."
mkdir -p docs/video-production
mv -f CHROME_BATCH_GENERATION_GUIDE.md docs/video-production/ 2>/dev/null || true
mv -f README_VIDEO_PRODUCTION.md docs/video-production/ 2>/dev/null || true
mv -f VIDEO_GENERATION_WORKFLOW.md docs/video-production/ 2>/dev/null || true
mv -f VIDEO_BRIEF_FOR_JUDGES.md docs/video-production/ 2>/dev/null || true
mv -f SCENE_GENERATION_QUICK_REF.md docs/video-production/ 2>/dev/null || true
mv -f SCENE_GENERATION_WORKFLOW.md docs/video-production/ 2>/dev/null || true
mv -f REMOTION_EXECUTION_COMPLETE.md docs/video-production/ 2>/dev/null || true
mv -f REMOTION_READY.txt docs/video-production/ 2>/dev/null || true
mv -f remotion-setup.md docs/video-production/ 2>/dev/null || true
mv -f GLOBIS_EDGE_VIDEO_PROMPT.md docs/video-production/ 2>/dev/null || true
mv -f START_HERE_VIDEO.md docs/video-production/ 2>/dev/null || true
echo "  ✓ Video docs organized to docs/video-production/"

# Move deployment-specific docs
echo "🚀 Organizing deployment documentation..."
mkdir -p docs/deployment
mv -f HOTSPOT_SETUP.md docs/deployment/ 2>/dev/null || true
echo "  ✓ Deployment docs organized to docs/deployment/"

# Move internal architecture docs
echo "🏛️  Organizing architecture documentation..."
mkdir -p docs/architecture
mv -f AGENTS.md docs/architecture/ 2>/dev/null || true
echo "  ✓ Architecture docs organized to docs/architecture/"

# Verify core files still exist
echo "✅ Verifying core documentation..."
CORE_FILES=(
    "README.md"
    "PRD.md"
    "INVARIANTS.md"
    "ETHICS.md"
    "CONSTITUTION.md"
    "FINAL_AUDIT.md"
    "CLAUDE.md"
    "LICENSE"
)

for file in "${CORE_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "  ⚠️  WARNING: Missing critical file: $file"
    else
        echo "  ✓ $file present"
    fi
done

# Count remaining docs
echo ""
echo "📊 Root-level documentation count:"
doc_count=$(ls -1 *.md *.txt 2>/dev/null | wc -l)
echo "   Before: ~45 files"
echo "   After:  ~$doc_count files"
echo ""

echo "=================================="
echo "✨ Cleanup complete!"
echo ""
echo "Remaining root-level docs:"
ls -1 *.md *.txt 2>/dev/null | sort
echo ""
echo "Next steps:"
echo "1. Review removed files (use git to restore if needed)"
echo "2. Test build: npm run build in globis-edge-ui/"
echo "3. Verify README links work"
echo "4. Push cleanup to GitHub"
echo ""
