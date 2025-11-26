/**
 * SAP Standard Knowledge Base
 * 
 * Contains comprehensive knowledge of SAP standard functionality including:
 * - BAPIs (Business Application Programming Interfaces)
 * - Standard transactions
 * - Standard tables
 * - Standard patterns (pricing, authorization, number ranges)
 * 
 * Used for fit-to-standard recommendations to reduce custom code.
 */

export interface SAPStandard {
  id: string;
  type: 'BAPI' | 'TRANSACTION' | 'TABLE' | 'PATTERN' | 'API';
  name: string;
  module: 'SD' | 'MM' | 'FI' | 'CO' | 'HR' | 'PP' | 'CROSS';
  description: string;
  useCases: string[];
  parameters?: Record<string, string>;
  relatedObjects?: string[];
  cleanCoreCompliant: boolean;
  sapDocUrl?: string;
}

/**
 * SAP Standard BAPIs
 */
export const SAP_BAPIS: SAPStandard[] = [
  // Sales & Distribution (SD)
  {
    id: 'BAPI_SALESORDER_CREATEFROMDAT2',
    type: 'BAPI',
    name: 'BAPI_SALESORDER_CREATEFROMDAT2',
    module: 'SD',
    description: 'Create sales order from data',
    useCases: [
      'Create sales orders programmatically',
      'Order entry automation',
      'Integration with external systems',
      'Batch order creation'
    ],
    parameters: {
      ORDER_HEADER_IN: 'Sales order header data',
      ORDER_ITEMS_IN: 'Sales order item data',
      ORDER_PARTNERS: 'Partner data',
      ORDER_SCHEDULES_IN: 'Schedule line data',
      RETURN: 'Return messages'
    },
    relatedObjects: ['VBAK', 'VBAP', 'VBPA'],
    cleanCoreCompliant: true,
    sapDocUrl: 'https://help.sap.com/doc/saphelp_nw75/7.5.5/en-US/9f/db9c3c48c11d1f9f5e0000e8322d00/content.htm'
  },
  {
    id: 'BAPI_SALESORDER_CHANGE',
    type: 'BAPI',
    name: 'BAPI_SALESORDER_CHANGE',
    module: 'SD',
    description: 'Change existing sales order',
    useCases: [
      'Update order quantities',
      'Change delivery dates',
      'Modify pricing',
      'Update partner information'
    ],
    parameters: {
      SALESDOCUMENT: 'Sales document number',
      ORDER_HEADER_IN: 'Header changes',
      ORDER_HEADER_INX: 'Header change indicators',
      RETURN: 'Return messages'
    },
    relatedObjects: ['VBAK', 'VBAP'],
    cleanCoreCompliant: true
  },
  {
    id: 'BAPI_SALESORDER_SIMULATE',
    type: 'BAPI',
    name: 'BAPI_SALESORDER_SIMULATE',
    module: 'SD',
    description: 'Simulate sales order without saving',
    useCases: [
      'Price simulation',
      'Availability check',
      'Credit limit check',
      'What-if analysis'
    ],
    parameters: {
      ORDER_HEADER_IN: 'Header data',
      ORDER_ITEMS_IN: 'Item data',
      RETURN: 'Return messages'
    },
    relatedObjects: ['VBAK', 'VBAP', 'KONV'],
    cleanCoreCompliant: true
  },
  
  // Materials Management (MM)
  {
    id: 'BAPI_PO_CREATE1',
    type: 'BAPI',
    name: 'BAPI_PO_CREATE1',
    module: 'MM',
    description: 'Create purchase order',
    useCases: [
      'Automated procurement',
      'Purchase order creation',
      'Vendor order management',
      'Integration with procurement systems'
    ],
    parameters: {
      PO_HEADER: 'PO header data',
      PO_ITEMS: 'PO item data',
      PO_ITEM_SCHEDULES: 'Schedule lines',
      RETURN: 'Return messages'
    },
    relatedObjects: ['EKKO', 'EKPO', 'LFA1'],
    cleanCoreCompliant: true
  },
  {
    id: 'BAPI_MATERIAL_SAVEDATA',
    type: 'BAPI',
    name: 'BAPI_MATERIAL_SAVEDATA',
    module: 'MM',
    description: 'Create or change material master',
    useCases: [
      'Material master creation',
      'Material data updates',
      'Mass material maintenance',
      'MDM integration'
    ],
    parameters: {
      HEADDATA: 'Material header',
      CLIENTDATA: 'Client-specific data',
      PLANTDATA: 'Plant-specific data',
      RETURN: 'Return messages'
    },
    relatedObjects: ['MARA', 'MARC', 'MARD'],
    cleanCoreCompliant: true
  },
  
  // Financial Accounting (FI)
  {
    id: 'BAPI_ACC_DOCUMENT_POST',
    type: 'BAPI',
    name: 'BAPI_ACC_DOCUMENT_POST',
    module: 'FI',
    description: 'Post accounting document',
    useCases: [
      'Journal entry posting',
      'Financial document creation',
      'Integration with external systems',
      'Automated accounting'
    ],
    parameters: {
      DOCUMENTHEADER: 'Document header',
      ACCOUNTGL: 'G/L account items',
      ACCOUNTRECEIVABLE: 'Customer items',
      ACCOUNTPAYABLE: 'Vendor items',
      RETURN: 'Return messages'
    },
    relatedObjects: ['BKPF', 'BSEG', 'SKA1'],
    cleanCoreCompliant: true
  },
  {
    id: 'BAPI_CUSTOMER_GETDETAIL',
    type: 'BAPI',
    name: 'BAPI_CUSTOMER_GETDETAIL',
    module: 'FI',
    description: 'Get customer master data',
    useCases: [
      'Customer data retrieval',
      'Credit limit checks',
      'Customer information display',
      'CRM integration'
    ],
    parameters: {
      CUSTOMERNO: 'Customer number',
      CUSTOMERADDRESS: 'Address data',
      CUSTOMERGENERALDETAIL: 'General data',
      RETURN: 'Return messages'
    },
    relatedObjects: ['KNA1', 'KNVV', 'KNVP'],
    cleanCoreCompliant: true
  },
  
  // Controlling (CO)
  {
    id: 'BAPI_COSTCENTER_CREATEMULTIPLE',
    type: 'BAPI',
    name: 'BAPI_COSTCENTER_CREATEMULTIPLE',
    module: 'CO',
    description: 'Create multiple cost centers',
    useCases: [
      'Cost center creation',
      'Organizational structure setup',
      'Mass cost center maintenance'
    ],
    parameters: {
      COSTCENTER_LIST: 'Cost center data',
      RETURN: 'Return messages'
    },
    relatedObjects: ['CSKS', 'CSKT'],
    cleanCoreCompliant: true
  }
];

