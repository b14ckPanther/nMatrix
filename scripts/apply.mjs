import fs from 'fs';
import path from 'path';
import readline from 'readline';

const SRC_DIR = 'app';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const getLatestModification = (directory) => {
  const files = fs.readdirSync(directory)
    // FIX: Removed the incorrect hyphen from the regex
    .filter(file => file.match(/^page\.v.*\.js$/)) 
    .map(file => ({
      file,
      time: fs.statSync(path.join(directory, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);
  
  return files.length > 0 ? path.join(directory, files[0].file) : null;
};

async function applyModification() {
  console.log('Starting the Approval & Application process...');

  const modificationPath = getLatestModification(SRC_DIR);
  if (!modificationPath) {
    console.log('🟡 No modification proposals found. Run `npm run modify` first.');
    rl.close();
    return;
  }
  
  const originalPath = path.join(SRC_DIR, 'page.js');
  console.log(`Found modification proposal: ${modificationPath}`);
  console.log(`This will overwrite: ${originalPath}`);

  rl.question('Do you approve and want to apply this change? (y/n): ', (answer) => {
    if (answer.toLowerCase() !== 'y') {
      console.log('❌ Modification rejected. No changes were made.');
      rl.close();
      return;
    }

    try {
      const backupPath = `${originalPath}.bak`;
      fs.copyFileSync(originalPath, backupPath);
      console.log(`Backup of original file created at: ${backupPath}`);

      fs.copyFileSync(modificationPath, originalPath);
      console.log(`✅ Successfully applied modification to ${originalPath}.`);

      fs.unlinkSync(modificationPath);
      console.log(`Cleaned up proposal file: ${modificationPath}`);
      
    } catch (error) {
      console.error('An error occurred during application:', error);
    } finally {
      rl.close();
    }
  });
}

applyModification();