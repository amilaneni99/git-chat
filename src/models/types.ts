export interface Commit {
    hash: string;
    author: Author;
    date: Date;
    message: string;
    files: FileChange[];
}

export interface Author {
    name: string;
    email: string;
}

export interface FileChange {
    path: string;
    status: 'added' | 'modified' | 'deleted' | 'renamed';
    additions?: number;
    deletions?: number;
}

export interface KnowledgeGraphNode {
    id: string;
    type: 'commit' | 'author' | 'file';
    properties: Record<string, any>;
}

export interface KnowledgeGraphEdge {
    source: string;
    target: string;
    type: string;
    properties: Record<string, any>;
}

export interface QueryResult {
    answer: string;
    confidence: number;
    sourceNodes?: KnowledgeGraphNode[];
} 