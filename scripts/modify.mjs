import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import OpenAI from 'openai';

const AUDIT_OUTPUT_DIR = 'audits';
const CRITIQUE_OUTPUT_DIR = 'critiques';
const SRC_DIR = 'app';

// Initialize AI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in your .env file.');
  process.exit(1);
}

// Function to get the latest file from a directory
const getLatestFile = (directory) => {
  const files = fs.readdirSync(directory)
    .filter(file => !file.startsWith('.'))
    .map(file => ({
      file,
      time: fs.statSync(path.join(directory, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);
  
  return files.length > 0 ? path.join(directory, files[0].file) : null;
};

// Function to generate code modifications
async function generateModification(critique, sourceCode) {
  const prompt = `
    You are nMatrix, a senior software engineer AI tasked with improving your own codebase.
    Based on the following critique, please rewrite the provided React component file.

    **CRITIQUE:**
    ---
    ${critique}
    ---

    **OBJECTIVE:**
    - Apply the actionable suggestions from the critique directly to the code.
    - Focus primarily on performance and accessibility improvements. For instance, if the critique mentions image optimization, add 'loading="lazy"' to images and ensure they have width/height attributes. If it mentions render-blocking resources, analyze if anything can be improved.
    - Do NOT add any new features or change the visual style.
    - Respond ONLY with the full, updated code for the file. Do not include explanations, apologies, or markdown formatting.

    **CURRENT FILE CONTENT:**
    ---
    ${sourceCode}
    ---
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating modification from AI:', error);
    return null;
  }
}

async function runModification() {
  console.log('Starting the Self-Modification process...');

  // 1. Get the latest critique
  const latestCritiquePath = getLatestFile(CRITIQUE_OUTPUT_DIR);
  if (!latestCritiquePath) {
    console.error('❌ No critique files found. Please run `npm run critique` first.');
    process.exit(1);
  }
  const critique = fs.readFileSync(latestCritiquePath, 'utf-8');
  console.log(`Loaded critique: ${latestCritiquePath}`);

  // 2. Identify the target file to modify (for this example, we'll focus on the homepage)
  const targetFilePath = path.join(SRC_DIR, 'page.js');
  if (!fs.existsSync(targetFilePath)) {
    console.error(`❌ Target file not found: ${targetFilePath}`);
    process.exit(1);
  }
  const sourceCode = fs.readFileSync(targetFilePath, 'utf-8');

  // 3. Generate the modified code
  console.log(`\n🤖 AI is generating modifications for ${targetFilePath}...`);
  const modifiedCode = await generateModification(critique, sourceCode);

  if (!modifiedCode) {
    console.error('❌ AI failed to generate modifications.');
    process.exit(1);
  }

  // 4. Save the proposed modification for review
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const modificationPath = `app/page.v${timestamp}.js`;
  fs.writeFileSync(modificationPath, modifiedCode.replace(/```javascript|```/g, '').trim());

  console.log('\n--- [ Proposed Code Modification ] ---');
  console.log(modifiedCode.replace(/```javascript|```/g, '').trim());
  console.log('------------------------------------');

  console.log(`\n✅ Modification proposal saved to: ${modificationPath}`);
  console.log('Review the file, and if you approve, you can replace the original app/page.js with this new version.');
}

// Helper to save the critique to a file before running modification
async function saveCritique(critiqueContent) {
    if (!fs.existsSync(CRITIQUE_OUTPUT_DIR)) {
        fs.mkdirSync(CRITIQUE_OUTPUT_DIR);
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const critiquePath = path.join(CRITIQUE_OUTPUT_DIR, `critique-${timestamp}.md`);
    fs.writeFileSync(critiquePath, critiqueContent);
}

// We'll update the main critique script to save its output.
async function runCritiqueAndSave() {
    // This function re-runs the critique logic to ensure we're using fresh data
    const latestAuditPath = getLatestFile(AUDIT_OUTPUT_DIR);
    if (!latestAuditPath) {
        console.error('❌ No audit files found for critique. Run `npm run audit` first.');
        return;
    }
    const auditData = JSON.parse(fs.readFileSync(latestAuditPath, 'utf-8'));
    const metrics = {
        performance: auditData.categories.performance.score * 100,
        accessibility: auditData.categories.accessibility.score * 100,
        seo: auditData.categories.seo.score * 100,
        failedAudits: Object.values(auditData.audits).filter(a => a.score !== 1 && a.score !== null).map(a => ({
            id: a.id, title: a.title, description: a.description, score: a.score,
        })),
    };

    const critiqueResult = await generateCritiqueForSave(metrics);
    await saveCritique(critiqueResult);
}

async function generateCritiqueForSave(metrics) {
    // Simplified prompt for saving
    const prompt = `Analyze these metrics and list actionable suggestions:\n${JSON.stringify(metrics, null, 2)}`;
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
    });
    return completion.choices[0].message.content;
}

// Main execution block
(async () => {
    // First ensure a critique file exists
    await runCritiqueAndSave();
    // Now run the modification
    await runModification();
})().catch(err => {
  console.error('Process failed:', err);
  process.exit(1);
});