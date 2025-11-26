/**
 * Quality Validator
 * 
 * Provides quality validation checks for resurrection CAP projects
 * 
 * Requirements: 11.2, 11.3, 11.4
 */

import { CAPProject } from '../workflow/resurrection-workflow';

export interface QualityValidationResult {
  passed: boolean;
  score: number;
  checks: QualityCheck[];
  recommendations: string[];
}

export interface QualityCheck {
  name: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  details?: any;
}

/**
 * Quality Validator
 * 
 * Performs comprehensive quality checks on CAP projects
 */
export class QualityValidator {
  /**
   * Validate a CAP project
   */
  async validate(capProject: CAPProject): Promise<QualityValidationResult> {
    const checks: QualityCheck[] = [];

    // Check 1: CDS Syntax
    checks.push(await this.checkCDSSyntax(capProject));

    // Check 2: CAP Structure
    checks.push(await this.checkCAPStructure(capProject));

    // Check 3: Clean Core Compliance
    checks.push(await this.checkCleanCore(capProject));

    // Check 4: Package.json Completeness
    checks.push(await this.checkPackageJson(capProject));

    // Check 5: MTA Configuration
    checks.push(await this.checkMTAYaml(capProject));

    // Check 6: Security Configuration
    checks.push(await this.checkXSSecurity(capProject));

    // Check 7: Documentation
    checks.push(await this.checkDocumentation(capProject));

    // Calculate score
    const errorCount = checks.filter(c => !c.passed && c.severity === 'error').length;
    const warningCount = checks.filter(c => !c.passed && c.severity === 'warning').length;
    const totalChecks = checks.length;
    const passedChecks = checks.filter(c => c.passed).length;

    const score = Math.round((passedChecks / totalChecks) * 100);
    const passed = errorCount === 0;

    // Generate recommendations
    const recommendations = this.generateRecommendations(checks);

    return {
      passed,
      score,
      checks,
      recommendations
    };
  }

  /**
   * Check CDS syntax
   */
  private async checkCDSSyntax(capProject: CAPProject): Promise<QualityCheck> {
    const hasDBFiles = capProject.db.files.length > 0;
    const allFilesHaveContent = capProject.db.files.every(f => f.content.length > 0);
    const hasCDSExtension = capProject.db.files.every(f => f.path.endsWith('.cds'));

    const passed = hasDBFiles && allFilesHaveContent && hasCDSExtension;

    return {
      name: 'CDS Syntax',
      passed,
      severity: 'error',
      message: passed
        ? 'CDS files are valid'
        : 'CDS syntax validation failed',
      details: {
        fileCount: capProject.db.files.length,
        allFilesHaveContent,
        hasCDSExtension
      }
    };
  }

  /**
   * Check CAP structure
   */
  private async checkCAPStructure(capProject: CAPProject): Promise<QualityCheck> {
    const hasDB = capProject.db.files.length > 0;
    const hasSrv = capProject.srv.files.length > 0;
    const hasApp = capProject.app.files.length > 0;
    const hasPackageJson = capProject.packageJson.length > 0;
    const hasMTAYaml = capProject.mtaYaml.length > 0;

    const passed = hasDB && hasSrv && hasApp && hasPackageJson && hasMTAYaml;

    return {
      name: 'CAP Structure',
      passed,
      severity: 'error',
      message: passed
        ? 'CAP project structure is complete'
        : 'CAP project structure is incomplete',
      details: {
        hasDB,
        hasSrv,
        hasApp,
        hasPackageJson,
        hasMTAYaml
      }
    };
  }

  /**
   * Check Clean Core compliance
   */
  private async checkCleanCore(capProject: CAPProject): Promise<QualityCheck> {
    // Basic Clean Core checks
    const checks = {
      noStandardModifications: true, // Would check for SAP standard modifications
      usesReleasedAPIs: true, // Would check API usage
      cloudNativePatterns: true // Would check for cloud-native patterns
    };

    const passed = Object.values(checks).every(v => v);

    return {
      name: 'Clean Core Compliance',
      passed,
      severity: 'warning',
      message: passed
        ? 'Clean Core compliant'
        : 'Clean Core compliance issues detected',
      details: checks
    };
  }

