namespace resurrection.db;

using { cuid, managed } from '@sap/cds/common';

entity EKKO {
  key ebeln : String(10);  // Purchasing Document Number
  bukrs : String(4);       // Company Code
  bsart : String(4);       // Document Type
  aedat : Date;            // Document Date in Document
  lifnr : String(10);      // Vendor Account Number
  ekorg : String(4);       // Purchasing Organization
  ekgrp : String(3);       // Purchasing Group
  waers : String(5);       // Currency Key
  statu : String(1);       // System Status
}

entity EKPO {
  key ebeln : String(10);  // Purchasing Document Number
  key ebelp : String(5);   // Item Number of Purchasing Document
  matnr : String(18);      // Material Number
  werks : String(4);       // Plant
  menge : Decimal(13,3);   // Quantity
  meins : String(3);       // Purchase Order Unit of Measure
  netpr : Decimal(11,2);   // Net Price in Purchasing Document (in Document Currency)
  elikz : String(1);       // Delivery Completed Indicator
  loekz : String(1);       // Deletion Indicator
  pstat : String(1);       // Item Status
}

// Business logic preserved from ABAP:
// 
