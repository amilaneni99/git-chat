import neo4j, { Driver, Session } from 'neo4j-driver';
import { LLMService } from './llm.service';
import { Commit, KnowledgeGraphNode } from '../models/types';

export class KnowledgeGraphService {
  private driver: Driver;
  private llmService: LLMService;

  constructor(uri: string, username: string, password: string, llmService: LLMService) {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    this.llmService = llmService;
  }

  async close() {
    await this.driver.close();
  }

  async createCommitGraph(commits: Commit[]): Promise<void> {
    const session = this.driver.session();

    try {
      // Clear existing data
      await session.run('MATCH (n) DETACH DELETE n');

      // Create commit nodes and relationships
      for (const commit of commits) {
        // Create commit node
        await session.run(
          'CREATE (c:Commit {hash: $hash, message: $message, date: $date})',
          {
            hash: commit.hash,
            message: commit.message,
            date: commit.date.toISOString()
          }
        );

        // Create author node and relationship
        await session.run(
          `
          MERGE (a:Author {email: $email})
          SET a.name = $name
          WITH a
          MATCH (c:Commit {hash: $hash})
          CREATE (a)-[:AUTHORED]->(c)
          `,
          {
            email: commit.author.email,
            name: commit.author.name,
            hash: commit.hash
          }
        );

        // Create file nodes and relationships
        for (const file of commit.files) {
          await session.run(
            `
            MERGE (f:File {path: $path})
            WITH f
            MATCH (c:Commit {hash: $hash})
            CREATE (c)-[:CHANGED {status: $status}]->(f)
            `,
            {
              path: file.path,
              hash: commit.hash,
              status: file.status
            }
          );
        }
      }
    } finally {
      await session.close();
    }
  }

  async queryKnowledgeGraph(question: string): Promise<string> {
    const session = this.driver.session();
    try {
      // Generate Cypher query using LLM
      const cypherQuery = await this.llmService.generateCypherQuery(question);
      console.log('Generated Cypher Query:', cypherQuery);
      
      // Execute the query
      const result = await session.run(cypherQuery);
      const records = result.records.map(record => record.toObject());
      console.log('Records:', records);
      
      // Interpret the results using LLM
      const interpretation = await this.llmService.interpretResults(question, records);
      console.log('Interpretation:', interpretation);
      return interpretation;
    } finally {
      await session.close();
    }
  }

} 