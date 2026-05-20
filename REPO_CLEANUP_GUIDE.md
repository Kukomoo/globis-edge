# Globis Edge Repository Cleanup Guide

**Date:** May 20, 2026  
**Purpose:** Prepare repo for final Kaggle submission by removing internal documentation, fixing author names, and ensuring proper git tracking

---

## Overview

Your GitHub repository currently contains several files that are:
1. **Internal only** (development guides, submission checklists, audit docs)
2. **Misattributed** (author names, version numbering)
3. **Improperly tracked** (should be local-only, not in git)

This guide walks through the cleanup process.

---

## Files to Handle

### Files to DELETE (Completely Remove)

These are internal submission checklists/status files. They have no place in a public repo.

**Files:**
- `FINAL_SUBMISSION_STATUS.md` — Internal status tracker for submission prep
- `SUBMISSION_CHECKLIST.md` — Internal development checklist

**Action:** Delete entirely (both from disk and git)

**Why:** These are process artifacts, not product documentation. Judges don't need to see them.

---

### Files to UNTRACK (Keep Locally, Remove from Git)

These are useful for YOU locally but shouldn't be in the public repository.

**Files:**
- `CLAUDE.md` — AI assistant instructions (project-specific, not for judges)
- `INVARIANTS.md` — Internal hardening checklist (duplicates info in INVARIANTS.md-equivalent sections of README/ETHICS)

**Action:** Remove from git tracking (`git rm --cached`), but keep on your local machine

**Why:** These document your development process, not the product. Judges see INVARIANTS concepts in your code, not a separate doc. CLAUDE.md is meta (Claude instructions).

**How to untrack without deleting:**
```bash
git rm --cached CLAUDE.md
git rm --cached INVARIANTS.md
# Add to .gitignore to prevent re-tracking
echo "CLAUDE.md" >> .gitignore
echo "INVARIANTS.md" >> .gitignore
```

---

### Files to EDIT (Fix Content)

These stay in the repo but need corrections.

#### 1. **FINAL_AUDIT.md** — Change Author

**Current:**
```markdown
**Author:** Nadu Khas
```

**Change to:**
```markdown
**Author:** Nada Khas
```

**Why:** Your name is Nada, not Nadu. This is in git history already, so fix it forward.

**Command:**
```bash
sed -i '' 's/Nadu/Nada/g' FINAL_AUDIT.md
```

---

#### 2. **ETHICS.md** — Change Title

**Current:**
```markdown
# Data Ethics & Responsible AI Statement

**Globis Edge 2.0 — Gemma 4 Good Hackathon Submission**
```

**Change to:**
```markdown
# Data Ethics & Responsible AI Statement

**Globis Edge — Gemma 4 Good Hackathon Submission**
```

**Why:** You're submitting as "Globis Edge", not "Globis Edge 2.0". Consistency across all docs.

**Command:**
```bash
sed -i '' 's/Globis Edge 2\.0/Globis Edge/g' ETHICS.md
```

---

#### 3. **pyproject.toml** — Change Author

**Current:**
```toml
authors = [{ name = "Nadu Khas" }]
```

**Change to:**
```toml
authors = [{ name = "Nada Khas" }]
```

**Why:** Correct your name in package metadata.

**Command:**
```bash
sed -i '' 's/"Nadu"/"Nada"/g' pyproject.toml
```

---

### What About .gitignore?

**Question:** Why is `.gitignore` tracked in git?

**Answer:** `.gitignore` SHOULD be tracked. It's part of your repo configuration. Everyone who clones your repo needs the same ignore patterns.

**Current status:** ✅ Correct — keep it tracked.

---

## Step-by-Step Execution

### Option A: Run the Automated Script (Recommended)

```bash
cd /Users/kukomo/Documents/Claude/Projects/Globis\ Edge
bash CLEANUP_SCRIPT.sh
```

This script:
1. Fixes author names (Nadu → Nada)
2. Fixes titles (Globis Edge 2.0 → Globis Edge)
3. Deletes FINAL_SUBMISSION_STATUS.md and SUBMISSION_CHECKLIST.md
4. Untracks CLAUDE.md and INVARIANTS.md
5. Updates .gitignore
6. Shows git status

### Option B: Manual Steps

If you prefer to do it manually:

