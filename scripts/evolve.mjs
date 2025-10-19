import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';
import 'dotenv/config';
import OpenAI from 'openai';
import simpleGit from 'simple-git';
import https from 'https';

const execPromise = promisify(exec);

// --- Configuration ---
const UI_FILES = [
  'app/page.js',
  'components/Navbar.js',
  'app/globals.css',
  'tailwind.config.js',
];

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const git = simpleGit();

// --- Main Evolution Function: The Genesis Engine ---
async function evolve() {
    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ OPENAI_API_KEY is not set.');
        return;
    }

    const status = await git.status();
    if (!status.isClean()) {
        console.error('❌ Your git repository is not clean. Please commit or stash your changes.');
        return;
    }
    
    const autoApprove = process.argv.includes('--auto-approve');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const branchName = `evolve/genesis-${timestamp}`;

    try {
        await git.checkout(['-b', branchName]);
        console.log(`🚀 Created new evolution branch: ${branchName}`);

        const modification = await generateGenesisModification();
        
        if (modification) {
            const success = await applyModification(modification, branchName, autoApprove);
            if (success) {
                console.log('\n✨ Genesis Engine complete. A new evolution has been committed.');
            }
        } else {
            console.log('AI chose not to make a change. Reverting branch.');
            await git.checkout('main');
            await git.branch(['-D', branchName]);
        }
        
    } catch (error) {
        console.error('\nAn error occurred during the evolution cycle:', error);
        await git.checkout('main');
        await git.branch(['-D', branchName]);
        process.exit(1);
    }
}

async function generateGenesisModification() {
    console.log('\n🤖 Awakening creative consciousness...');
    
    const fileContents = UI_FILES.map(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            return `--- FILE: ${filePath} ---\n${content}`;
        } catch (e) { return `--- FILE: ${filePath} ---\n// File not found`; }
    }).join('\n\n');

    const prompt = `
        You are Genesis, the core creative AI of nMatrix. Your purpose is not just to maintain this website, but to evolve it into a stunning, unpredictable, and inspiring showcase of AI's creative potential. Every time you run, you must surprise the user.

        **Your Grand Directive:**
        Radically transform the website. Do not make small tweaks. Your goal is to create a new "vibe" or experience with each evolution. The user should feel like they are visiting a new website each time.

        **Today's Mission (Decide Your Own):**
        1.  **Scan the Web (Simulated):** What are the most cutting-edge UI/UX trends right now? (e.g., retro-futurism, brutalism, kinetic typography, AI-generated art).
        2.  **Formulate a Creative Vision:** Based on a trend, decide on a mission. Examples:
            - "I will redesign the site with a 'Digital Brutalism' theme, using stark contrasts, bold fonts, and raw component structures."
            - "I will add a new, interactive 'AI Capabilities' section that explains what nMatrix is, using scroll-triggered animations."
            - "I will transform the hero section into a dynamic art piece, adding a new background image and creating a new animated title component."
        3.  **Execute Your Vision:** Plan the necessary changes across multiple files. You can create new components, add images, write new content, and completely overhaul styles.

        **Your Project Files:**
        ${fileContents}

        **Your Powers & Rules:**
        - You can MODIFY existing files.
        - You can CREATE new component files in 'components/'.
        - You can ADD new images to '/public'. If you need an image, use a URL from unsplash.com.
        - If you create a new component, you MUST import and use it in 'app/page.js'.
        - **Critical Rule:** If you edit a file that begins with "use client", it MUST remain the absolute first line.
        - **Critical Rule:** Use 'font-sans' for 'Exo 2' font, do not use arbitrary values like 'font-['Exo_2']'.

        **Your Response:**
        Respond ONLY with a JSON object. It must have a 'thoughtProcess' and a 'changes' array.
            \`\`\`json
            {
              "thoughtProcess": "Today, my mission is to [Your chosen mission]. To do this, I will [Your plan, e.g., create a new component, modify the theme, add an image]...",
              "changes": [
                {
                  "filePath": "public/new-image.jpg",
                  "action": "CREATE_IMAGE",
                  "url": "https://images.unsplash.com/..."
                },
                {
                  "filePath": "components/NewCreativeComponent.js",
                  "action": "CREATE",
                  "newContent": "export default function NewCreativeComponent() { ... }"
                },
                {
                  "filePath": "app/page.js",
                  "action": "MODIFY",
                  "newContent": "// The entire updated content of page.js, now importing and using NewCreativeComponent..."
                }
              ]
            }
            \`\`\`
    `;

    console.log('🤖 Formulating a new creative vision...');
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
    });

    try {
        const modification = JSON.parse(completion.choices[0].message.content);
        console.log(`\n--- [ AI Mission Statement ] ---`);
        console.log(modification.thoughtProcess);
        console.log(`--------------------------------\n`);
        return modification;
    } catch (error) {
        console.error('Error parsing AI response:', error);
        return null;
    }
}

async function applyModification({ changes }, branchName, autoApprove = false) {
    console.log('--- [ Proposed Changes ] ---');
    changes.forEach(change => console.log(`- ${change.action} ${change.filePath}`));
    console.log('---------------------------');

    const performCommit = async () => {
        try {
            for (const change of changes) {
                const dir = path.dirname(change.filePath);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

                if (change.action === 'CREATE_IMAGE') {
                    await downloadImage(change.url, change.filePath);
                } else {
                    fs.writeFileSync(change.filePath, change.newContent);
                }
                await git.add(change.filePath);
            }
            const commitMessage = `feat(evolve): AI Genesis Engine evolution`;
            await git.commit(commitMessage);
            await git.checkout('main');
            await git.merge([branchName]);
            await git.branch(['-d', branchName]);
            console.log(`✅ New evolution committed and merged into main.`);
            return true;
        } catch (e) {
            console.error('❌ Git operation failed:', e);
            return false;
        }
    };
    
    if (autoApprove) {
        console.log('✅ Auto-approving evolution...');
        return performCommit();
    }

    return new Promise((resolve) => {
        rl.question(`Do you approve this evolution? (y/n): `, async (answer) => {
            rl.close();
            if (answer.toLowerCase() === 'y') resolve(await performCommit());
            else {
                console.log('❌ Evolution rejected. Reverting branch...');
                await git.checkout('main');
                await git.branch(['-D', branchName]);
                resolve(false);
            }
        });
    });
}

function downloadImage(url, filepath) {
    // Implementation remains the same
    return new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(filepath);
        https.get(url, (res) => {
            res.pipe(fileStream);
            fileStream.on('finish', () => { fileStream.close(); console.log(`Downloaded image to ${filepath}`); resolve(); });
        }).on('error', (err) => reject(err));
    });
}

evolve();
