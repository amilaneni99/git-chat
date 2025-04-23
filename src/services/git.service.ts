import simpleGit, { SimpleGit } from 'simple-git';
import { Commit, Author, FileChange } from '../models/types';
import fs from 'fs';

export class GitService {
    private git: SimpleGit;

    constructor(repoPath: string) {
        console.log('Initializing Git service with path:', repoPath);
        console.log('Directory exists:', fs.existsSync(repoPath));
        console.log('.git directory exists:', fs.existsSync(`${repoPath}/.git`));
        
        this.git = simpleGit(repoPath);
    }

    async getCommitHistory(): Promise<Commit[]> {
        try {
            console.log('Fetching git log...');
            const log = await this.git.log();
            console.log('Log fetched successfully, number of commits:', log.all.length);
            
            const commits: Commit[] = [];

            for (const commit of log.all) {
                console.log('Processing commit:', commit.hash);
                const files = await this.getCommitFiles(commit.hash);
                commits.push({
                    hash: commit.hash,
                    author: {
                        name: commit.author_name,
                        email: commit.author_email
                    },
                    date: new Date(commit.date),
                    message: commit.message,
                    files
                });
            }

            return commits;
        } catch (error) {
            console.error('Error in getCommitHistory:', error);
            throw error;
        }
    }

    private async getCommitFiles(commitHash: string): Promise<FileChange[]> {
        try {
            console.log('Getting files for commit:', commitHash);
            const diff = await this.git.show([commitHash, '--name-status', '--numstat']);
            const files: FileChange[] = [];
            const lines = diff.split('\n');

            for (const line of lines) {
                if (line.startsWith('A\t') || line.startsWith('M\t') || line.startsWith('D\t') || line.startsWith('R\t')) {
                    const [status, path] = line.split('\t');
                    files.push({
                        path,
                        status: this.mapStatus(status),
                        additions: 0,
                        deletions: 0
                    });
                }
            }

            console.log('Found files:', files.length);
            return files;
        } catch (error) {
            console.error('Error in getCommitFiles:', error);
            throw error;
        }
    }

    private mapStatus(status: string): FileChange['status'] {
        switch (status) {
            case 'A': return 'added';
            case 'M': return 'modified';
            case 'D': return 'deleted';
            case 'R': return 'renamed';
            default: return 'modified';
        }
    }
} 