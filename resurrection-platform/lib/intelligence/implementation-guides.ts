/**
 * Implementation Guides
 * 
 * Detailed step-by-step guides for implementing SAP standard alternatives.
 * Provides comprehensive instructions for developers and functional consultants.
 */

import type { SAPStandard } from './sap-standards-kb';

export interface ImplementationStep {
  stepNumber: number;
  title: string;
  description: string;
  transactionCode?: string;
  codeSnippet?: string;
  notes?: string[];
  estimatedTime?: string;
}

export interface ImplementationGuide {
  standardId: string;
  standardName: string;
  overview: string;
  prerequisites: string[];
  steps: ImplementationStep[];
  testing: string[];
  rollback: string[];
  bestPractices: string[];
  commonPitfalls: string[];
  additionalResources: string[];
}

/**
 * Get implementation guide for a standard
 */
export function getImplementationGuide(standard: SAPStandard): ImplementationGuide {
  switch (standard.type) {
    case 'BAPI':
      return getBAPIImplementationGuide(standard);
    case 'TRANSACTION':
      return getTransactionImplementationGuide(standard);
    case 'PATTERN':
      return getPatternImplementationGuide(standard);
    default:
      return getGenericImplementationGuide(standard);
  }
}

/**
 * BAPI Implementation Guide
 */
