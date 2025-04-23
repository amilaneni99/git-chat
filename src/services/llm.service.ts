import { HfInference } from '@huggingface/inference';

export class LLMService {
  private hf: HfInference;
  private model: string;

  constructor(apiKey: string) {
    this.hf = new HfInference(apiKey);
    this.model = 'deepseek-ai/DeepSeek-V3-0324';
  }

  async generateCypherQuery(question: string): Promise<string> {
    const messages = [
      {
        role: "system",
        content: `You are an AI assistant that helps users understand Git repository history through a knowledge graph. 
The graph has the following schema:

Nodes:
- Commit: {hash: string, message: string, date: string}
- Author: {name: string, email: string}
- File: {path: string}

Relationships:
- (Author)-[:AUTHORED]->(Commit)
- (Commit)-[:CHANGED {status: 'added'|'modified'|'deleted'|'renamed'}]->(File)

Generate only the Cypher query without any explanation or markdown formatting.`
      },
      {
        role: "user",
        content: question
      }
    ];

    const response = await this.hf.chatCompletion({
      model: this.model,
      provider: 'novita',
      messages: messages,
      parameters: {
        max_new_tokens: 250,
        temperature: 0.1,
        return_full_text: false
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Failed to generate Cypher query: No response from LLM');
    }

    // Strip out markdown code blocks if present
    const query = content.replace(/```cypher\n?|\n?```/g, '').trim();
    return query;
  }

  async interpretResults(question: string, results: any[]): Promise<string> {
    const messages = [
      {
        role: "system",
        content: "You are an AI assistant that helps users understand Git repository history through a knowledge graph. Provide a very brief, one-sentence answer that directly addresses the question. Do not explain the query or add any additional context."
      },
      {
        role: "user",
        content: `Question: ${question}\nResults: ${JSON.stringify(results, null, 2)}`
      }
    ];

    const response = await this.hf.chatCompletion({
      model: this.model,
      provider: 'novita',
      messages: messages,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        return_full_text: false
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Failed to interpret results: No response from LLM');
    }

    return content.trim();
  }
} 