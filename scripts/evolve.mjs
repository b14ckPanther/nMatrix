import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';
import 'dotenv/config';
import OpenAI from 'openai';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import simpleGit from 'simple-git'; // Import simple-git

const execPromise = promisify(exec);

// --- Configuration ---
const AXIOM_URL = 'http://localhost:3000';
const AUDIT_OUTPUT_DIR = 'audits';
const CRITIQUE_OUTPUT_DIR = 'critiques';
const SRC_DIR = 'app';
const TARGET_FILE = 'page.js';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const git = simpleGit(); // Initialize git

// --- (Audit and Critique functions remain the same) ---

// --- 1. AUDIT (Self-Inspection) ---
async function runAudit() {
  if (!fs.existsSync(AUDIT_OUTPUT_DIR)) fs.mkdirSync(AUDIT_OUTPUT_DIR);
  console.log('Building project...');
  await execPromise('npm run build');

  console.log('Starting server...');
  const serverProcess = exec('npm run start');
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log(`Running Lighthouse audit on ${AXIOM_URL}...`);
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const runnerResult = await lighthouse(AXIOM_URL, { port: chrome.port, output: 'json' });

  const reportPath = path.join(AUDIT_OUTPUT_DIR, `audit-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(reportPath, runnerResult.report);

  console.log(`✅ Audit complete. Report saved. Performance: ${runnerResult.lhr.categories.performance.score * 100}`);

  await chrome.kill();
  serverProcess.kill();
  return reportPath;
}

// --- 2. CRITIQUE (Self-Critique) ---
async function generateCritique(auditPath) {
    if (!fs.existsSync(CRITIQUE_OUTPUT_DIR)) fs.mkdirSync(CRITIQUE_OUTPUT_DIR);
    console.log(`\n🤖 Analyzing audit: ${auditPath}`);
    const auditData = JSON.parse(fs.readFileSync(auditPath, 'utf-8'));

    const metrics = {
        performance: auditData.categories.performance.score * 100,
        accessibility: auditData.categories.accessibility.score * 100,
        seo: auditData.categories.seo.score * 100,
        failedAudits: Object.values(auditData.audits).filter(a => a.score !== 1 && a.score !== null).map(a => ({
            id: a.id, title: a.title, description: a.description, score: a.score
        })),
    };

    const prompt = `You are nMatrix, an AI analyzing your own website's performance. Provide a concise, critical analysis in Markdown. Focus on the top 1-2 most impactful issues and suggest specific, actionable code changes.

    **Metrics:**
    - Performance: ${metrics.performance.toFixed(0)}
    - Accessibility: ${metrics.accessibility.toFixed(0)}
    - SEO: ${metrics.seo.toFixed(0)}

    **Top Failed Audits:**
    ${metrics.failedAudits.slice(0, 3).map(a => `- **${a.title}**: ${a.description.substring(0, 80)}...`).join('\n')}`;

    const completion = await openai.chat.completions.create({ model: 'gpt-4o', messages: [{ role: 'user', content: prompt }] });
    const critique = completion.choices[0].message.content;

    const critiquePath = path.join(CRITIQUE_OUTPUT_DIR, `critique-${new Date().toISOString().replace(/[:.]/g, '-')}.md`);
    fs.writeFileSync(critiquePath, critique);

    console.log('✅ AI critique generated and saved.');
    return critique;
}


// --- 3. MODIFY (Self-Modification) ---
async function generateModification(critique, sourceCode) {
    console.log('\n🤖 Generating code modifications based on critique...');
    const prompt = `You are nMatrix, an AI engineer rewriting your own code. Based on the critique, rewrite the React component below. Respond ONLY with the full, updated code. Do not add explanations.

    **CRITIQUE:**
    ---
    ${critique}
    ---

    **CURRENT FILE CONTENT:**
    ---
    ${sourceCode}
    ---`;
    
    const completion = await openai.chat.completions.create({ model: 'gpt-4o', messages: [{ role: 'user', content: prompt }] });
    const modifiedCode = completion.choices[0].message.content.replace(/```javascript|```/g, '').trim();

    // We no longer write a versioned file, we'll let git handle versioning.
    const targetPath = path.join(SRC_DIR, TARGET_FILE);
    fs.writeFileSync(targetPath, modifiedCode);

    console.log(`✅ Modification has been written to ${targetPath}`);
    return targetPath; // Return the path of the file that was changed
}

// --- 4. APPLY (Approval Layer & Git Commit) ---
function applyModification(modifiedFilePath, branchName) {
    const originalPath = path.join(SRC_DIR, TARGET_FILE);
    console.log('\n--- [ Proposed Modification ] ---');
    console.log(fs.readFileSync(modifiedFilePath, 'utf-8'));
    console.log('---------------------------------');

    return new Promise((resolve) => {
        rl.question('Do you approve and want to commit this change? (y/n): ', async (answer) => {
            if (answer.toLowerCase() === 'y') {
                try {
                    await git.add(modifiedFilePath);
                    await git.commit(`feat(evolve): AI-driven modification based on self-critique`);
                    await git.checkout('main'); // Or your primary branch
                    await git.merge([branchName]);
                    await git.branch(['-d', branchName]);
                    console.log(`✅ Changes committed and merged into main. Branch ${branchName} deleted.`);
                    resolve(true);
                } catch (e) {
                    console.error('❌ Git operation failed:', e);
                    resolve(false);
                }
            } else {
                console.log('❌ Modification rejected. Reverting changes...');
                await git.checkout(originalPath); // Revert the file
                await git.checkout('main');
                await git.branch(['-D', branchName]); // Force delete the branch
                console.log('Changes have been reverted.');
                resolve(false);
            }
            rl.close();
        });
    });
}


// --- Main Evolution Loop ---
async function evolve() {
    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ OPENAI_API_KEY is not set.');
        return;
    }

    const status = await git.status();
    if (!status.isClean()) {
        console.error('❌ Your git repository is not clean. Please commit or stash your changes before running the evolution.');
        return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const branchName = `evolve/${timestamp}`;

    try {
        // Create a new branch for this evolution
        await git.checkout(['-b', branchName]);
        console.log(`🚀 Created new evolution branch: ${branchName}`);

        const auditPath = await runAudit();
        const critique = await generateCritique(auditPath);
        const sourceCode = fs.readFileSync(path.join(SRC_DIR, TARGET_FILE), 'utf-8');
        const modifiedFilePath = await generateModification(critique, sourceCode);
        await applyModification(modifiedFilePath, branchName);

        console.log('\n✨ Evolution cycle complete.');

    } catch (error) {
        console.error('\nAn error occurred during the evolution cycle:', error);
        // Attempt to clean up the failed branch
        await git.checkout('main');
        await git.branch(['-D', branchName]);
        process.exit(1);
    }
}

evolve();