function getBAPIImplementationGuide(standard: SAPStandard): ImplementationGuide {
  return {
    standardId: standard.id,
    standardName: standard.name,
    overview: `This guide walks you through replacing custom ABAP code with the SAP standard BAPI ${standard.name}. ${standard.description}`,
    
    prerequisites: [
      'Development access to SAP system',
      'Authorization to call BAPIs',
      'Understanding of BAPI return message handling',
      'Knowledge of commit work patterns',
      'Test system for validation'
    ],
    
    steps: [
      {
        stepNumber: 1,
        title: 'Analyze Current Custom Code',
        description: 'Review your custom code to understand the business logic and data flow.',
        notes: [
          'Document input parameters',
          'Identify data transformations',
          'Note error handling logic',
          'List all database tables accessed'
        ],
        estimatedTime: '2-4 hours'
      },
      {
        stepNumber: 2,
        title: 'Study BAPI Documentation',
        description: `Review SAP documentation for ${standard.name} to understand parameters and behavior.`,
        transactionCode: 'BAPI',
        notes: [
          'Use transaction BAPI to explore BAPI structure',
          'Review import/export parameters',
          'Understand table parameters',
          'Check for mandatory fields'
        ],
        estimatedTime: '1-2 hours'
      },
      {
        stepNumber: 3,
        title: 'Map Data Structures',
        description: 'Create mapping between your custom data and BAPI structures.',
        codeSnippet: `* Data declarations
DATA: ls_header TYPE bapisd00,
      lt_items  TYPE TABLE OF bapisd01,
      lt_return TYPE TABLE OF bapiret2.

* Map your custom data
ls_header-doc_type = custom_data-order_type.
ls_header-sales_org = custom_data-sales_org.
" ... continue mapping`,
        notes: [
          'Use SE11 to view BAPI structure definitions',
          'Handle data type conversions carefully',
          'Consider default values'
        ],
        estimatedTime: '2-3 hours'
      },
      {
        stepNumber: 4,
        title: 'Implement BAPI Call',
        description: 'Replace custom logic with BAPI function call.',
        codeSnippet: `CALL FUNCTION '${standard.name}'
  EXPORTING
    " Add your mapped parameters
  IMPORTING
    " Add return parameters
  TABLES
    return = lt_return.

* Check for errors
LOOP AT lt_return INTO DATA(ls_return) WHERE type CA 'AEX'.
  " Handle errors/warnings
  MESSAGE ls_return-message TYPE ls_return-type.
ENDLOOP.`,
        notes: [
          'Always check return table for errors',
          'Handle all message types (E, A, X, W, I, S)',
          'Use test mode first (if available)'
        ],
        estimatedTime: '3-4 hours'
      },
      {
        stepNumber: 5,
        title: 'Implement Commit Logic',
        description: 'Add proper commit work after successful BAPI execution.',
        codeSnippet: `IF sy-subrc = 0.
  CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
    EXPORTING
      wait = 'X'
    IMPORTING
      return = ls_return.
      
  IF ls_return-type = 'E'.
    " Commit failed
    CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
  ENDIF.
ENDIF.`,
        notes: [
          'Always commit after successful BAPI',
          'Use WAIT = X for synchronous commit',
          'Implement rollback for errors'
        ],
        estimatedTime: '1 hour'
      },
      {
        stepNumber: 6,
        title: 'Add Error Handling',
        description: 'Implement comprehensive error handling and logging.',
        codeSnippet: `* Collect all errors
DATA: lv_error_msg TYPE string.

LOOP AT lt_return INTO ls_return WHERE type = 'E'.
  lv_error_msg = |{ lv_error_msg } { ls_return-message }|.
ENDLOOP.

IF lv_error_msg IS NOT INITIAL.
  " Log error
  CALL FUNCTION 'BAL_LOG_MSG_ADD'
    " ... logging parameters
  
  " Raise exception or return error
  RAISE EXCEPTION TYPE zcx_custom_error
    EXPORTING
      textid = zcx_custom_error=>bapi_error
      msg    = lv_error_msg.
ENDIF.`,
        notes: [
          'Log all errors for troubleshooting',
          'Provide meaningful error messages to users',
          'Consider retry logic for transient errors'
        ],
        estimatedTime: '2 hours'
      },
      {
        stepNumber: 7,
        title: 'Unit Testing',
        description: 'Create unit tests to validate BAPI integration.',
        notes: [
          'Test with valid data',
          'Test with invalid data',
          'Test boundary conditions',
          'Verify error handling',
          'Compare results with old custom code'
        ],
        estimatedTime: '4-6 hours'
      }
    ],
    
    testing: [
      'Test in development system with sample data',
      'Verify all business rules are preserved',
      'Test error scenarios (invalid data, authorization failures)',
      'Performance testing with production-like volumes',
      'User acceptance testing',
      'Parallel run with custom code (if possible)'
    ],
    
    rollback: [
      'Keep custom code commented out initially',
      'Document all changes made',
      'Have rollback script ready',
      'Test rollback procedure in development',
      'Monitor production closely after go-live'
    ],
    
    bestPractices: [
      'Always use BAPI_TRANSACTION_COMMIT after successful BAPI calls',
      'Check return table for ALL message types, not just errors',
      'Use test mode parameter if BAPI supports it',
      'Implement proper exception handling',
      'Log all BAPI calls for audit trail',
      'Use BAPI wrapper functions for reusability',
      'Document parameter mappings',
      'Follow SAP naming conventions'
    ],
    
    commonPitfalls: [
      'Forgetting to commit after BAPI call',
      'Not checking return messages properly',
      'Ignoring warning messages',
      'Incorrect data type conversions',
      'Missing mandatory parameters',
      'Not handling authorization errors',
      'Insufficient error logging',
      'Not testing with production data volumes'
    ],
    
    additionalResources: [
      standard.sapDocUrl || 'SAP Help Portal',
      'Transaction BAPI - BAPI Explorer',
      'Transaction SE37 - Function Module Display',
      'SAP Community - BAPI Best Practices',
      'SAP Note search for known issues'
    ]
  };
}

/**
 * Transaction Implementation Guide
 */
