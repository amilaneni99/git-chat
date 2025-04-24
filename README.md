# Git Chat

An interactive command-line tool that allows you to query Git repository history using natural language. The tool builds a knowledge graph from your Git repository and uses a Large Language Model to understand and answer questions about the repository's history.

## Features

- Clone any Git repository
- Build a knowledge graph from commit history
- Ask questions in natural language
- Get concise, relevant answers about repository history

## Prerequisites

- Node.js (v14 or higher)
- Neo4j Database
- OpenAI API key

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
export HUGGINGFACE_API_KEY='your-huggingface-api-key'
export NEO4J_URI='your-neo4j-uri'
export NEO4J_USER='your-neo4j-username'
export NEO4J_PASSWORD='your-neo4j-password'
```

3. Run the application:
```bash
npx ts-node src/cli.ts
```

## Usage

1. Start the application:
   ```bash
   npx ts-node src/cli.ts
   ```
2. Provide the git url of the repository you wish to analyse
3. Use natural language queries to explore the commit history
4. To exit the application, simply type `exit` at the prompt.

## Example Queries

Here are some example questions you can ask about your repository:

### Author-related Questions
```
> Who made the most commits?
John Doe made the most commits with 42 commits.

> Who was the last person to modify the README.md file?
Jane Smith last modified README.md in commit abc123.

> Which author made changes to the most files?
John Doe modified 156 different files across all commits.
```

### File-related Questions
```
> What files were changed in the last commit?
The last commit modified src/services/llm.service.ts and added src/cli.ts.

> Which file has been modified the most times?
src/services/knowledge-graph.service.ts has been modified 23 times.

> What files were added in the last week?
In the last week, 5 new files were added: src/cli.ts, src/services/git.service.ts, and 3 test files.
```

### Commit-related Questions
```
> What was the most recent commit message?
The last commit message was "Add interactive CLI interface".

> How many commits were made in the last month?
There were 47 commits made in the last month.

> What was the largest commit in terms of files changed?
The largest commit (abc123) modified 12 files, primarily in the src/services directory.
```

### Time-based Questions
```
> What was the busiest day for commits?
The busiest day was 2024-03-15 with 15 commits.

> When was the last time the main.ts file was modified?
The main.ts file was last modified 3 days ago in commit def456.

> How many commits were made between January and March?
There were 89 commits made between January and March 2024.
```

## Tips for Better Queries

1. Be specific in your questions
2. Use natural language - no need for technical terms
3. You can ask about:
   - Authors and their contributions
   - File changes and history
   - Commit patterns and timing
   - Relationships between files and authors

## Project Structure

```
src/
├── models/         # Data models and types
├── services/       # Core services (Git, Neo4j, LLM)
├── cli.ts          # CLI application interface
├── index.ts        # Application interface to run in non-CLI mode
```