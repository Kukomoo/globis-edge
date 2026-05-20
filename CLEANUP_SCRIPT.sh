#!/bin/bash

# Globis Edge Repository Cleanup Script
# This script cleans up internal documentation, fixes author names, and untrracks files
# Run this from the repository root: bash CLEANUP_SCRIPT.sh

set -e  # Exit on any error

echo "🧹 Globis Edge Repository Cleanup"
echo "=================================="
echo ""

REPO_ROOT="$(pwd)"
echo "Working in: $REPO_ROOT"
echo ""

# ============================================================================
# STEP 1: Fix Author Names (Nadu → Nada)
# ============================================================================

echo "✏️  Step 1: Fixing author names (Nadu → Nada)"
echo ""

# Fix FINAL_AUDIT.md
if [ -f "FINAL_AUDIT.md" ]; then
    echo "  - Updating FINAL_AUDIT.md..."
    sed -i '' 's/**Author:** Nadu/**Author:** Nada/g' FINAL_AUDIT.md
    sed -i '' 's/Author: Nadu/Author: Nada/g' FINAL_AUDIT.md
    echo "    ✓ FINAL_AUDIT.md fixed"
fi

# Fix pyproject.toml
if [ -f "pyproject.toml" ]; then
    echo "  - Updating pyproject.toml..."
    sed -i '' 's/name = "Nadu"/name = "Nada"/g' pyproject.toml
    sed -i '' 's/"Nadu"/"Nada"/g' pyproject.toml
    echo "    ✓ pyproject.toml fixed"
fi

echo ""

# ============================================================================
# STEP 2: Fix Title Names (Globis Edge 2.0 → Globis Edge)
# ============================================================================

echo "✏️  Step 2: Fixing titles (Globis Edge 2.0 → Globis Edge)"
echo ""

# Fix ETHICS.md
if [ -f "ETHICS.md" ]; then
    echo "  - Updating ETHICS.md..."
    sed -i '' 's/Globis Edge 2\.0/Globis Edge/g' ETHICS.md
    echo "    ✓ ETHICS.md fixed"
fi

echo ""

# ============================================================================
# STEP 3: Delete Files That Shouldn't Exist in Public Repo
# ============================================================================

echo "🗑️  Step 3: Deleting internal documentation files"
echo ""

FILES_TO_DELETE=(
    "FINAL_SUBMISSION_STATUS.md"
    "SUBMISSION_CHECKLIST.md"
)

for file in "${FILES_TO_DELETE[@]}"; do
    if [ -f "$file" ]; then
        echo "  - Removing $file..."
        rm -f "$file"
        git rm --cached "$file" 2>/dev/null || true
        echo "    ✓ Deleted and untracked"
    fi
done

echo ""

# ============================================================================
# STEP 4: Untrack Files (Keep Locally, Not in Git)
# ============================================================================

echo "🔒 Step 4: Untracking files (keep locally, remove from git)"
echo ""

FILES_TO_UNTRACK=(
    "CLAUDE.md"
    "INVARIANTS.md"
)

for file in "${FILES_TO_UNTRACK[@]}"; do
    if [ -f "$file" ]; then
        echo "  - Untracking $file..."
        git rm --cached "$file" 2>/dev/null || true
        echo "    ✓ Untracked (file preserved locally)"
    fi
done

echo ""

# ============================================================================
# STEP 5: Verify .gitignore Is Updated
# ============================================================================

echo "✅ Step 5: Verifying .gitignore configuration"
echo ""

# Add entries to .gitignore for untracked files
if [ -f ".gitignore" ]; then
    echo "  - Checking .gitignore..."

    # Add CLAUDE.md if not present
    if ! grep -q "^CLAUDE.md$" .gitignore; then
        echo "CLAUDE.md" >> .gitignore
        echo "    ✓ Added CLAUDE.md to .gitignore"
    fi

    # Add INVARIANTS.md if not present
    if ! grep -q "^INVARIANTS.md$" .gitignore; then
        echo "INVARIANTS.md" >> .gitignore
        echo "    ✓ Added INVARIANTS.md to .gitignore"
    fi

    echo "  - .gitignore verified"
fi

echo ""

# ============================================================================
# STEP 6: Summary and Commit
# ============================================================================

echo "📊 Step 6: Summary"
echo ""

echo "Changes made:"
echo "  ✓ Fixed author names: Nadu → Nada (FINAL_AUDIT.md, pyproject.toml)"
echo "  ✓ Fixed titles: 'Globis Edge 2.0' → 'Globis Edge' (ETHICS.md)"
echo "  ✓ Deleted: FINAL_SUBMISSION_STATUS.md, SUBMISSION_CHECKLIST.md"
echo "  ✓ Untracked: CLAUDE.md, INVARIANTS.md (kept locally)"
echo "  ✓ Updated .gitignore"
echo ""

# Show git status
echo "Git status after cleanup:"
git status --short

echo ""
echo "📝 Next steps:"
echo "  1. Review changes: git diff HEAD"
echo "  2. Commit: git commit -m 'refactor: clean up internal docs and fix author names'"
echo "  3. Push: git push origin main"
echo ""

echo "✅ Cleanup complete!"