function getTransactionImplementationGuide(standard: SAPStandard): ImplementationGuide {
  return {
    standardId: standard.id,
    standardName: standard.name,
    overview: `Replace custom program with SAP standard transaction ${standard.name}. ${standard.description}`,
    
    prerequisites: [
      'Functional knowledge of the business process',
      'Authorization to execute transaction',
      'Understanding of transaction configuration',
      'Access to customizing (if needed)',
      'User training materials'
    ],
    
    steps: [
      {
        stepNumber: 1,
        title: 'Analyze Custom Program',
        description: 'Document what your custom program does and why it was created.',
        notes: [
          'List all features used',
          'Identify custom validations',
          'Note any special workflows',
          'Document user requirements'
        ],
        estimatedTime: '2-3 hours'
      },
      {
        stepNumber: 2,
        title: 'Explore Standard Transaction',
        description: `Test transaction ${standard.name} to understand its capabilities.`,
        transactionCode: standard.name,
        notes: [
          'Try all menu options',
          'Test with sample data',
          'Check available reports',
          'Review help documentation'
        ],
        estimatedTime: '2-4 hours'
      },
      {
        stepNumber: 3,
        title: 'Gap Analysis',
        description: 'Identify gaps between custom program and standard transaction.',
        notes: [
          'List features in custom but not in standard',
          'Identify workarounds for gaps',
          'Determine if gaps are business-critical',
          'Consider user exits or enhancements if needed'
        ],
        estimatedTime: '3-4 hours'
      },
      {
        stepNumber: 4,
        title: 'Configure Transaction',
        description: 'Set up transaction parameters and defaults.',
        notes: [
          'Configure default values',
          'Set up field properties',
          'Configure authorization',
          'Set up variants for common scenarios'
        ],
        estimatedTime: '2-3 hours'
      },
      {
        stepNumber: 5,
        title: 'Create User Documentation',
        description: 'Prepare training materials and user guides.',
        notes: [
          'Create step-by-step guides',
          'Include screenshots',
          'Document common scenarios',
          'Prepare FAQ'
        ],
        estimatedTime: '4-6 hours'
      },
      {
        stepNumber: 6,
        title: 'User Training',
        description: 'Train users on the standard transaction.',
        notes: [
          'Conduct training sessions',
          'Provide hands-on practice',
          'Address user concerns',
          'Collect feedback'
        ],
        estimatedTime: '1-2 days'
      },
      {
        stepNumber: 7,
        title: 'Pilot Testing',
        description: 'Run pilot with selected users.',
        notes: [
          'Select representative users',
          'Monitor usage closely',
          'Collect feedback',
          'Address issues quickly'
        ],
        estimatedTime: '1-2 weeks'
      }
    ],
    
    testing: [
      'Test all business scenarios',
      'Verify data accuracy',
      'Test with different user roles',
      'Performance testing',
      'Integration testing with other systems',
      'User acceptance testing'
    ],
    
    rollback: [
      'Keep custom program available',
      'Document rollback procedure',
      'Have support team ready',
      'Monitor user adoption',
      'Be prepared to extend pilot phase'
    ],
    
    bestPractices: [
      'Involve users early in the process',
      'Provide adequate training',
      'Create transaction variants for common scenarios',
      'Document configuration changes',
      'Use standard transaction as-is when possible',
      'Consider user exits only for critical gaps',
      'Monitor usage after go-live'
    ],
    
    commonPitfalls: [
      'Insufficient user training',
      'Not involving users in testing',
      'Trying to replicate custom program exactly',
      'Inadequate documentation',
      'Rushing the rollout',
      'Not having support plan',
      'Ignoring user feedback'
    ],
    
    additionalResources: [
      standard.sapDocUrl || 'SAP Help Portal',
      `Transaction ${standard.name} - F1 Help`,
      'SAP Community forums',
      'SAP Training courses',
      'Internal knowledge base'
    ]
  };
}

/**
 * Pattern Implementation Guide
 */
