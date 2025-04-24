# Git Knowledge Graph with LLM Integration

This project extracts commit history from a Git repository, structures it into a knowledge graph, and enables natural language querying using LLMs.

## Features

- Git commit history extraction
- Knowledge graph construction using Neo4j
- Natural language querying using HuggingFace's Inference APIs
- Interactive command-line interface

## Prerequisites

- Node.js (v14 or higher)
- Neo4j Database
- OpenAI API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   # Neo4j Configuration
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=your_password

   # OpenAI Configuration
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   ```
4. Build the project:
   ```bash
   npm run build
   ```

## Usage

1. Start the application:
   ```bash
   npx ts-node src/cli.ts
   ```
2. Provide the git url of the repository you wish to analyse
3. Use natural language queries to explore the commit history

## Project Structure

```
src/
├── models/         # Data models and types
├── services/       # Core services (Git, Neo4j, LLM)
├── cli.ts          # CLI application interface
├── index.ts        # Application interface to run in non-CLI mode
```
