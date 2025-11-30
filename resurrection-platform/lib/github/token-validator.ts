/**
 * GitHub Token Validator
 * 
 * Validates GitHub Personal Access Tokens before attempting API calls.
 * Checks token format, validity, and required scopes.
 */

export interface TokenValidationResult {
  valid: boolean;
  scopes: string[];
  username?: string;
  error?: string;
}

export class GitHubTokenValidator {
  /**
   * Sanitize a GitHub token by trimming whitespace and removing invalid characters
   */
  sanitizeToken(token: string): string {
    if (!token) {
      return '';
    }

    // Trim whitespace
    let sanitized = token.trim();

    // Remove any newlines, carriage returns, or tabs
    sanitized = sanitized.replace(/[\n\r\t]/g, '');

    // Remove any quotes that might have been accidentally included
    sanitized = sanitized.replace(/['"]/g, '');

    // GitHub tokens should only contain alphanumeric characters and underscores
    // Classic tokens start with 'ghp_', fine-grained tokens start with 'github_pat_'
    // Keep only valid characters
    sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '');

    return sanitized;
  }

  /**
   * Validate a GitHub token and check its scopes
   */
  async validateToken(token: string): Promise<TokenValidationResult> {
    // Check if token is provided
    if (!token || token.trim() === '') {
      return {
        valid: false,
        scopes: [],
        error: 'Token is missing or empty'
      };
    }

    // Sanitize the token
    const sanitizedToken = this.sanitizeToken(token);

    // Check token format
    if (!this.isValidTokenFormat(sanitizedToken)) {
      return {
        valid: false,
        scopes: [],
        error: 'Token format is invalid. Expected format: ghp_... or github_pat_...'
      };
    }

    try {
      // Call GitHub API to validate token
      const response = await fetch('https://api.github.com/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sanitizedToken}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      // Check if token is valid
      if (!response.ok) {
        if (response.status === 401) {
          return {
            valid: false,
            scopes: [],
            error: 'Token is invalid or expired'
          };
        }

        if (response.status === 403) {
          return {
            valid: false,
            scopes: [],
            error: 'Token is valid but has insufficient permissions'
          };
        }

        return {
          valid: false,
          scopes: [],
          error: `GitHub API error: ${response.status} ${response.statusText}`
        };
      }

      // Parse user data
      const userData = await response.json();
      const username = userData.login;

      // Get scopes from response headers
      const scopes = this.parseScopes(response.headers);

      // Log scopes for debugging
      console.log(`[GitHubTokenValidator] Token validated for user: ${username}`);
      console.log(`[GitHubTokenValidator] Detected scopes: ${scopes.length > 0 ? scopes.join(', ') : 'none (fine-grained token)'}`);

      return {
        valid: true,
        scopes,
        username,
        error: undefined
      };

    } catch (error) {
      return {
        valid: false,
        scopes: [],
        error: error instanceof Error ? error.message : 'Failed to validate token'
      };
    }
  }

  /**
   * Check if a token has the required scopes
   */
  async checkScopes(token: string, requiredScopes: string[]): Promise<boolean> {
    const validation = await this.validateToken(token);
    
    if (!validation.valid) {
      return false;
    }

    // For fine-grained tokens, scopes might be empty in headers
    // We need to test actual API access
    if (validation.scopes.length === 0) {
      // Try to verify repo access by checking if we can list repos
      return this.verifyRepoAccess(token);
    }

    // Check if all required scopes are present
    return requiredScopes.every(scope => validation.scopes.includes(scope));
  }

  /**
   * Check if token has repo scope (required for repository creation)
   */
  async hasRepoScope(token: string): Promise<boolean> {
    return this.checkScopes(token, ['repo']);
  }

  /**
   * Verify repo access by attempting to list user repositories
   * This is needed for fine-grained tokens where scopes aren't in headers
   */
  private async verifyRepoAccess(token: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.github.com/user/repos?per_page=1', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      // If we can list repos, we have repo access
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate token format (basic check before API call)
   */
  private isValidTokenFormat(token: string): boolean {
    // Classic tokens: ghp_... (40 characters total)
    // Fine-grained tokens: github_pat_... (longer)
    
    if (token.startsWith('ghp_')) {
      // Classic token should be exactly 40 characters
      return token.length === 40;
    }

    if (token.startsWith('github_pat_')) {
      // Fine-grained token is longer (typically 93+ characters)
      return token.length > 50;
    }

    return false;
  }

  /**
   * Parse scopes from GitHub API response headers
   */
  private parseScopes(headers: Headers): string[] {
    // GitHub returns scopes in the X-OAuth-Scopes header
    const scopesHeader = headers.get('X-OAuth-Scopes');
    
    if (!scopesHeader) {
      // For fine-grained tokens, scopes might not be in headers
      // We need to check permissions differently
      return this.inferScopesFromHeaders(headers);
    }

    // Parse comma-separated scopes
    return scopesHeader
      .split(',')
      .map(scope => scope.trim())
      .filter(scope => scope.length > 0);
  }

  /**
   * Infer scopes from other headers (for fine-grained tokens)
   */
  private inferScopesFromHeaders(headers: Headers): string[] {
    const scopes: string[] = [];

    // Check for common permission headers
    const permissions = headers.get('X-Accepted-OAuth-Scopes');
    if (permissions) {
      scopes.push(...permissions.split(',').map(s => s.trim()));
    }

    // If we can't determine scopes, return empty array
    // The caller should handle this by checking specific API endpoints
    return scopes;
  }

  /**
   * Get a user-friendly error message for common token issues
   */
  getErrorGuidance(validationResult: TokenValidationResult): string {
    if (validationResult.valid) {
      return 'Token is valid';
    }

    if (!validationResult.error) {
      return 'Unknown validation error';
    }

    // Provide specific guidance based on error
    if (validationResult.error.includes('missing or empty')) {
      return 'Please set GITHUB_TOKEN in your .env.local file. See setup guide for instructions.';
    }

    if (validationResult.error.includes('format is invalid')) {
      return 'Token format is invalid. Please generate a new Personal Access Token from GitHub Settings.';
    }

    if (validationResult.error.includes('invalid or expired')) {
      return 'Token is invalid or expired. Please generate a new Personal Access Token from GitHub Settings.';
    }

    if (validationResult.error.includes('insufficient permissions')) {
      return 'Token is valid but missing required "repo" scope. Please create a new token with repo permissions.';
    }

    return validationResult.error;
  }

  /**
   * Mask a token for safe logging (show only first 4 characters)
   */
  maskToken(token: string): string {
    if (!token || token.length < 4) {
      return '****';
    }

    return `${token.substring(0, 4)}${'*'.repeat(Math.min(token.length - 4, 36))}`;
  }
}