function getPatternImplementationGuide(standard: SAPStandard): ImplementationGuide {
  const guides: Record<string, ImplementationGuide> = {
    'PRICING_PROCEDURE': {
      standardId: standard.id,
      standardName: standard.name,
      overview: 'Replace custom pricing logic with SAP standard pricing procedure. This provides a flexible, configurable pricing engine.',
      
      prerequisites: [
        'SD module configuration knowledge',
        'Understanding of condition technique',
        'Access to pricing customizing',
        'Knowledge of pricing requirements',
        'Test system for configuration'
      ],
      
      steps: [
        {
          stepNumber: 1,
          title: 'Analyze Custom Pricing Logic',
          description: 'Document all pricing rules, discounts, and calculations.',
          notes: [
            'List all pricing elements',
            'Document calculation sequence',
            'Identify dependencies',
            'Note special cases'
          ],
          estimatedTime: '4-6 hours'
        },
        {
          stepNumber: 2,
          title: 'Define Condition Types',
          description: 'Create condition types for each pricing element.',
          transactionCode: 'V/06',
          notes: [
            'Create condition types for prices, discounts, surcharges',
            'Define calculation type (percentage, fixed amount)',
            'Set up access sequences',
            'Configure validity periods'
          ],
          estimatedTime: '3-4 hours'
        },
        {
          stepNumber: 3,
          title: 'Create Pricing Procedure',
          description: 'Build pricing procedure with calculation schema.',
          transactionCode: 'V/08',
          codeSnippet: `* Pricing Procedure Example:
Step  Cond.Type  Description          From  To/% 
10    PR00       Base Price           
20    K004       Material Discount    10    -5%
30    K005       Customer Discount    20    -10%
40    MWST       Tax                  30    +19%`,
          notes: [
            'Define step sequence',
            'Set up subtotals',
            'Configure requirements and formulas',
            'Test calculation logic'
          ],
          estimatedTime: '4-6 hours'
        },
        {
          stepNumber: 4,
          title: 'Maintain Condition Records',
          description: 'Enter pricing data into condition tables.',
          transactionCode: 'VK11',
          notes: [
            'Create condition records for each condition type',
            'Set validity dates',
            'Define scales if needed',
            'Test with sample orders'
          ],
          estimatedTime: '2-4 hours'
        },
        {
          stepNumber: 5,
          title: 'Assign to Sales Area',
          description: 'Link pricing procedure to organizational units.',
          transactionCode: 'OVKK',
          notes: [
            'Assign to sales organization',
            'Link to customer pricing procedure',
            'Configure document pricing procedure',
            'Test assignment'
          ],
          estimatedTime: '1-2 hours'
        },
        {
          stepNumber: 6,
          title: 'Test Pricing',
          description: 'Validate pricing calculations.',
          transactionCode: 'VA01',
          notes: [
            'Create test orders',
            'Verify all pricing elements',
            'Check calculation sequence',
            'Validate against custom logic'
          ],
          estimatedTime: '4-6 hours'
        }
      ],
      
      testing: [
        'Test all pricing scenarios',
        'Verify discount calculations',
        'Test with different customer groups',
        'Validate tax calculations',
        'Performance testing with large orders',
        'Compare with custom pricing results'
      ],
      
      rollback: [
        'Keep custom pricing code',
        'Document configuration changes',
        'Have backup of condition records',
        'Test rollback in development',
        'Plan for data migration back if needed'
      ],
      
      bestPractices: [
        'Use standard condition types when possible',
        'Document pricing procedure logic',
        'Use requirements and formulas for complex logic',
        'Maintain condition records regularly',
        'Use mass maintenance for bulk updates',
        'Test thoroughly before go-live',
        'Train pricing team on maintenance'
      ],
      
      commonPitfalls: [
        'Overly complex pricing procedures',
        'Not testing all scenarios',
        'Incorrect step sequence',
        'Missing subtotals',
        'Not maintaining condition records',
        'Insufficient documentation',
        'Not training maintenance team'
      ],
      
      additionalResources: [
        'SAP SD Pricing Configuration Guide',
        'Transaction V/08 - Pricing Procedures',
        'Transaction VK11 - Condition Maintenance',
        'SAP Community - Pricing Best Practices',
        'SAP Training - SD Pricing'
      ]
    },
    
    'AUTHORIZATION_OBJECT': {
      standardId: standard.id,
      standardName: standard.name,
      overview: 'Replace custom authorization checks with SAP authorization objects for proper security.',
      
      prerequisites: [
        'Security administration knowledge',
        'Understanding of authorization concept',
        'Access to role maintenance',
        'Knowledge of business requirements',
        'Test users for validation'
      ],
      
      steps: [
        {
          stepNumber: 1,
          title: 'Analyze Custom Authorization Logic',
          description: 'Document current authorization checks.',
          notes: [
            'List all authorization points',
            'Document check criteria',
            'Identify user groups',
            'Note special cases'
          ],
          estimatedTime: '2-3 hours'
        },
        {
          stepNumber: 2,
          title: 'Select Authorization Object',
          description: 'Choose appropriate SAP authorization object.',
          transactionCode: 'SU21',
          notes: [
            'Search for existing objects',
            'Review object fields',
            'Check if custom object needed',
            'Document selection rationale'
          ],
          estimatedTime: '1-2 hours'
        },
        {
          stepNumber: 3,
          title: 'Implement Authorization Checks',
          description: 'Add AUTHORITY-CHECK statements to code.',
          codeSnippet: `AUTHORITY-CHECK OBJECT 'V_VBAK_VKO'
  ID 'VKORG' FIELD sales_org
  ID 'VTWEG' FIELD distribution_channel
  ID 'SPART' FIELD division
  ID 'ACTVT' FIELD '02'.  "Change

IF sy-subrc <> 0.
  MESSAGE 'No authorization for this sales area' TYPE 'E'.
ENDIF.`,
          notes: [
            'Add checks at appropriate points',
            'Use correct activity codes',
            'Provide meaningful error messages',
            'Test with different users'
          ],
          estimatedTime: '3-4 hours'
        },
        {
          stepNumber: 4,
          title: 'Create/Update Roles',
          description: 'Configure roles with authorization object.',
          transactionCode: 'PFCG',
          notes: [
            'Create or update roles',
            'Add authorization object',
            'Set field values',
            'Generate profiles'
          ],
          estimatedTime: '2-3 hours'
        },
        {
          stepNumber: 5,
          title: 'Assign Roles to Users',
          description: 'Grant appropriate roles to users.',
          transactionCode: 'SU01',
          notes: [
            'Review user requirements',
            'Assign roles',
            'Test access',
            'Document assignments'
          ],
          estimatedTime: '1-2 hours'
        },
        {
          stepNumber: 6,
          title: 'Test Authorization',
          description: 'Validate authorization checks.',
          transactionCode: 'SU53',
          notes: [
            'Test with different users',
            'Verify access granted/denied correctly',
            'Check error messages',
            'Use SU53 to debug failures'
          ],
          estimatedTime: '3-4 hours'
        }
      ],
      
      testing: [
        'Test with users having different roles',
        'Verify access is granted correctly',
        'Verify access is denied correctly',
        'Test all authorization points',
        'Check error messages',
        'Security audit'
      ],
      
      rollback: [
        'Keep custom authorization code',
        'Document role changes',
        'Have backup of role definitions',
        'Test rollback procedure',
        'Plan for user communication'
      ],
      
      bestPractices: [
        'Use standard authorization objects when possible',
        'Follow least privilege principle',
        'Document authorization concept',
        'Regular security audits',
        'Use composite roles for simplicity',
        'Test thoroughly before go-live',
        'Train security team'
      ],
      
      commonPitfalls: [
        'Too granular authorization',
        'Not testing with real users',
        'Incorrect activity codes',
        'Missing authorization checks',
        'Poor error messages',
        'Not documenting changes',
        'Insufficient testing'
      ],
      
      additionalResources: [
        'SAP Security Guide',
        'Transaction SU21 - Authorization Objects',
        'Transaction PFCG - Role Maintenance',
        'SAP Community - Security Best Practices',
        'SAP Training - Security Administration'
      ]
    }
  };
  
  return guides[standard.id] || getGenericImplementationGuide(standard);
}

