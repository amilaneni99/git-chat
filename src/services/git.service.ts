import simpleGit, { SimpleGit } from 'simple-git';
import { Commit, Author, FileChange } from '../models/types';
import path from 'path';
import fsPromise from 'fs/promises';

export class GitService {
    private git: SimpleGit;

    constructor() {
        this.git = simpleGit();
    }

    async getCommitHistory(repoPath: string, repoUrl: string): Promise<Commit[]> {
        try {
            // Clone the repository
            await this.git.clone(repoUrl, repoPath);
            
            // Change to the repository directory
            this.git.cwd(repoPath);

            // Get commit history
            console.log('Fetching git log...');
            const log = await this.git.log();
            console.log('Log fetched successfully, number of commits:', log.all.length);

            // Process each commit
            const commits: Commit[] = await Promise.all(
                log.all.map(async (commit) => {
                    // Get files changed in this commit
                    const files = await this.getCommitFiles(commit.hash);

                    return {
                        hash: commit.hash,
                        author: {
                            name: commit.author_name,
                            email: commit.author_email
                        },
                        date: new Date(commit.date),
                        message: commit.message,
                        files
                    };
                })
            );

            return commits;
        } catch (error) {
            throw new Error(`Failed to get commit history: ${(error as Error).message}`);
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