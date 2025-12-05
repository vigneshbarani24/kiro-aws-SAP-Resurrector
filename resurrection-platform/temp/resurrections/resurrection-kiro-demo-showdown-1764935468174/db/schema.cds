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
  menge : Decimal(13,3);   // Quantity
  netpr : Decimal(11,2);   // Net Price
}

entity KONV {
  key knumv : String(10);  // Condition Document Number
  kposn : String(10);      // Condition Item Number
  kwert : Decimal(15,2);   // Condition Value
  kscha : String(2);       // Condition Type
}

entity KNA1 {
  key kunnr : String(10);  // Customer Number
  name1 : String(35);      // Name
  ort01 : String(35);      // City
  land1 : String(3);       // Country Key
  umsatz : Decimal(15,2);  // Sales Volume
  klimk : Decimal(15,2);   // Credit Limit
}

// Business logic preserved from ABAP:
// Calculates the total for a sales order including discounts, tax, and checks against customer's credit limit.
// Applies bulk discount based on subtotal exceeding a threshold.