/**
 * Generic Implementation Guide
 */
function getGenericImplementationGuide(standard: SAPStandard): ImplementationGuide {
  return {
    standardId: standard.id,
    standardName: standard.name,
    overview: `Implementation guide for ${standard.name}. ${standard.description}`,
    
    prerequisites: [
      'Understanding of business requirements',
      'Access to SAP system',
      'Development/configuration authorization',
      'Test environment',
      'Documentation of current process'
    ],
    
    steps: [
      {
        stepNumber: 1,
        title: 'Analyze Current Solution',
        description: 'Document existing custom solution.',
        estimatedTime: '2-4 hours'
      },
      {
        stepNumber: 2,
        title: 'Study Standard Functionality',
        description: `Review ${standard.name} capabilities.`,
        estimatedTime: '2-4 hours'
      },
      {
        stepNumber: 3,
        title: 'Gap Analysis',
        description: 'Identify differences and workarounds.',
        estimatedTime: '2-3 hours'
      },
      {
        stepNumber: 4,
        title: 'Implementation',
        description: 'Implement standard solution.',
        estimatedTime: '4-8 hours'
      },
      {
        stepNumber: 5,
        title: 'Testing',
        description: 'Validate implementation.',
        estimatedTime: '4-6 hours'
      },
      {
        stepNumber: 6,
        title: 'Go-Live',
        description: 'Deploy to production.',
        estimatedTime: '2-4 hours'
      }
    ],
    
    testing: [
      'Functional testing',
      'Integration testing',
      'Performance testing',
      'User acceptance testing'
    ],
    
    rollback: [
      'Keep custom solution available',
      'Document rollback steps',
      'Test rollback procedure',
      'Have support plan ready'
    ],
    
    bestPractices: [
      'Follow SAP best practices',
      'Document all changes',
      'Test thoroughly',
      'Train users',
      'Monitor after go-live'
    ],
    
    commonPitfalls: [
      'Insufficient testing',
      'Poor documentation',
      'Inadequate training',
      'Rushing implementation',
      'Not having rollback plan'
    ],
    
    additionalResources: [
      standard.sapDocUrl || 'SAP Help Portal',
      'SAP Community',
      'SAP Training',
      'Internal documentation'
    ]
  };
}

