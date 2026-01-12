# GitHub Repository Setup Guide

Your local Git repository is ready! Follow these steps to create a GitHub repository and push your code.

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in the details:
   - **Repository name**: `stem-kiosk` (or your preferred name)
   - **Description**: "Offline-first HTML5 kiosk hub for Raspberry Pi touch displays"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

## Step 2: Connect and Push

After creating the repository, GitHub will show you commands. Use these:

### Option A: If repository is empty (recommended)

```bash
cd E:\stem-kiosk
git remote add origin https://github.com/YOUR_USERNAME/stem-kiosk.git
git branch -M main
git push -u origin main
```

### Option B: If you want to use SSH

```bash
cd E:\stem-kiosk
git remote add origin git@github.com:YOUR_USERNAME/stem-kiosk.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## Step 3: Verify

After pushing, refresh your GitHub repository page. You should see all your files!

## Quick Commands Reference

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull
```

## Troubleshooting

### Authentication Issues

If you get authentication errors:

1. **Use Personal Access Token** (recommended):
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` permissions
   - Use token as password when pushing

2. **Or use GitHub CLI**:
   ```bash
   gh auth login
   ```

### Branch Name

If you get "branch name" errors, your default branch might be `master`:
```bash
git branch -M main
```

### Remote Already Exists

If you need to change the remote URL:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/stem-kiosk.git
```

## Next Steps

After pushing:
- ✅ Add a repository description
- ✅ Add topics/tags (e.g., `kiosk`, `raspberry-pi`, `stem`, `html5`)
- ✅ Consider adding a LICENSE file
- ✅ Set up GitHub Pages if you want to host it
- ✅ Add collaborators if needed

