namespace resurrection.db;

using { cuid, managed } from '@sap/cds/common';

plaintext
entity VBAK {
  key vbeln : String(10);  // Sales Document Number
  erdat : Date;            // Created On
  kunnr : String(10);      // Sold-to Party
  netwr : Decimal(15,2);   // Net Value
}

entity VBAP {
  key vbeln : String(10);  // Sales Document Number
  key posnr : String(6);   // Item Number
  matnr : String(18);      // Material Number
  netpr : Decimal(15,2);   // Net Price
  kwert : Decimal(15,2);   // Value of Sales Order Item
}

entity KONV {
  key knumv : String(10);  // Condition Record Number
  kposn : String(6);       // Item Number
  kscha : String(4);       // Condition Type
  kwert : Decimal(15,2);   // Condition Value
}

entity KNA1 {
  key kunnr : String(10);  // Customer Number
  land1 : String(3);       // Country Key
  name1 : String(35);      // Name
  ort01 : String(35);      // City
  regio : String(3);       // Region
  klimk : Decimal(15,2);   // Credit Limit
}

// Business logic preserved from ABAP:
// Calculate sales order total with various pricing conditions
// Apply discounts, tax, and check against customer credit limit
