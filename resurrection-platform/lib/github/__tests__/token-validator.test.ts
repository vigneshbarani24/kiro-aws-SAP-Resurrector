/**
 * Tests for GitHubTokenValidator
 * 
 * These tests verify token sanitization, validation, and scope checking.
 */

import { GitHubTokenValidator } from '../token-validator';

describe('GitHubTokenValidator', () => {
  let validator: GitHubTokenValidator;

  beforeEach(() => {
    validator = new GitHubTokenValidator();
  });

  describe('sanitizeToken', () => {
    it('should trim whitespace from token', () => {
      const token = '  ghp_1234567890abcdefghijklmnopqrstuvwxyz  ';
      const sanitized = validator.sanitizeToken(token);
      expect(sanitized).toBe('ghp_1234567890abcdefghijklmnopqrstuvwxyz');
    });

    it('should remove newlines and carriage returns', () => {
      const token = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz\n\r';
      const sanitized = validator.sanitizeToken(token);
      expect(sanitized).toBe('ghp_1234567890abcdefghijklmnopqrstuvwxyz');
    });

    it('should remove quotes', () => {
      const token = '"ghp_1234567890abcdefghijklmnopqrstuvwxyz"';
      const sanitized = validator.sanitizeToken(token);
      expect(sanitized).toBe('ghp_1234567890abcdefghijklmnopqrstuvwxyz');
    });

    it('should remove invalid characters', () => {
      const token = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz!@#$';
      const sanitized = validator.sanitizeToken(token);
      expect(sanitized).toBe('ghp_1234567890abcdefghijklmnopqrstuvwxyz');
    });

    it('should handle empty token', () => {
      const sanitized = validator.sanitizeToken('');
      expect(sanitized).toBe('');
    });

    it('should handle token with tabs', () => {
      const token = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz\t';
      const sanitized = validator.sanitizeToken(token);
      expect(sanitized).toBe('ghp_1234567890abcdefghijklmnopqrstuvwxyz');
    });
  });

  describe('validateToken', () => {
    it('should return error for missing token', async () => {
      const result = await validator.validateToken('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('missing or empty');
    });

    it('should return error for invalid token format', async () => {
      const result = await validator.validateToken('invalid_token');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('format is invalid');
    });

    it('should return error for short classic token', async () => {
      const result = await validator.validateToken('ghp_short');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('format is invalid');
    });

    // Note: Real API tests would require a valid token or mocking
    // These are basic format validation tests
  });

  describe('maskToken', () => {
    it('should mask token showing only first 4 characters', () => {
      const token = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz';
      const masked = validator.maskToken(token);
      expect(masked).toMatch(/^ghp_\*+$/);
      expect(masked.length).toBe(40); // 4 chars + 36 asterisks
    });

    it('should handle short tokens', () => {
      const token = 'abc';
      const masked = validator.maskToken(token);
      expect(masked).toBe('****');
    });

    it('should handle empty token', () => {
      const masked = validator.maskToken('');
      expect(masked).toBe('****');
    });
  });

  describe('getErrorGuidance', () => {
    it('should provide guidance for missing token', () => {
      const result = {
        valid: false,
        scopes: [],
        error: 'Token is missing or empty'
      };
      const guidance = validator.getErrorGuidance(result);
      expect(guidance).toContain('GITHUB_TOKEN');
      expect(guidance).toContain('.env.local');
    });

    it('should provide guidance for invalid format', () => {
      const result = {
        valid: false,
        scopes: [],
        error: 'Token format is invalid'
      };
      const guidance = validator.getErrorGuidance(result);
      expect(guidance).toContain('format is invalid');
      expect(guidance).toContain('Personal Access Token');
    });

    it('should provide guidance for expired token', () => {
      const result = {
        valid: false,
        scopes: [],
        error: 'Token is invalid or expired'
      };
      const guidance = validator.getErrorGuidance(result);
      expect(guidance).toContain('invalid or expired');
      expect(guidance).toContain('generate a new');
    });

    it('should provide guidance for insufficient permissions', () => {
      const result = {
        valid: false,
        scopes: [],
        error: 'Token is valid but has insufficient permissions'
      };
      const guidance = validator.getErrorGuidance(result);
      expect(guidance).toContain('repo');
      expect(guidance).toContain('permissions');
    });

    it('should return success message for valid token', () => {
      const result = {
        valid: true,
        scopes: ['repo'],
        username: 'testuser'
      };
      const guidance = validator.getErrorGuidance(result);
      expect(guidance).toBe('Token is valid');
    });
  });
});
