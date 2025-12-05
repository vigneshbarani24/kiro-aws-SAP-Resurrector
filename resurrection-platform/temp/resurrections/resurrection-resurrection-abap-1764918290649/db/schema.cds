namespace resurrection.db;

using { cuid, managed } from '@sap/cds/common';

entity VBAP {
  key vbeln : String(10);  // Sales Document Number
  key posnr : String(6);   // Sales Document Item
  matnr : String(18);      // Material Number
  arktx : String(40);      // Short Text for Sales Order Item
  netwr : Decimal(15,2);   // Net Amount in Document Currency
  werks : String(4);       // Plant
  kwmeng : Decimal(13,3);  // Order Quantity
  vrkme : String(3);       // Sales Unit
  prsdt : Date;            // Pricing Date for the Sales Document
}

entity KONV {
  key knumv : String(10);  // Condition Document Number
  key kposn : String(6);   // Item number of the condition record
  key kscha : String(4);   // Condition Type
  kbetr : Decimal(13,2);   // Condition Rate (Amount or Percentage)
  waerk : String(5);       // Currency Key
  kondm : String(2);       // Condition Pricing Unit
  kpein : Decimal(5,0);    // Condition Pricing Unit
  kmein : String(3);       // Condition Unit of Measure
}

// Business logic preserved from ABAP:
// Calculate sales order total with pricing conditions including base price, material discount, customer discount, tax, and a bulk discount if applicable.
// Perform critical validations such as order existence, item existence, and credit limit checks.
