import 'dotenv/config';
import readline from 'readline';
import { KnowledgeGraphService } from './services/knowledge-graph.service';
import { LLMService } from './services/llm.service';
import { GitService } from './services/git.service';
import path from 'path';
import fs from 'fs/promises';

async function main() {
    // Initialize services
    const llmService = new LLMService(process.env.HUGGINGFACE_API_KEY || '');
    const knowledgeGraphService = new KnowledgeGraphService(
        process.env.NEO4J_URI || '',
        process.env.NEO4J_USER || '',
        process.env.NEO4J_PASSWORD || '',
        llmService
    );

    // Create readline interface
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Function to get user input
    const question = (query: string): Promise<string> => {
        return new Promise((resolve) => {
            rl.question(query, resolve);
        });
    };

    try {
        // Get repository URL
        console.log('Welcome to Git Chat!');
        const repoUrl = await question('Please enter the Git repository URL: ');
        
        // Create temporary directory for cloning
        const tempDir = path.join(process.cwd(), 'temp', Date.now().toString());
        await fs.mkdir(tempDir, { recursive: true });

        // Clone and process repository
        console.log('\nCloning repository and building knowledge graph...');
        const gitService = new GitService();
        const commits = await gitService.getCommitHistory(tempDir, repoUrl);
        
        // Build knowledge graph
        console.log('\nBuilding knowledge graph...');
        await knowledgeGraphService.createCommitGraph(commits);
        
        // Clean up temporary directory
        await fs.rm(tempDir, { recursive: true, force: true });

        console.log('\nKnowledge graph built successfully!');
        console.log('You can now ask questions about the repository.');
        console.log('Type "exit" to quit.\n');

        // Main chat loop
        while (true) {
            const userQuestion = await question('> ');

            if (userQuestion.toLowerCase() === 'exit') {
                break;
            }

            try {
                console.log('\nThinking...\n');
                const answer = await knowledgeGraphService.queryKnowledgeGraph(userQuestion);
                console.log(answer + '\n');
            } catch (error) {
                console.error('Error:', (error as Error).message);
            }
        }
    } catch (error) {
        console.error('Error:', (error as Error).message);
    } finally {
        // Cleanup
        await knowledgeGraphService.close();
        rl.close();
        console.log('\nGoodbye!');
    }
}

main().catch(console.error); 
