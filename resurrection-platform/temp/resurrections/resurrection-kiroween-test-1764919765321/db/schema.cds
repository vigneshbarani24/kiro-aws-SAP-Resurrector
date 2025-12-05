namespace resurrection.db;

using { cuid, managed } from '@sap/cds/common';

namespace mm.report;

@AbapCatalog.sqlViewName: 'EKKOVIEW'
entity EKKO {
  key ebeln : String(10);  // Purchasing Document Number
  bsart : String(4);       // Document Type
  aedat : Date;            // Last Changed On
  lifnr : String(10);      // Vendor Account Number
  ekorg : String(4);       // Purchasing Organization
  ekgrp : String(3);       // Purchasing Group
  statu : String(1);       // PO status
  ernam : String(12);      // Created by
  waers : String(5);       // Currency Key
}

@AbapCatalog.sqlViewName: 'EKPOVIEW'
entity EKPO {
  key ebeln : String(10);  // Purchasing Document Number
  key ebelp : String(5);   // Item Number of Purchasing Document
  matnr : String(18);      // Material Number
  werks : String(4);       // Plant
  menge : Decimal(13,3);   // Quantity
  meins : String(3);       // Order Unit
  netpr : Decimal(11,2);   // Net Price
  peinh : Decimal(5,0);    // Price Unit
  elikz : String(1);       // Delivery Completed Indicator
  loekz : String(1);       // Deletion Indicator
}

// Business logic preserved from ABAP:
// Generate report for open purchase orders with quantities and price
// Filter open POs by selection criteria and calculate open quantities
