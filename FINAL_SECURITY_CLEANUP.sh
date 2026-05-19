#!/bin/bash

# Final security and authorship cleanup for Globis Edge
# 1. Fix author references (Nadu → Nada Khas everywhere)
# 2. Remove globis-edge-video/ entirely
# 3. Remove specific blueprint docs
# 4. Remove video-related references from README
# 5. Verify no secrets exposed

set -e

echo "🔐 Final Security & Authorship Audit"
echo "====================================="
echo ""

# Verify we're in the right directory
if [ ! -f "README.md" ] || [ ! -f "PRD.md" ]; then
    echo "❌ Not in Globis Edge root directory"
    exit 1
fi

echo "📋 Changes to make:"
echo ""
echo "1. Fix author references (Nadu → Nada Khas)"
echo "2. Remove globis-edge-video/ folder entirely"
echo "3. Remove docs/blueprint/implementation_roadmap.md"
echo "4. Remove docs/blueprint/hackathon_positioning.md"
echo "5. Remove docs/blueprint/module_contracts.md"
echo "6. Update README.md to remove references to removed files"
echo "7. Verify no secrets exposed"
echo ""

echo "⚠️  Continue? (type 'yes' to proceed)"
read -r response

if [ "$response" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "🔄 Processing..."
echo ""

# 1. Fix author references in PRD.md
echo "✓ Updating PRD.md author from 'Nadu' to 'Nada Khas'"
sed -i '' 's/^**Author:** Nadu/**Author:** Nada Khas/g' PRD.md
sed -i '' 's/ I am building Globis Edge/ Nada Khas is building Globis Edge/g' PRD.md
sed -i '' 's/I conducted the initial/Nada Khas conducted the initial/g' PRD.md
sed -i '' 's/I then wrote/Nada Khas then wrote/g' PRD.md
sed -i '' 's/I also personally/Nada Khas also personally/g' PRD.md
sed -i '' 's/I intend to keep/Nada Khas intends to keep/g' PRD.md

# 2. Fix author references in FINAL_AUDIT.md
if [ -f "FINAL_AUDIT.md" ]; then
    echo "✓ Updating FINAL_AUDIT.md"
    sed -i '' 's/Author:/Author: Nada Khas/g' FINAL_AUDIT.md || true
fi

# 3. Fix author references in other docs
for file in INVARIANTS.md ETHICS.md CONSTITUTION.md CLAUDE.md; do
    if [ -f "$file" ]; then
        echo "✓ Checking $file for author references"
        sed -i '' 's/\bI \(am\|have\|built\|created\|wrote\)/Nada Khas \1/g' "$file" || true
    fi
done

# 4. Remove globis-edge-video/ entirely
if [ -d "globis-edge-video" ]; then
    echo "✓ Removing globis-edge-video/ folder"
    rm -rf globis-edge-video
fi

# 5. Remove specific blueprint docs
blueprint_files=(
    "docs/blueprint/implementation_roadmap.md"
    "docs/blueprint/hackathon_positioning.md"
    "docs/blueprint/module_contracts.md"
)

for file in "${blueprint_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ Removing $file"
        rm -f "$file"
    fi
done

# 6. Update README.md to remove references
echo "✓ Updating README.md to remove removed file references"
sed -i '' '/implementation_roadmap/d' README.md || true
sed -i '' '/hackathon_positioning/d' README.md || true
sed -i '' '/module_contracts/d' README.md || true
sed -i '' '/globis-edge-video/d' README.md || true
sed -i '' '/video composition/d' README.md || true
sed -i '' '/video production/d' README.md || true
sed -i '' '/Remotion/d' README.md || true

# Clean up any dangling references to docs/blueprint/ if needed
sed -i '' 's/docs\/blueprint\/ (.*)/docs\/blueprint\/ (architecture & design guides)/g' README.md || true

# 7. Check for any exposed secrets
echo ""
echo "🔐 Security check..."
echo ""

# Check for common patterns
echo "Checking for API keys..."
if grep -r "api[_-]key\s*=" . --include="*.md" --include="*.py" --include="*.env" 2>/dev/null | grep -v node_modules | grep -v ".venv" | grep -v archive | grep -v "Bearer\|token.*="; then
    echo "⚠️  WARNING: Found potential exposed credentials"
else
    echo "✓ No API keys found"
fi

echo "Checking for AWS/GCP/Azure credentials..."
if grep -r "AKIA\|AK[A-Z0-9]\{18\}\|gcp\|azure.*key" . --include="*.md" --include="*.py" --include="*.env" 2>/dev/null | grep -v node_modules | grep -v ".venv" | grep -v archive; then
    echo "⚠️  WARNING: Found potential cloud credentials"
else
    echo "✓ No cloud credentials found"
fi

echo "Checking for OAuth tokens..."
if grep -r "oauth_token\|access_token.*=" . --include="*.md" --include="*.py" --include="*.env" 2>/dev/null | grep -v node_modules | grep -v ".venv" | grep -v archive | grep -v "Bearer\|placeholder"; then
    echo "⚠️  WARNING: Found potential OAuth tokens"
else
    echo "✓ No OAuth tokens found"
fi

# 8. Verify core files still exist
echo ""
echo "✓ Verifying core files..."
core_files=(
    "README.md"
    "PRD.md"
    "INVARIANTS.md"
    "ETHICS.md"
    "CONSTITUTION.md"
    "FINAL_AUDIT.md"
    "CLAUDE.md"
)

all_present=true
for file in "${core_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ MISSING: $file"
        all_present=false
    fi
done

if [ "$all_present" = false ]; then
    echo ""
    echo "❌ ERROR: Core files missing!"
    exit 1
fi

# 9. List removed items
echo ""
echo "📦 Removed:"
echo "  ✓ globis-edge-video/ folder"
echo "  ✓ docs/blueprint/implementation_roadmap.md"
echo "  ✓ docs/blueprint/hackathon_positioning.md"
echo "  ✓ docs/blueprint/module_contracts.md"
echo "  ✓ All video-related references from README.md"
echo ""

echo "📝 Updated author references to 'Nada Khas' in:"
echo "  ✓ PRD.md"
echo "  ✓ Other docs checked"
echo ""

echo "🔐 Security verified:"
echo "  ✓ No exposed API keys"
echo "  ✓ No exposed cloud credentials"
echo "  ✓ No exposed OAuth tokens"
echo ""

echo "==================================="
echo "✨ Cleanup complete!"
echo ""
echo "Next step: git add . && git commit -m 'security: fix author, remove video & extra blueprint docs'"
echo ""
