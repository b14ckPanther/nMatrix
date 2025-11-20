# Quick Start Guide - Install Node.js First

## 🚨 Current Issue
Node.js and npm are not installed on your system. You need to install them before running the project.

## ✅ Step 1: Install Node.js (Choose ONE method)

### Method A: Official Installer (Easiest - 5 minutes)

1. **Open your web browser** and go to:
   ```
   https://nodejs.org/
   ```

2. **Download the LTS version** (the green button that says "LTS" - this is the recommended stable version)

3. **Run the installer:**
   - Double-click the downloaded `.pkg` file
   - Click "Continue" through the installation wizard
   - Enter your Mac password when prompted
   - Wait for installation to complete

4. **IMPORTANT: Close and reopen Terminal** after installation completes

5. **Verify installation** by running:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers (like `v20.11.0` and `10.2.4`)

### Method B: Homebrew (If you prefer command line)

Run these commands one at a time:
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Restart terminal, then verify
node --version
npm --version
```

## ✅ Step 2: Install Project Dependencies

Once Node.js is installed, run:
```bash
cd /Users/zangeel/Desktop/nmMatrix
npm install
```

This will install all required packages (takes 1-2 minutes).

## ✅ Step 3: Install Functions Dependencies

```bash
cd functions
npm install
cd ..
```

## ✅ Step 4: Run Development Server

```bash
npm run dev
```

The app will start at `http://localhost:3000`

## 🔍 Verification Checklist

Before proceeding, make sure:
- [ ] Node.js is installed (`node --version` works)
- [ ] npm is installed (`npm --version` works)
- [ ] You've restarted Terminal after installing Node.js
- [ ] You're in the project directory (`/Users/zangeel/Desktop/nmMatrix`)

## 🆘 Still Having Issues?

### "command not found: node" after installation

1. **Restart Terminal completely** - Close all terminal windows and open a new one
2. **Check your PATH:**
   ```bash
   echo $PATH
   ```
   Should include `/usr/local/bin`

3. **Try reloading shell:**
   ```bash
   source ~/.zshrc
   ```

### Permission Errors

If you get permission errors with npm:
```bash
sudo chown -R $(whoami) ~/.npm
```

## 📝 What You'll See After Success

When you run `npm run dev`, you should see:
```
✓ Ready in 2.3s
○ Local:        http://localhost:3000
```

Then open http://localhost:3000 in your browser!

---

**Need more help?** See `INSTALL_NODE.md` for detailed installation instructions.
