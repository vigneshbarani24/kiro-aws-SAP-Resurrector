namespace resurrection.db;

using { cuid, managed } from '@sap/cds/common';


entity SalesOrder {
  key ID : UUID;
  orderNumber : String;
}

// Business logic preserved from ABAP:
// Pricing calculation
