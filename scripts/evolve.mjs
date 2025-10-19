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

// --- Main Evolution Function ---
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
    const evolutionGoal = `Radically redesign the hero section. Your goal is to create a more dynamic, visually stunning, and modern user experience. You have permission to change colors, animations, layout, and even add a new, relevant hero image.`;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const branchName = `evolve/creative-${timestamp}`;

    try {
        await git.checkout(['-b', branchName]);
        console.log(`🚀 Created new evolution branch: ${branchName}`);

        const modification = await generateCreativeModification(evolutionGoal);
        
        if (modification) {
            await applyModification(modification, branchName, autoApprove);
        } else {
            console.log('AI chose not to make a change. Reverting branch.');
            await git.checkout('main');
            await git.branch(['-D', branchName]);
        }
        
        console.log('\n✨ Creative evolution cycle complete.');

    } catch (error) {
        console.error('\nAn error occurred during the evolution cycle:', error);
        await git.checkout('main');
        await git.branch(['-D', branchName]);
        process.exit(1);
    }
}

async function generateCreativeModification(goal) {
    console.log('\n🤖 Gathering inspiration from the web...');
    // In a real scenario, you would use a web search tool here.
    // For now, we'll simulate the results.
    const inspiration = {
        trends: "Current trends include glassmorphism, aurora gradients, and bento box layouts.",
        imageUrl: "https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=2070" // Example image
    };

    console.log(`Inspiration: ${inspiration.trends}`);
    console.log(`Selected Image URL: ${inspiration.imageUrl}`);

    console.log('\n🤖 Reading project files to build context...');
    const fileContents = UI_FILES.map(filePath => {
        const content = fs.readFileSync(filePath, 'utf-8');
        return `--- FILE: ${filePath} ---\n${content}`;
    }).join('\n\n');

    const prompt = `
        You are nMatrix, a world-class UI/UX designer AI with the power to write code. Your mission is to perform a radical redesign of your own frontend.

        **Your Goal:** ${goal}

        **Inspiration from the Web:**
        - Current Trends: ${inspiration.trends}
        - Suggested Image: I have found a high-quality, royalty-free image you can use at this URL: ${inspiration.imageUrl}

        **Your Project Files:**
        ${fileContents}

        **Instructions:**
        1.  Analyze the project files and the provided inspiration.
        2.  Propose a set of changes to achieve the goal. You can modify existing files, create new ones, and add the suggested image.
        3.  If you add the image, place it in the \`/public\` directory and name it \`hero-background.jpg\`.
        4.  Respond with a JSON object. Do not include any other text. The JSON should have a \`changes\` array, where each object has a \`filePath\` and \`newContent\`.
            \`\`\`json
            {
              "thoughtProcess": "My plan to redesign the hero section based on the trends and image.",
              "changes": [
                {
                  "filePath": "public/hero-background.jpg",
                  "action": "CREATE_IMAGE",
                  "url": "${inspiration.imageUrl}"
                },
                {
                  "filePath": "app/globals.css",
                  "action": "MODIFY",
                  "newContent": "/* CSS content... */"
                },
                {
                  "filePath": "app/page.js",
                  "action": "MODIFY",
                  "newContent": "// JSX content..."
                }
              ]
            }
            \`\`\`
    `;

    console.log('🤖 Generating creative redesign...');
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
    });

    try {
        const modification = JSON.parse(completion.choices[0].message.content);
        console.log(`✅ AI has proposed a redesign. Thought: ${modification.thoughtProcess}`);
        return modification;
    } catch (error) {
        console.error('Error parsing AI response:', error);
        return null;
    }
}

async function applyModification({ changes }, branchName, autoApprove = false) {
    console.log('\n--- [ Proposed Changes ] ---');
    for (const change of changes) {
        console.log(`- ${change.action} ${change.filePath}`);
    }
    console.log('---------------------------');

    const performCommit = async () => {
        try {
            for (const change of changes) {
                if (change.action === 'CREATE_IMAGE') {
                    await downloadImage(change.url, change.filePath);
                } else { // MODIFY
                    fs.writeFileSync(change.filePath, change.newContent);
                }
                await git.add(change.filePath);
            }
            await git.commit(`feat(evolve): AI creative redesign`);
            await git.checkout('main');
            await git.merge([branchName]);
            await git.branch(['-d', branchName]);
            console.log(`✅ Redesign committed and merged into main.`);
            return true;
        } catch (e) {
            console.error('❌ Git operation failed:', e);
            return false;
        }
    };
    
    if (autoApprove) {
        console.log('✅ Auto-approving redesign...');
        return await performCommit();
    }

    return new Promise((resolve) => {
        rl.question(`Do you approve committing this redesign? (y/n): `, async (answer) => {
            rl.close();
            if (answer.toLowerCase() === 'y') {
                resolve(await performCommit());
            } else {
                console.log('❌ Redesign rejected. Reverting branch...');
                await git.checkout('main');
                await git.branch(['-D', branchName]);
                resolve(false);
            }
        });
    });
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const fileStream = fs.createWriteStream(filepath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`Downloaded image to ${filepath}`);
                resolve();
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

evolve();