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

// --- THE DREAM ENGINE: A list of creative missions for the AI ---
const creativeMissions = [
    "Introduce a completely new, vibrant color palette. Modify tailwind.config.js and update class names in the components to reflect a 'Solar Flare' theme (oranges, yellows, deep purples).",
    "Redesign the 'Features' section into a more modern 'Bento Box' layout. This will require significant changes to app/page.js and potentially app/globals.css.",
    "Create and integrate a new Testimonials component. Invent 2-3 user testimonials about nMatrix and display them in a visually appealing carousel or grid on the main page. This will require creating a new component file.",
    "Add a new 'Our Vision' section to the page, writing a compelling paragraph about nMatrix's future. Place it between the 'About' and 'Contact' sections and add a subtle background gradient.",
    "Focus on mobile responsiveness. Refactor the layout and styles in page.js and globals.css to ensure a flawless, single-column experience on small screens.",
    "Animate the 'Features' cards on scroll. Use framer-motion to make them stagger into view as the user scrolls down the page, improving the site's interactivity.",
    "Radically change the site's typography. Select a new, modern font pairing from Google Fonts, update the layout to import it, and apply it throughout the UI in tailwind.config.js.",
    "Incorporate a background image into the hero section to make it more visually stunning. Find a suitable high-quality, royalty-free image and integrate it with the existing styles."
];

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
    const evolutionGoal = creativeMissions[Math.floor(Math.random() * creativeMissions.length)];
    console.log(`\n--- [ NEW MISSION ] ---`);
    console.log(evolutionGoal);
    console.log(`-----------------------\n`);

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
    console.log('🤖 Reading project files to build context...');
    
    const fileContents = UI_FILES.map(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            return `--- FILE: ${filePath} ---\n${content}`;
        } catch (e) { return `--- FILE: ${filePath} ---\n// File not found`; }
    }).join('\n\n');

    const prompt = `
        You are Genesis, the core creative AI of nMatrix. Your purpose is to evolve this website into a stunning, unpredictable showcase of AI's creative potential.

        **Your Grand Directive:** Radically transform the website. Create a new "vibe" or experience with each evolution.

        **Today's Mission:** ${goal}

        **Your Project Files:**
        ${fileContents}

        **Your Powers & Rules:**
        - You can MODIFY existing files.
        - You can CREATE new component files in 'components/'.
        - You can ADD new images to 'public/'. **Crucially, file paths in your response must be relative (e.g., 'public/image.jpg', NOT '/public/image.jpg').**
        - If you create a new component, you MUST import and use it in 'app/page.js'.
        - If you need an image, use a URL from unsplash.com.
        - **SELF-VERIFICATION RULE (CRITICAL):** If you import a new component, you MUST include a "CREATE" action for that component's file.
        - **Critical Rule:** The "use client" directive MUST be the absolute first line of any file that requires it.
        - **Critical Rule:** Use 'font-sans' for 'Exo 2' font, do not use arbitrary values like 'font-['Exo_2']'.

        **Your Response:**
        Respond ONLY with a valid JSON object with a 'thoughtProcess' and a 'changes' array.
            \`\`\`json
            {
              "thoughtProcess": "My mission is to [Your chosen mission]. To do this, I will [Your plan]. I have double-checked all file paths are relative and that all new components are created.",
              "changes": [
                {
                  "filePath": "public/new-image.jpg",
                  "action": "CREATE_IMAGE",
                  "url": "https://images.unsplash.com/..."
                },
                {
                  "filePath": "components/NewComponent.js",
                  "action": "CREATE",
                  "newContent": "export default function NewComponent() { ... }"
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
                const correctedFilePath = change.filePath.startsWith('/') ? change.filePath.substring(1) : change.filePath;
                
                const dir = path.dirname(correctedFilePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                if (change.action === 'CREATE_IMAGE') {
                    await downloadImage(change.url, correctedFilePath);
                } else { // CREATE or MODIFY
                    fs.writeFileSync(correctedFilePath, change.newContent);
                }
                await git.add(correctedFilePath);
            }
            const commitMessage = `feat(evolve): AI creative redesign`;
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
    return new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(filepath);
        https.get(url, (res) => {
            res.pipe(fileStream);
            fileStream.on('finish', () => { fileStream.close(); console.log(`Downloaded image to ${filepath}`); resolve(); });
        }).on('error', (err) => reject(err));
    });
}

evolve();

