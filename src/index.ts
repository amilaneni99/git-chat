import dotenv from 'dotenv';
import { GitService } from './services/git.service';
import { KnowledgeGraphService } from './services/knowledge-graph.service';
import { LLMService } from './services/llm.service';
import fsPromise from 'fs/promises';
import fs from 'fs';
import path from 'path';
dotenv.config();

async function main() {
    const repoPath = process.env.REPO_PATH || '/Users/abhinavamilaneni/git-repos/openai-go';
    
    // Debug: Check if directory exists
    console.log('Checking repository path:', repoPath);
    if (!fs.existsSync(repoPath)) {
        console.error('Repository path does not exist:', repoPath);
        return;
    }

    // Debug: Check if it's a git repository
    if (!fs.existsSync(`${repoPath}/.git`)) {
        console.error('Not a git repository:', repoPath);
        return;
    }

    // Initialize services
    const gitService = new GitService();
    const llmService = new LLMService(process.env.HUGGINGFACE_API_KEY || '');
    const knowledgeGraphService = new KnowledgeGraphService(
        process.env.NEO4J_URI || '',
        process.env.NEO4J_USER || '',
        process.env.NEO4J_PASSWORD || '',
        llmService
    );

    try {
        // Create temporary directory for cloning
        const tempDir = path.join(process.cwd(), 'temp', Date.now().toString());
        await fsPromise.mkdir(tempDir, { recursive: true });

        // Extract commit history
        console.log('Extracting commit history...');
        const commits = await gitService.getCommitHistory(tempDir, 'https://github.com/openai/openai-go');
        console.log(`Found ${commits.length} commits`);

        // Create knowledge graph
        console.log('Creating knowledge graph...');
        await knowledgeGraphService.createCommitGraph(commits);
        console.log('Knowledge graph created successfully');

        // Clean up temporary directory
        await fsPromise.rm(tempDir, { recursive: true, force: true });

        // Example query
        const question = 'Who made the most commits?';
        console.log(`\nQuestion: ${question}`);
        
        const result = await knowledgeGraphService.queryKnowledgeGraph(question);

        console.log(`\nAnswer: ${result}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await knowledgeGraphService.close();
    }
}

main().catch(console.error); 