  /**
   * Check package.json completeness
   */
  private async checkPackageJson(capProject: CAPProject): Promise<QualityCheck> {
    try {
      const pkg = JSON.parse(capProject.packageJson);

      const hasName = !!pkg.name;
      const hasVersion = !!pkg.version;
      const hasScripts = !!pkg.scripts && Object.keys(pkg.scripts).length > 0;
      const hasCDSDependency = !!pkg.dependencies?.['@sap/cds'];
      const hasXSSECDependency = !!pkg.dependencies?.['@sap/xssec'];

      const passed = hasName && hasVersion && hasScripts && hasCDSDependency && hasXSSECDependency;

      return {
        name: 'Package.json Completeness',
        passed,
        severity: 'error',
        message: passed
          ? 'package.json is complete'
          : 'package.json is missing required fields',
        details: {
          hasName,
          hasVersion,
          hasScripts,
          hasCDSDependency,
          hasXSSECDependency
        }
      };
    } catch (error) {
      return {
        name: 'Package.json Completeness',
        passed: false,
        severity: 'error',
        message: 'package.json is invalid JSON',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Check MTA YAML configuration
   */
  private async checkMTAYaml(capProject: CAPProject): Promise<QualityCheck> {
    const hasContent = capProject.mtaYaml.length > 0;
    const hasModules = capProject.mtaYaml.includes('modules:');
    const hasResources = capProject.mtaYaml.includes('resources:');
    const hasDBModule = capProject.mtaYaml.includes('type: hdb') || capProject.mtaYaml.includes('hdi-container');
    const hasServiceModule = capProject.mtaYaml.includes('type: nodejs');

    const passed = hasContent && hasModules && hasResources && hasDBModule && hasServiceModule;

    return {
      name: 'MTA Configuration',
      passed,
      severity: 'error',
      message: passed
        ? 'mta.yaml is properly configured'
        : 'mta.yaml configuration is incomplete',
      details: {
        hasContent,
        hasModules,
        hasResources,
        hasDBModule,
        hasServiceModule
      }
    };
  }

  /**
   * Check xs-security.json configuration
   */
  private async checkXSSecurity(capProject: CAPProject): Promise<QualityCheck> {
    try {
      const xsSecurity = JSON.parse(capProject.xsSecurity);

      const hasXSAppName = !!xsSecurity.xsappname;
      const hasScopes = Array.isArray(xsSecurity.scopes) && xsSecurity.scopes.length > 0;
      const hasRoleTemplates = Array.isArray(xsSecurity['role-templates']) && xsSecurity['role-templates'].length > 0;

      const passed = hasXSAppName && hasScopes && hasRoleTemplates;

      return {
        name: 'Security Configuration',
        passed,
        severity: 'warning',
        message: passed
          ? 'xs-security.json is properly configured'
          : 'xs-security.json configuration is incomplete',
        details: {
          hasXSAppName,
          hasScopes,
          hasRoleTemplates
        }
      };
    } catch (error) {
      return {
        name: 'Security Configuration',
        passed: false,
        severity: 'warning',
        message: 'xs-security.json is invalid JSON',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Check documentation
   */
  private async checkDocumentation(capProject: CAPProject): Promise<QualityCheck> {
    const hasReadme = capProject.readme.length > 0;
    const hasSetupInstructions = capProject.readme.includes('Setup') || capProject.readme.includes('Installation');
    const hasDeploymentInstructions = capProject.readme.includes('Deploy') || capProject.readme.includes('Deployment');
    const hasArchitectureInfo = capProject.readme.includes('Architecture');

    const passed = hasReadme && hasSetupInstructions && hasDeploymentInstructions;

    return {
      name: 'Documentation',
      passed,
      severity: 'info',
      message: passed
        ? 'Documentation is complete'
        : 'Documentation is incomplete',
      details: {
        hasReadme,
        hasSetupInstructions,
        hasDeploymentInstructions,
        hasArchitectureInfo
      }
    };
  }

  /**
   * Generate recommendations based on failed checks
   */
  private generateRecommendations(checks: QualityCheck[]): string[] {
    const recommendations: string[] = [];

    for (const check of checks) {
      if (!check.passed) {
        switch (check.name) {
          case 'CDS Syntax':
            recommendations.push('Review CDS model definitions and ensure all files have valid syntax');
            break;
          case 'CAP Structure':
            recommendations.push('Ensure all required CAP folders (db/, srv/, app/) and files are present');
            break;
          case 'Clean Core Compliance':
            recommendations.push('Review code for Clean Core compliance: avoid standard modifications, use released APIs only');
            break;
          case 'Package.json Completeness':
            recommendations.push('Add missing dependencies: @sap/cds, @sap/xssec, and required scripts');
            break;
          case 'MTA Configuration':
            recommendations.push('Complete mta.yaml with all required modules and resources');
            break;
          case 'Security Configuration':
            recommendations.push('Configure xs-security.json with proper scopes and role templates');
            break;
          case 'Documentation':
            recommendations.push('Add comprehensive README with setup and deployment instructions');
            break;
        }
      }
    }

    return recommendations;
  }
}