/**
 * SAP Standard Transactions
 */
export const SAP_TRANSACTIONS: SAPStandard[] = [
  {
    id: 'VA01',
    type: 'TRANSACTION',
    name: 'VA01',
    module: 'SD',
    description: 'Create Sales Order',
    useCases: [
      'Manual sales order entry',
      'Order creation with full validation',
      'Interactive order processing'
    ],
    relatedObjects: ['VBAK', 'VBAP', 'KONV'],
    cleanCoreCompliant: true
  },
  {
    id: 'VA02',
    type: 'TRANSACTION',
    name: 'VA02',
    module: 'SD',
    description: 'Change Sales Order',
    useCases: [
      'Modify existing orders',
      'Update quantities and dates',
      'Change pricing'
    ],
    relatedObjects: ['VBAK', 'VBAP'],
    cleanCoreCompliant: true
  },
  {
    id: 'VA03',
    type: 'TRANSACTION',
    name: 'VA03',
    module: 'SD',
    description: 'Display Sales Order',
    useCases: [
      'View order details',
      'Order inquiry',
      'Status checking'
    ],
    relatedObjects: ['VBAK', 'VBAP'],
    cleanCoreCompliant: true
  },
  {
    id: 'ME21N',
    type: 'TRANSACTION',
    name: 'ME21N',
    module: 'MM',
    description: 'Create Purchase Order',
    useCases: [
      'Manual PO creation',
      'Procurement processing',
      'Vendor order management'
    ],
    relatedObjects: ['EKKO', 'EKPO'],
    cleanCoreCompliant: true
  },
  {
    id: 'MM01',
    type: 'TRANSACTION',
    name: 'MM01',
    module: 'MM',
    description: 'Create Material Master',
    useCases: [
      'New material creation',
      'Product master data',
      'Material setup'
    ],
    relatedObjects: ['MARA', 'MARC'],
    cleanCoreCompliant: true
  },
  {
    id: 'FB01',
    type: 'TRANSACTION',
    name: 'FB01',
    module: 'FI',
    description: 'Post Document',
    useCases: [
      'Manual journal entries',
      'Financial document posting',
      'Accounting transactions'
    ],
    relatedObjects: ['BKPF', 'BSEG'],
    cleanCoreCompliant: true
  }
];

/**
 * SAP Standard Tables
 */