/**
 * Format implementation guide as markdown
 */
export function formatGuideAsMarkdown(guide: ImplementationGuide): string {
  let md = `# Implementation Guide: ${guide.standardName}\n\n`;
  
  md += `## Overview\n${guide.overview}\n\n`;
  
  md += `## Prerequisites\n`;
  guide.prerequisites.forEach(prereq => {
    md += `- ${prereq}\n`;
  });
  md += `\n`;
  
  md += `## Implementation Steps\n\n`;
  guide.steps.forEach(step => {
    md += `### Step ${step.stepNumber}: ${step.title}\n`;
    md += `${step.description}\n\n`;
    
    if (step.transactionCode) {
      md += `**Transaction Code:** ${step.transactionCode}\n\n`;
    }
    
    if (step.codeSnippet) {
      md += `\`\`\`abap\n${step.codeSnippet}\n\`\`\`\n\n`;
    }
    
    if (step.notes && step.notes.length > 0) {
      md += `**Notes:**\n`;
      step.notes.forEach(note => {
        md += `- ${note}\n`;
      });
      md += `\n`;
    }
    
    if (step.estimatedTime) {
      md += `**Estimated Time:** ${step.estimatedTime}\n\n`;
    }
  });
  
  md += `## Testing\n`;
  guide.testing.forEach(test => {
    md += `- ${test}\n`;
  });
  md += `\n`;
  
  md += `## Rollback Plan\n`;
  guide.rollback.forEach(step => {
    md += `- ${step}\n`;
  });
  md += `\n`;
  
  md += `## Best Practices\n`;
  guide.bestPractices.forEach(practice => {
    md += `- ${practice}\n`;
  });
  md += `\n`;
  
  md += `## Common Pitfalls\n`;
  guide.commonPitfalls.forEach(pitfall => {
    md += `- ${pitfall}\n`;
  });
  md += `\n`;
  
  md += `## Additional Resources\n`;
  guide.additionalResources.forEach(resource => {
    md += `- ${resource}\n`;
  });
  
  return md;
}
