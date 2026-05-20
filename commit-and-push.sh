#!/bin/bash

# Git commit and push script for Globis Edge
# Run this from your Mac terminal

cd "/Users/kukomo/Documents/Claude/Projects/Globis Edge"

echo "🧹 Clearing git locks..."
rm -f .git/HEAD.lock .git/index.lock
sleep 2

echo "📝 Checking git status..."
git status --short

echo "➕ Staging files..."
git add README.md KEY_LINKS.md .gitignore

echo "💾 Committing changes..."
git commit -m "docs: refine judge navigation and clean up internal documentation

- Add prominent 'Quick Start for Judges' section to README.md with Proof of Work first
- Update KEY_LINKS.md to prioritize Proof of Work in Quick Judge Flow
- Add Proof of Work link to Kaggle Competition section in KEY_LINKS.md
- Remove Landing Page - Proof of Work reference (not implemented)
- Remove references to internal guides (LANDING_PAGE_INTEGRATION_GUIDE.md, FINAL_SUBMISSION_STATUS.md, SUBMISSION_CHECKLIST.md)
- Add these files to .gitignore (internal documentation, not for public repo)
- Judges now see Proof of Work (1,498-word writeup) as primary entry point"

echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Done!"
