import readline from 'readline';
import { KnowledgeGraphService } from './services/knowledge-graph.service';
import { LLMService } from './services/llm.service';

async function main() {
    const llmService = new LLMService(process.env.HUGGINGFACE_API_KEY || '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');
    const knowledgeGraphService = new KnowledgeGraphService(
        process.env.NEO4J_URI || 'neo4j+s://4ac00305.databases.neo4j.io',
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'F7LNXGSn99PEPvp-pKSVhzRWkLBtb0HkLpJxqrv8Igc',
        llmService
    );

    // Create readline interface
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('Welcome to Git Chat! Ask questions about your repository history.');
    console.log('Type "exit" to quit.\n');

    // Main chat loop
    while (true) {
        const question = await new Promise<string>((resolve) => {
            rl.question('> ', resolve);
        });

        if (question.toLowerCase() === 'exit') {
            break;
        }

        try {
            console.log('\nThinking...\n');
            const answer = await knowledgeGraphService.queryKnowledgeGraph(question);
            console.log(answer + '\n');
        } catch (error) {
            console.error('Error:', (error as Error).message);
        }
    }

    // Cleanup
    await knowledgeGraphService.close();
    rl.close();
    console.log('\nGoodbye!');
}

main().catch(console.error); 