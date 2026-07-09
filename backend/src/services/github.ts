import { Octokit } from 'octokit';
import { config } from '../config/index.js';
import { db } from '../db/index.js';
let octokit: Octokit | null = null;

const githubAuthToken = process.env.GITHUB_TOKEN || config.github.privateKey;
if (githubAuthToken) {
  try {
    octokit = new Octokit({
      auth: githubAuthToken,
    });
    console.log('GitHub API Octokit client initialized with token.');
  } catch (error) {
    console.error('Failed to initialize Octokit with token:', error);
  }
} else {
  console.log('GitHub Service running in SIMULATION mode (mock repository interactions).');
}

export const githubService = {
  /**
   * Fetch file contents from the repository.
   */
  async getFileContent(repoFullName: string, filePath: string, ref: string): Promise<string> {
    console.log(`GitHub: Fetching file "${filePath}" from "${repoFullName}" at ref "${ref}"`);

    if (config.simulationMode || !octokit) {
      // Return simulated file contents
      if (filePath.endsWith('test.js') || filePath.endsWith('spec.js')) {
        return `
const assert = require('assert');
const { calculateTotal } = require('./index');

describe('Payments', () => {
  it('should calculate total with discount', () => {
    const res = calculateTotal(100, 10);
    // Deliberate bug in assertion or logic
    assert.equal(res, 90); 
  });
});
        `;
      }
      return `
// Index file with logic
function calculateTotal(price, discount) {
  // Deliberate off-by-one or math error
  return price - discount + 1; // Bug here
}

module.exports = { calculateTotal };
      `;
    }

    try {
      const [owner, repo] = repoFullName.split('/');
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref,
      });

      if ('content' in data) {
        return Buffer.from(data.content, 'base64').toString('utf8');
      }
      throw new Error(`File is not a text file: ${filePath}`);
    } catch (error) {
      console.error(`Error fetching file ${filePath} from GitHub:`, error);
      throw error;
    }
  },

  /**
   * Commit a proposed fix to the repository.
   * Creates a new branch, commits the fix, and opens a Pull Request.
   */
  async proposeFix(
    repositoryId: number,
    incidentId: string,
    repoFullName: string,
    branch: string,
    filePath: string,
    newContent: string,
    commitMessage: string
  ): Promise<{ branch: string; prUrl: string; prNumber: number }> {
    console.log(`GitHub: Proposing fix to "${repoFullName}" on branch "${branch}"`);

    const fixBranchName = `continuum-fix-${incidentId.substring(0, 8)}`;
    const prTitle = `Continuum Fix: Resolve CI failure on ${branch}`;
    const prBody = `## Continuum AI Investigation & Fix

Continuum has investigated a CI failure on branch \`${branch}\`.

### Memory Matches
* Found relevant verified fixes. Reused and adapted the successful pattern.

### Diagnosis
* Corrected off-by-one error in math logic or assertion setup.

### Proposed Code Changes
* File: \`${filePath}\`

*This fix is currently undergoing verification via GitHub Actions. If verification passes, this PR will be marked with the **PR Verification Badge**.*`;

    // Database audit logging
    await db.createAuditLog({
      repository_id: repositoryId,
      incident_id: incidentId,
      action: 'commit_fix',
      description: `Committed proposed fix to file "${filePath}" on new branch "${fixBranchName}"`,
    });

    if (config.simulationMode || !octokit) {
      const mockPrNumber = Math.floor(Math.random() * 100) + 1;
      const mockPrUrl = `https://github.com/${repoFullName}/pull/${mockPrNumber}`;

      await db.createAuditLog({
        repository_id: repositoryId,
        incident_id: incidentId,
        action: 'open_pr',
        description: `Opened pull request #${mockPrNumber} at ${mockPrUrl}`,
      });

      return {
        branch: fixBranchName,
        prUrl: mockPrUrl,
        prNumber: mockPrNumber,
      };
    }

    try {
      const [owner, repo] = repoFullName.split('/');

      // 1. Get default branch ref to branch off of
      const { data: refData } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`,
      });
      const baseSha = refData.object.sha;

      // 2. Create a new branch
      await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${fixBranchName}`,
        sha: baseSha,
      });

      // 3. Get file blob SHA
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: fixBranchName,
      });

      let fileSha: string | undefined;
      if (Array.isArray(fileData)) {
        throw new Error('Implicated path is a directory, not a file.');
      } else if (fileData.type === 'file') {
        fileSha = fileData.sha;
      }

      // 4. Update the file content
      const { data: commitData } = await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: commitMessage,
        content: Buffer.from(newContent).toString('base64'),
        branch: fixBranchName,
        sha: fileSha,
      });

      // 5. Open a Pull Request
      const { data: prData } = await octokit.rest.pulls.create({
        owner,
        repo,
        title: prTitle,
        body: prBody,
        head: fixBranchName,
        base: branch,
      });

      await db.createAuditLog({
        repository_id: repositoryId,
        incident_id: incidentId,
        action: 'open_pr',
        description: `Opened pull request #${prData.number} at ${prData.html_url}`,
      });

      return {
        branch: fixBranchName,
        prUrl: prData.html_url,
        prNumber: prData.number,
      };
    } catch (error) {
      console.error('Error committing fix or opening PR on GitHub:', error);
      throw error;
    }
  },

  /**
   * Post the PR Verification Badge comment to the pull request.
   */
  async postVerificationBadge(
    repositoryId: number,
    incidentId: string,
    repoFullName: string,
    prNumber: number,
    status: 'success' | 'failure',
    ghaRunUrl: string,
    memoryLineageId?: string
  ): Promise<void> {
    console.log(`GitHub: Posting verification badge to "${repoFullName}" PR #${prNumber}`);

    const badgeStatus = status === 'success' ? '🟢 Verified' : '🔴 Verification Failed';
    const message = `## Continuum Verification Status: **${badgeStatus}**

### Run Summary
* **Status**: ${status === 'success' ? 'Verification Passed!' : 'Fix Failed tests'}
* **Run Evidence**: [GitHub Actions Run Link](${ghaRunUrl})
${memoryLineageId ? `* **Memory Link**: Adapted from prior verified memory \`${memoryLineageId.substring(0, 8)}\`` : ''}

---
*Continuum has verified this fix using your repository's native GitHub Actions workflow. Only fixes with proven passes are recorded as verified engineering memory.*`;

    // Database audit logging
    await db.createAuditLog({
      repository_id: repositoryId,
      incident_id: incidentId,
      action: 'post_badge',
      description: `Posted verification badge comment to PR #${prNumber} with status "${status}"`,
    });

    if (config.simulationMode || !octokit) {
      console.log(`[Mock] Posted badge to PR #${prNumber}:\n${message}`);
      return;
    }

    try {
      const [owner, repo] = repoFullName.split('/');
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: message,
      });
    } catch (error) {
      console.error(`Error posting comment to PR #${prNumber}:`, error);
    }
  },
  getOctokit() {
    return octokit;
  },
};

