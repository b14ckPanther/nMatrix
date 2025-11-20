const fs = require('fs');
const path = require('path');

// If lib/functions/src exists, move its contents to lib
const sourcePath = path.join(__dirname, 'lib', 'functions', 'src');
const targetPath = path.join(__dirname, 'lib');

if (fs.existsSync(sourcePath)) {
  // Move all files from lib/functions/src to lib
  const files = fs.readdirSync(sourcePath);
  files.forEach(file => {
    const srcFile = path.join(sourcePath, file);
    const destFile = path.join(targetPath, file);
    if (fs.statSync(srcFile).isDirectory()) {
      if (fs.existsSync(destFile)) {
        fs.rmSync(destFile, { recursive: true, force: true });
      }
      fs.renameSync(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
      fs.unlinkSync(srcFile);
    }
  });
  // Remove empty directories
  try {
    fs.rmSync(path.join(__dirname, 'lib', 'functions'), { recursive: true, force: true });
  } catch (e) {
    // Ignore errors
  }
}
