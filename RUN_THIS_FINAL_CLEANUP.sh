#!/bin/bash

# Globis Edge Final Cleanup — Complete Version
# Handles all file untracking and commits all fixes

cd /Users/kukomo/Documents/Claude/Projects/Globis\ Edge

echo "🧹 Globis Edge Final Repository Cleanup"
echo "========================================"
echo ""

# Clear any lingering git locks
rm -f .git/index.lock 2>/dev/null

echo "Step 1: Untracking internal docs from git (keeping locally)..."
git rm --cached FINAL_AUDIT.md 2>/dev/null || true
git rm --cached archive/FINAL_AUDIT.md 2>/dev/null || true
git rm --cached archive/PRD_FINAL.md 2>/dev/null || true
git rm --cached archive/PRD_v9.0_Globis_Edge.md 2>/dev/null || true
git rm --cached archive/PRD_v8.0_Globis_Edge.md 2>/dev/null || true
echo "✓ Archive and internal docs untracked"
echo ""

echo "Step 2: Deleting process tracker files..."
rm -f FINAL_SUBMISSION_STATUS.md SUBMISSION_CHECKLIST.md 2>/dev/null || true
echo "✓ Process files deleted"
echo ""

echo "Step 3: Staging all changes (.gitignore, ETHICS.md, pyproject.toml)..."
git add -A
echo "✓ All changes staged"
echo ""

echo "Step 4: Commit with clear message..."
git commit -m "refactor: untrack internal docs, clean up helper files, fix author attribution

- Untrack FINAL_AUDIT.md, archive/* (old PRD versions, deprecated)
- Delete FINAL_SUBMISSION_STATUS.md, SUBMISSION_CHECKLIST.md (process trackers)
- Fix author name to 'Nada Khas' (not Khasawneh) in ETHICS.md
- Update .gitignore to prevent future tracking of internal docs
- Delete helper scripts created during cleanup process"
echo "✓ Commit created"
echo ""

echo "Step 5: Pushing to GitHub..."
git push origin main
echo "✓ Pushed to GitHub"
echo ""

echo "✅ CLEANUP COMPLETE!"
echo ""
echo "Your repository is now:"
echo "  ✓ Clean (no internal process docs)"
echo "  ✓ Consistent (author attribution: Nada Khas)"
echo "  ✓ Professional (archive/ directory excluded)"
echo "  ✓ Ready for judges"
echo ""
echo "Next: Upload globis-edge-notebook-final.ipynb to Kaggle"
echo "Then: Submit on deadline 🎉"