export const SAP_TABLES: SAPStandard[] = [
  {
    id: 'VBAK',
    type: 'TABLE',
    name: 'VBAK',
    module: 'SD',
    description: 'Sales Document: Header Data',
    useCases: [
      'Sales order header information',
      'Order status tracking',
      'Customer and date information'
    ],
    relatedObjects: ['VBAP', 'VBPA', 'VBUK'],
    cleanCoreCompliant: true
  },
  {
    id: 'VBAP',
    type: 'TABLE',
    name: 'VBAP',
    module: 'SD',
    description: 'Sales Document: Item Data',
    useCases: [
      'Order line items',
      'Material and quantity information',
      'Pricing data'
    ],
    relatedObjects: ['VBAK', 'KONV'],
    cleanCoreCompliant: true
  },
  {
    id: 'KONV',
    type: 'TABLE',
    name: 'KONV',
    module: 'SD',
    description: 'Conditions (Pricing)',
    useCases: [
      'Pricing conditions',
      'Discounts and surcharges',
      'Tax calculations'
    ],
    relatedObjects: ['VBAP', 'KONH'],
    cleanCoreCompliant: true
  },
  {
    id: 'KNA1',
    type: 'TABLE',
    name: 'KNA1',
    module: 'SD',
    description: 'Customer Master (General Data)',
    useCases: [
      'Customer information',
      'Address data',
      'Communication details'
    ],
    relatedObjects: ['KNVV', 'KNVP'],
    cleanCoreCompliant: true
  },
  {
    id: 'EKKO',
    type: 'TABLE',
    name: 'EKKO',
    module: 'MM',
    description: 'Purchasing Document Header',
    useCases: [
      'Purchase order headers',
      'Vendor information',
      'PO status'
    ],
    relatedObjects: ['EKPO', 'LFA1'],
    cleanCoreCompliant: true
  },
  {
    id: 'EKPO',
    type: 'TABLE',
    name: 'EKPO',
    module: 'MM',
    description: 'Purchasing Document Item',
    useCases: [
      'PO line items',
      'Material and quantity',
      'Delivery schedules'
    ],
    relatedObjects: ['EKKO', 'MARA'],
    cleanCoreCompliant: true
  },
  {
    id: 'MARA',
    type: 'TABLE',
    name: 'MARA',
    module: 'MM',
    description: 'General Material Data',
    useCases: [
      'Material master',
      'Product information',
      'Material attributes'
    ],
    relatedObjects: ['MARC', 'MARD'],
    cleanCoreCompliant: true
  },
  {
    id: 'BKPF',
    type: 'TABLE',
    name: 'BKPF',
    module: 'FI',
    description: 'Accounting Document Header',
    useCases: [
      'Financial document headers',
      'Posting information',
      'Document status'
    ],
    relatedObjects: ['BSEG'],
    cleanCoreCompliant: true
  },
  {
    id: 'BSEG',
    type: 'TABLE',
    name: 'BSEG',
    module: 'FI',
    description: 'Accounting Document Segment',
    useCases: [
      'Journal entry line items',
      'Account assignments',
      'Amounts and currencies'
    ],
    relatedObjects: ['BKPF', 'SKA1'],
    cleanCoreCompliant: true
  }
];

/**
 * SAP Standard Patterns
 */
export const SAP_PATTERNS: SAPStandard[] = [
  {
    id: 'PRICING_PROCEDURE',
    type: 'PATTERN',
    name: 'SAP Pricing Procedure',
    module: 'SD',
    description: 'Condition-based pricing with configurable calculation schema',
    useCases: [
      'Dynamic pricing',
      'Discount calculations',
      'Tax determination',
      'Surcharge processing'
    ],
    relatedObjects: ['KONV', 'KONH', 'T683'],
    cleanCoreCompliant: true,
    sapDocUrl: 'https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/eb1f00e0c2a04e5e9e54f4e4e8e8e8e8/pricing'
  },
  {
    id: 'AUTHORIZATION_OBJECT',
    type: 'PATTERN',
    name: 'SAP Authorization Objects',
    module: 'CROSS',
    description: 'Role-based access control with authorization objects',
    useCases: [
      'Security checks',
      'Access control',
      'Field-level authorization',
      'Transaction authorization'
    ],
    relatedObjects: ['AGR_DEFINE', 'USR02'],
    cleanCoreCompliant: true
  },
  {
    id: 'NUMBER_RANGE',
    type: 'PATTERN',
    name: 'SAP Number Range Objects',
    module: 'CROSS',
    description: 'Configurable number range management for document numbering',
    useCases: [
      'Document numbering',
      'Sequential ID generation',
      'Fiscal year dependent numbering',
      'External/internal numbering'
    ],
    relatedObjects: ['NRIV', 'TNRO'],
    cleanCoreCompliant: true
  },
  {
    id: 'BATCH_INPUT',
    type: 'PATTERN',
    name: 'Batch Input Processing',
    module: 'CROSS',
    description: 'Standard batch processing for mass data updates',
    useCases: [
      'Mass data upload',
      'Batch processing',
      'Data migration',
      'Periodic updates'
    ],
    cleanCoreCompliant: true
  }
];

/**
 * Get all SAP standards
 */
export function getAllStandards(): SAPStandard[] {
  return [
    ...SAP_BAPIS,
    ...SAP_TRANSACTIONS,
    ...SAP_TABLES,
    ...SAP_PATTERNS
  ];
}

/**
 * Get standards by module
 */
export function getStandardsByModule(module: string): SAPStandard[] {
  return getAllStandards().filter(std => std.module === module || std.module === 'CROSS');
}

/**
 * Get standards by type
 */
export function getStandardsByType(type: string): SAPStandard[] {
  return getAllStandards().filter(std => std.type === type);
}

/**
 * Search standards by keyword
 */
export function searchStandards(keyword: string): SAPStandard[] {
  const lowerKeyword = keyword.toLowerCase();
  return getAllStandards().filter(std => 
    std.name.toLowerCase().includes(lowerKeyword) ||
    std.description.toLowerCase().includes(lowerKeyword) ||
    std.useCases.some(uc => uc.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * Get standard by ID
 */
export function getStandardById(id: string): SAPStandard | undefined {
  return getAllStandards().find(std => std.id === id);
}
