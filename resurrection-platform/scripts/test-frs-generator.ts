/**
 * Test FRS Generator
 * 
 * Quick script to test FRS generation and see sample output
 */

import { FRSGenerator } from '../lib/generators/frs-generator';

async function testFRSGenerator() {
  console.log('Testing FRS Generator...\n');

  const generator = new FRSGenerator();

  const analysis = {
    businessLogic: [
      'Pricing calculation with condition-based discounts',
      'Credit limit validation',
      'Tax calculation based on customer location',
      'Inventory availability check'
    ],
    dependencies: ['RFC_READ_TABLE', 'BAPI_SALESORDER_CREATEFROMDAT2'],
    tables: ['VBAK', 'VBAP', 'KNA1', 'KONV', 'MARA'],
    patterns: ['SAP Pricing Procedure', 'SAP Authorization'],
    module: 'SD',
    complexity: 8,
    documentation: 'Sales order processing with complex pricing logic'
  };

  const resurrection = {
    id: 'demo-12345',
    name: 'Sales Order Processing System',
    description: 'Legacy ABAP sales order processing with pricing, discounts, and credit checks',
    originalLOC: 2500,
    transformedLOC: 850,
    locSaved: 1650,
    qualityScore: 92,
    module: 'SD',
    complexityScore: 8
  };

  const plan = {
    entities: [
      { 
        name: 'SalesOrder', 
        fields: ['ID', 'orderNumber', 'customerID', 'orderDate', 'totalAmount', 'status'] 
      },
      { 
        name: 'OrderItem', 
        fields: ['ID', 'orderID', 'productID', 'quantity', 'unitPrice', 'discount'] 
      },
      { 
        name: 'Customer', 
        fields: ['ID', 'customerNumber', 'name', 'creditLimit', 'currentBalance'] 
      }
    ],
    services: [
      { 
        name: 'SalesOrderService', 
        operations: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'CALCULATE_PRICE', 'CHECK_CREDIT'] 
      }
    ],
    businessLogic: [
      'Pricing calculation with condition-based discounts',
      'Credit limit validation',
      'Tax calculation based on customer location'
    ],
    patterns: ['SAP Pricing Procedure', 'SAP Authorization']
  };

  const frs = await generator.generateFRS(analysis, resurrection, plan);

  console.log('='.repeat(80));
  console.log('GENERATED FRS DOCUMENT');
  console.log('='.repeat(80));
  console.log(frs);
  console.log('='.repeat(80));
  console.log('\n✅ FRS Generator test completed successfully!');
  console.log(`📄 Document length: ${frs.length} characters`);
  console.log(`📝 Lines: ${frs.split('\n').length}`);
}

testFRSGenerator().catch(console.error);
