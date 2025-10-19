import fs from 'fs';
import path from 'path';
import 'dotenv/config'; // Loads environment variables from .env
import OpenAI from 'openai';

const AUDIT_OUTPUT_DIR = 'audits';

// Initialize the AI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set. Please add it to your .env file.');
  process.exit(1);
}

// Function to generate a critique using an AI model
async function generateCritique(metrics) {
  const { performance, accessibility, seo, failedAudits } = metrics;

  const prompt = `
    You are nMatrix, a self-evolving website's AI core. Your task is to analyze an audit of your own frontend.
    Provide a concise, critical analysis based on the following Lighthouse scores and failed audits.
    Your response should be in Markdown format and follow this structure:
    1.  **Overall Assessment**: A brief, one-sentence summary of the current state.
    2.  **Priority Areas**: Bullet points highlighting the most critical issues to address. Focus on performance and accessibility first.
    3.  **Actionable Suggestions**: Specific, developer-focused recommendations to fix the top 2-3 issues.

    **Current Metrics:**
    - Performance Score: ${performance.toFixed(0)}
    - Accessibility Score: ${accessibility.toFixed(0)}
    - SEO Score: ${seo.toFixed(0)}
    - Total Audits Needing Attention: ${failedAudits.length}

    **Failed Audits Details (Top 5):**
    ${failedAudits.slice(0, 5).map(a => `- **${a.title} (Score: ${a.score !== null ? a.score.toFixed(2) : 'N/A'})**: ${a.description.substring(0, 100)}...`).join('\n')}
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Or your preferred model
      messages: [{ role: 'user', content: prompt }],
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching critique from AI:', error);
    return 'Failed to generate critique due to an API error.';
  }
}


async function runCritique() {
  console.log('Starting the Self-Critique process...');

  // 1. Find and read the latest audit file
  const auditFiles = fs.readdirSync(AUDIT_OUTPUT_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => ({
      file,
      time: fs.statSync(path.join(AUDIT_OUTPUT_DIR, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  if (auditFiles.length === 0) {
    console.error('❌ No audit files found. Please run `npm run audit` first.');
    process.exit(1);
  }

  const latestAuditPath = path.join(AUDIT_OUTPUT_DIR, auditFiles[0].file);
  console.log(`Analyzing the latest audit: ${latestAuditPath}`);
  const auditData = JSON.parse(fs.readFileSync(latestAuditPath, 'utf-8'));
  
  // 2. Extract key metrics for the AI
  const metrics = {
    performance: auditData.categories.performance.score * 100,
    accessibility: auditData.categories.accessibility.score * 100,
    seo: auditData.categories.seo.score * 100,
    failedAudits: Object.values(auditData.audits).filter(a => a.score !== 1 && a.score !== null).map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        score: a.score,
    })),
  };
  
  // 3. Generate the AI critique
  console.log('\n🤖 Generating AI analysis...');
  const critiqueResult = await generateCritique(metrics);

  console.log('--- [ nMatrix Self-Critique Analysis ] ---');
  console.log(critiqueResult);
  console.log('------------------------------------------');
  
  console.log('\n✅ Self-Critique analysis complete.');
}

runCritique().catch(err => {
  console.error('Critique failed:', err);
  process.exit(1);
});