```bash
# 1. Fix author names
sed -i '' 's/Nadu/Nada/g' FINAL_AUDIT.md
sed -i '' 's/"Nadu"/"Nada"/g' pyproject.toml

# 2. Fix titles
sed -i '' 's/Globis Edge 2\.0/Globis Edge/g' ETHICS.md

# 3. Delete files
rm FINAL_SUBMISSION_STATUS.md SUBMISSION_CHECKLIST.md
git rm --cached FINAL_SUBMISSION_STATUS.md SUBMISSION_CHECKLIST.md

# 4. Untrack files
git rm --cached CLAUDE.md INVARIANTS.md

# 5. Update .gitignore
echo "CLAUDE.md" >> .gitignore
echo "INVARIANTS.md" >> .gitignore

# 6. Review
git status --short

# 7. Commit
git commit -m "refactor: clean up internal docs and fix author names"

# 8. Push
git push origin main
```

---

## Verification Checklist

After cleanup, verify:

- [ ] FINAL_SUBMISSION_STATUS.md is deleted
- [ ] SUBMISSION_CHECKLIST.md is deleted
- [ ] CLAUDE.md exists locally but not in git (`git ls-files | grep CLAUDE.md` returns nothing)
- [ ] INVARIANTS.md exists locally but not in git (`git ls-files | grep INVARIANTS.md` returns nothing)
- [ ] FINAL_AUDIT.md shows "Author: Nada Khas"
- [ ] pyproject.toml shows `authors = [{ name = "Nada Khas" }]`
- [ ] ETHICS.md shows "Globis Edge —" (not "Globis Edge 2.0")
- [ ] .gitignore contains entries for CLAUDE.md and INVARIANTS.md
- [ ] `git status --short` shows only the expected changes

---

## Git Log After Cleanup

After pushing, your commit should show:

```
commit <hash>
refactor: clean up internal docs and fix author names

 FINAL_SUBMISSION_STATUS.md         | <deleted>
 SUBMISSION_CHECKLIST.md            | <deleted>
 CLAUDE.md                          | <deleted>
 INVARIANTS.md                      | <deleted>
 FINAL_AUDIT.md                     | 2 +-
 pyproject.toml                     | 2 +-
 ETHICS.md                          | 2 +-
 .gitignore                         | 2 ++
```

---

## Why This Matters for Judges

**Before cleanup:** Repository contains internal process docs, inconsistent naming, tracking errors
- Looks unprofessional
- Confuses the submission story
- Signals incomplete final review

**After cleanup:** Repository is clean, consistent, and focused
- Professional appearance
- Clear submission narrative
- Shows attention to detail

Judges spend ~3 minutes on your repo. A clean repo says: "This person ships production work, not experiments."

---

## What Stays in the Repo

✅ **Keep and Track:**
- README.md (public-facing)
- KAGGLE_WRITEUP.md (proof of work)
- ETHICS.md (responsible AI statement)
- CONSTITUTION.md (auditor rules — public transparency)
- FINAL_AUDIT.md (technical verification trail)
- pyproject.toml (package metadata)
- src/ (all source code)
- tests/ (all tests)
- deployment/ (deployment configs)
- globis-edge-ui/ (React frontend)
- synthetic_cases/ (demo data)
- .gitignore (git configuration)

✅ **Keep Locally Only:**
- CLAUDE.md (added to .gitignore)
- INVARIANTS.md (added to .gitignore)
- Any .env files (should already be in .gitignore)

❌ **Delete Entirely:**
- FINAL_SUBMISSION_STATUS.md
- SUBMISSION_CHECKLIST.md

---

## When to Run This

**Before final submission** (today or tomorrow):

1. Run cleanup script
2. Verify all changes
3. Test that repo still builds/tests pass
4. Push to GitHub
5. Verify links in Kaggle submission still work (they should — internal files don't have external links)

---

## Questions?

If anything fails:
- Make sure you're in the repo root: `pwd` should show `.../Globis Edge`
- Verify git is initialized: `git status` should work
- Check file existence: `ls CLAUDE.md` before untracking

For sed (find/replace) issues on Mac:
- The `-i ''` syntax is macOS-specific
- If it fails, use: `sed -i.bak 's/old/new/g' filename` (creates .bak backup)

---

**Status:** Ready to execute  
**Time estimate:** 5 minutes (automated script) or 15 minutes (manual)  
**Risk level:** Low — all changes are reversible via git history
