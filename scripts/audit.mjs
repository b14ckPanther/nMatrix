import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const execPromise = promisify(exec);

const AXIOM_URL = 'http://localhost:3000';
const AUDIT_OUTPUT_DIR = 'audits';

async function runAudit() {
  // Ensure output directory exists
  if (!fs.existsSync(AUDIT_OUTPUT_DIR)) {
    fs.mkdirSync(AUDIT_OUTPUT_DIR);
  }

  // 1. Build the project
  console.log('Building the Next.js project...');
  await execPromise('npm run build');

  // 2. Start the production server
  console.log('Starting production server...');
  const serverProcess = exec('npm run start');
  await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for server to start

  // 3. Launch Chrome and run Lighthouse
  console.log(`Running Lighthouse audit on ${AXIOM_URL}...`);
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(AXIOM_URL, options);

  // 4. Save the report
  const reportJson = runnerResult.report;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `${AUDIT_OUTPUT_DIR}/nmatrix-audit-${timestamp}.json`;
  fs.writeFileSync(reportPath, reportJson);

  console.log(`\n✅ Lighthouse report saved to: ${reportPath}`);
  console.log('Performance Score:', runnerResult.lhr.categories.performance.score * 100);

  // 5. Clean up
  await chrome.kill();
  serverProcess.kill();
  process.exit(0);
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});