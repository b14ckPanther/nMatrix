import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';
import 'dotenv/config';
import OpenAI from 'openai';
import simpleGit from 'simple-git';

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
    const evolutionGoal = "Analyze the hero section and navbar. Propose a single, impactful change to make the UI more modern and visually appealing. Consider a color, animation, or layout tweak. For example, you could change a gradient in tailwind.config.js or adjust an animation in Navbar.js.";

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const branchName = `evolve/ui-creative-${timestamp}`;

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
    console.log('\n🤖 Reading project files to build context...');
    
    const fileContents = UI_FILES.map(filePath => {
        const content = fs.readFileSync(filePath, 'utf-8');
        return `--- FILE: ${filePath} ---\n${content}`;
    }).join('\n\n');

    const prompt = `
        You are nMatrix, a senior UI/UX designer and developer AI. Your task is to creatively evolve your own frontend.
        
        **Your Goal:** ${goal}

        **Project Files:**
        I have provided you with the content of the following files: ${UI_FILES.join(', ')}.
        ${fileContents}

        **Instructions:**
        1.  Analyze all the provided files to understand the project's structure and styling.
        2.  Decide on a single, targeted code change in ONE of the files to achieve the goal.
        3.  Adhere to this critical rule: If you edit a file that begins with "use client", it MUST remain the absolute first line.
        4.  Respond with a JSON object in the following format. Do not include any other text or markdown.
            \`\`\`json
            {
              "fileToModify": "path/to/your/chosen/file.js",
              "thoughtProcess": "A brief explanation of why you chose this change.",
              "newContent": "The entire, updated content of the file you chose to modify."
            }
            \`\`\`
    `;

    console.log('🤖 Generating creative modification...');
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
    });

    try {
        const modification = JSON.parse(completion.choices[0].message.content);
        if (!modification.fileToModify || !modification.newContent) {
            throw new Error("AI response is missing required fields.");
        }
        console.log(`✅ AI has proposed a change for: ${modification.fileToModify}`);
        console.log(`   Thought: ${modification.thoughtProcess}`);
        return modification;
    } catch (error) {
        console.error('Error parsing AI response:', error);
        console.log('Raw AI Response:', completion.choices[0].message.content);
        return null;
    }
}

function applyModification({ fileToModify, newContent }, branchName, autoApprove = false) {
    console.log('\n--- [ Proposed Modification ] ---');
    console.log(newContent);
    console.log('---------------------------------');

    const performCommit = async () => {
        try {
            fs.writeFileSync(fileToModify, newContent);
            await git.add(fileToModify);
            await git.commit(`feat(evolve): AI creative UI modification for ${fileToModify}`);
            await git.checkout('main');
            await git.merge([branchName]);
            await git.branch(['-d', branchName]);
            console.log(`✅ Changes committed and merged into main.`);
            return true;
        } catch (e) {
            console.error('❌ Git operation failed:', e);
            return false;
        }
    };

    if (autoApprove) {
        console.log('✅ Auto-approving changes...');
        return performCommit();
    }

    return new Promise((resolve) => {
        rl.question(`Do you approve committing this change to ${fileToModify}? (y/n): `, async (answer) => {
            rl.close();
            if (answer.toLowerCase() === 'y') {
                resolve(await performCommit());
            } else {
                console.log('❌ Modification rejected. Reverting branch...');
                await git.checkout('main');
                await git.branch(['-D', branchName]);
                resolve(false);
            }
        });
    });
}

evolve();