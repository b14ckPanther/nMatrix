# Installing Node.js on macOS

You need Node.js 18+ and npm to run nmMatrix. Here are several ways to install it:

## Option 1: Download from nodejs.org (Easiest)

1. **Visit the official Node.js website:**
   - Go to: https://nodejs.org/
   - Download the **LTS version** (recommended) for macOS
   - Choose the `.pkg` installer for macOS

2. **Run the installer:**
   - Double-click the downloaded `.pkg` file
   - Follow the installation wizard
   - Enter your password when prompted

3. **Verify installation:**
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers (e.g., `v20.x.x` and `10.x.x`)

## Option 2: Using Homebrew (If you have it installed)

1. **Install Homebrew** (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
   Follow the prompts and enter your password when asked.

2. **Install Node.js:**
   ```bash
   brew install node
   ```

3. **Verify installation:**
   ```bash
   node --version
   npm --version
   ```

## Option 3: Using nvm (Node Version Manager) - Recommended for developers

1. **Install nvm:**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. **Reload your shell:**
   ```bash
   source ~/.zshrc
   ```

3. **Install Node.js LTS:**
   ```bash
   nvm install --lts
   nvm use --lts
   ```

4. **Verify installation:**
   ```bash
   node --version
   npm --version
   ```

## After Installation

Once Node.js is installed, navigate back to the project directory and run:

```bash
cd /Users/zangeel/Desktop/nmMatrix
npm install
```

This will install all the project dependencies.

## Troubleshooting

### If `npm` command still not found after installation:

1. **Restart your terminal** - Close and reopen Terminal.app
2. **Check PATH**: 
   ```bash
   echo $PATH
   ```
   Should include paths like `/usr/local/bin` or `~/.nvm/versions/node/...`

3. **Reload shell configuration:**
   ```bash
   source ~/.zshrc
   ```

### If you get permission errors:

You may need to fix npm permissions:
```bash
sudo chown -R $(whoami) ~/.npm
```

## Recommended: Option 1 (Official Installer)

For most users, **Option 1** (downloading from nodejs.org) is the simplest and most reliable method.

---

**Note**: nmMatrix requires Node.js 18 or higher. Make sure your installed version meets this requirement.
