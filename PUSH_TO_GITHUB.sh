#!/bin/bash

# Push polished Globis Edge repository to GitHub
# Run from repo root: bash PUSH_TO_GITHUB.sh

set -e

echo "📦 Globis Edge — Pushing to GitHub"
echo "===================================="
echo ""

# Check if repo is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Not a git repository. Run this from the repo root."
    exit 1
fi

# Show what's changed
echo "📊 Changes summary:"
echo ""
git status --short | head -20
echo ""

# Get counts
changed=$(git status --short | wc -l)
echo "Total changes: $changed files"
echo ""

# Confirm before proceeding
echo "⚠️  Review changes above. Continue? (y/n)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "📝 Staging changes..."
git add .

echo "✅ Staged all changes"
echo ""

echo "💬 Committing..."
git commit -m "chore: polish repo for Kaggle submission

- Update README with YouTube + Kaggle links
- Add comprehensive Raspberry Pi 5 deployment guide
- Remove 30 internal sprint documentation files
- Organize remaining docs into specialized subdirectories
- Ready for Kaggle Gemma 4 Good Hackathon evaluation"

echo "✅ Committed"
echo ""

echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Pushed to origin/main"
echo ""

echo "===================================="
echo "✨ Repository successfully pushed!"
echo ""
echo "What's next:"
echo "1. Visit: https://github.com/Kukomoo/globis-edge"
echo "2. Verify changes appear on GitHub"
echo "3. Check Kaggle link still works"
echo ""
echo "Optional: Create release tag"
echo "  git tag -a v1.0-kaggle -m 'Globis Edge 2.0 - Kaggle submission'"
echo "  git push origin v1.0-kaggle"
echo ""
