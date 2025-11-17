# ABAP to SAP CAP/BTP Modernization Spec

## Overview
This spec teaches Kiro how to analyze and transform legacy SAP ABAP code (1980s-era proprietary language) into modern **SAP Cloud Application Programming Model (CAP)** applications running on **SAP Business Technology Platform (BTP)**.

## Context: The ABAP Challenge
ABAP (Advanced Business Application Programming) is SAP's proprietary language from 1983. It powers critical business systems at 25,000+ enterprises but:
- Developer shortage (avg age 45+)
- Cryptic syntax, minimal documentation
- Billions spent on legacy maintenance
- Migration projects cost $5-50M and take 2-3 years

## The Modern SAP Solution: CAP + BTP
Instead of abandoning SAP, enterprises can modernize **within the SAP ecosystem**:
- **SAP CAP** - Cloud Application Programming Model (Node.js/Java)
- **SAP BTP** - Business Technology Platform (runs on AWS/Azure/GCP)
- **CDS** - Core Data Services for data modeling
- **OData** - Modern API layer
- **SAP HANA Cloud** - High-performance database

**Benefits:**
- ✅ Keep SAP expertise and ecosystem
- ✅ Modern development experience
- ✅ Cloud-native architecture
- ✅ Preserves SAP business logic
- ✅ Easier integration with SAP systems

## Kiro's Role: The Hero
Kiro uses AI to understand what humans can't - decades-old business logic embedded in cryptic code - and resurrects it as modern **SAP CAP applications** ready for BTP deployment.

## ABAP Syntax Patterns

### 1. Data Declarations → CDS Entity Definitions
```abap
DATA: lv_customer TYPE kunnr,
      lt_orders TYPE TABLE OF vbak,
      ls_order TYPE vbak.
```

**Modern Equivalent (SAP CAP - CDS):**
```cds
// schema.cds - Core Data Services model
entity SalesOrders {
  key ID       : UUID;
  customerID   : String(10);  // ABAP TYPE kunnr
  orderNumber  : String(10);  // ABAP vbeln
  netValue     : Decimal(15,2); // ABAP netwr
  currency     : String(3);
  items        : Association to many SalesOrderItems on items.order = $self;
}

entity SalesOrderItems {
  key ID       : UUID;
  order        : Association to SalesOrders;
  material     : String(18);
  quantity     : Decimal(13,3);
  netPrice     : Decimal(15,2);
}
```

**CAP Service (JavaScript):**
```javascript
// sales-order-service.js
const customer = req.data.customerId;  // ABAP: lv_customer
const orders = await SELECT.from(SalesOrders).where({ customerID: customer });
const order = orders[0]; // ABAP: ls_order
```

### 2. Database Operations (Open SQL) → CAP CQL
```abap
SELECT * FROM vbak
  INTO TABLE lt_orders
  WHERE kunnr = lv_customer.
```

**Modern Equivalent (SAP CAP - CQL/CDS Query Language):**
```javascript
// CAP service handler
const orders = await SELECT.from(SalesOrders).where({
  customerID: customer
});

// Or using CQL with OData query
const orders = await cds.read(SalesOrders).where({ customerID: customer });
```

**Exposed as OData:**
```
GET /odata/v4/sales/SalesOrders?$filter=customerID eq 'C12345'
```

### 3. Loop Processing → CAP Service Logic
```abap
LOOP AT lt_orders INTO ls_order.
  WRITE: / ls_order-vbeln, ls_order-netwr.
ENDLOOP.
```

**Modern Equivalent (SAP CAP):**
```javascript
// CAP service handler
srv.on('READ', 'SalesOrders', async (req) => {
  const orders = await SELECT.from(SalesOrders);

  // ABAP LOOP equivalent
  orders.forEach(order => {
    console.log(`${order.orderNumber}: ${order.netValue}`);
  });

  return orders;
});
```

### 4. Function Modules (Business Logic) → CAP Actions
```abap
CALL FUNCTION 'BAPI_SALESORDER_CREATE'
  EXPORTING
    order_header_in = ls_header
  TABLES
    order_items     = lt_items
    return         = lt_return.
```

**Modern Equivalent (SAP CAP - Custom Actions):**
```cds
// sales-service.cds
service SalesService {
  entity SalesOrders as projection on db.SalesOrders;

  // ABAP BAPI → CAP Action
  action createSalesOrder(
    header : {
      customerID : String;
      orderDate  : Date;
    },
    items : array of {
      material : String;
      quantity : Decimal;
      price    : Decimal;
    }
  ) returns SalesOrders;
}
```

```javascript
// sales-service.js - CAP service implementation
module.exports = (srv) => {
  const { SalesOrders, SalesOrderItems } = cds.entities;

  // ABAP: BAPI_SALESORDER_CREATE
  srv.on('createSalesOrder', async (req) => {
    const { header, items } = req.data;

    // Business logic from ABAP
    const order = await INSERT.into(SalesOrders).entries({
      customerID: header.customerID,
      orderDate: header.orderDate,
      netValue: items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    });

    // Insert line items
    await INSERT.into(SalesOrderItems).entries(
      items.map(item => ({
        order_ID: order.ID,
        ...item
      }))
    );

    return order;
  });
};
```

### 5. Complex Business Logic Patterns → CAP Custom Handlers
```abap
* Pricing calculation with conditions
READ TABLE lt_conditions WITH KEY kschl = 'PR00'
  INTO ls_condition.
IF sy-subrc = 0.
  lv_price = ls_condition-kbetr / 10.
  IF lv_quantity > 100.
    lv_price = lv_price * '0.95'.  "5% bulk discount
  ENDIF.
ENDIF.
```

**Modern Equivalent (SAP CAP with Business Logic):**
```cds
// pricing-service.cds
entity PricingConditions {
  key ID              : UUID;
  conditionType       : String(4);  // ABAP: kschl
  amount              : Decimal(15,2); // ABAP: kbetr
  scaleFactor         : Integer default 10;
}

service PricingService {
  function calculatePrice(
    conditionRecords : array of PricingConditions,
    quantity         : Decimal
  ) returns Decimal;
}
```

```javascript
// pricing-service.js - Preserves ABAP business logic
module.exports = (srv) => {
  srv.on('calculatePrice', async (req) => {
    const { conditionRecords, quantity } = req.data;

    // ABAP: READ TABLE lt_conditions WITH KEY kschl = 'PR00'
    const priceCondition = conditionRecords.find(c => c.conditionType === 'PR00');

    if (priceCondition) {  // ABAP: IF sy-subrc = 0
      // ABAP: lv_price = ls_condition-kbetr / 10
      let price = priceCondition.amount / priceCondition.scaleFactor;

      // ABAP: IF lv_quantity > 100
      // CRITICAL BUSINESS RULE: 5% bulk discount
      if (quantity > 100) {
        price = price * 0.95;  // ABAP: lv_price = lv_price * '0.95'
      }

      return price;
    }

    return 0;
  });
};
```

## Transformation Requirements

### Business Logic Preservation
1. **Extract** all business rules, calculations, validations
2. **Preserve** exact logic flow and conditions
3. **Validate** output matches ABAP behavior 100%

### Modernization Targets (SAP CAP + BTP)
- **Backend:** SAP CAP (Cloud Application Programming Model) - Node.js or Java
- **Data Modeling:** CDS (Core Data Services) - declarative schema definitions
- **Database:** SAP HANA Cloud (or PostgreSQL/SQLite for dev)
- **API Layer:** OData V4 (auto-generated from CDS models)
- **Frontend:** SAP Fiori Elements or custom UI5/React
- **Deployment:** SAP BTP (Business Technology Platform) on AWS/Azure/GCP
- **Authentication:** SAP Identity Authentication Service (IAS)
- **Integration:** SAP Cloud SDK for connecting to other SAP systems

### Data Model Migration (ABAP → CDS)
Map SAP tables to CDS entities:
- `VBAK` (Sales Orders) → `entity SalesOrders` in CDS
- `KNA1` (Customers) → `entity Customers` in CDS
- `MARA` (Materials) → `entity Materials` in CDS
- `KONV` (Pricing Conditions) → `entity PricingConditions` in CDS

**Example CDS Migration:**
```cds
// db/schema.cds - Modernized SAP data model
namespace sap.migration;

entity SalesOrders {  // ABAP: VBAK
  key ID          : UUID;
  orderNumber     : String(10);   // vbeln
  customerID      : String(10);   // kunnr
  orderDate       : Date;         // erdat
  netValue        : Decimal(15,2); // netwr
  currency        : String(3);     // waerk
  items           : Composition of many SalesOrderItems on items.order = $self;
}

entity SalesOrderItems {  // ABAP: VBAP
  key ID          : UUID;
  order           : Association to SalesOrders;
  itemNumber      : String(6);    // posnr
  material        : String(18);   // matnr
  quantity        : Decimal(13,3); // kwmeng
  netPrice        : Decimal(15,2); // netpr
}
```

## Kiro Instructions

### Phase 1: Analysis
When given ABAP code:
1. Identify business entities (customers, orders, products)
2. Extract business logic (pricing, validation, workflows)
3. Map database operations to modern ORM queries
4. Document dependencies and integration points

### Phase 2: Transformation
Generate modern SAP CAP code that:
1. Maintains identical business logic from ABAP
2. Uses CDS for data models (declarative, type-safe)
3. Implements business logic in CAP service handlers (Node.js/Java)
4. Exposes OData V4 APIs automatically
5. Preserves SAP-specific patterns (pricing, authorization, etc.)
6. Includes error handling and validation
7. Adds unit tests using CAP's testing framework

### Phase 3: Validation
1. Generate test cases from ABAP scenarios
2. Ensure output matches ABAP behavior
3. Document any edge cases or assumptions

## Example: Complete Transformation

### Input: Legacy ABAP
```abap
FUNCTION z_calculate_order_total.
  TABLES: order_items TYPE ty_items.
  EXPORTING: total TYPE p DECIMALS 2.

  DATA: lv_subtotal TYPE p DECIMALS 2,
        ls_item TYPE ty_item.

  LOOP AT order_items INTO ls_item.
    lv_subtotal = lv_subtotal + ( ls_item-quantity * ls_item-price ).
  ENDLOOP.

  IF lv_subtotal > 1000.
    total = lv_subtotal * '0.90'.  "10% discount
  ELSE.
    total = lv_subtotal.
  ENDIF.
ENDFUNCTION.
```

### Output: Modern SAP CAP Application

**1. CDS Data Model (db/schema.cds):**
```cds
namespace sap.migration;

entity OrderItems {
  key ID       : UUID;
  quantity     : Decimal(13,3);  // ABAP: ls_item-quantity
  price        : Decimal(15,2);  // ABAP: ls_item-price
}
```

**2. CDS Service Definition (srv/order-service.cds):**
```cds
using { sap.migration as db } from '../db/schema';

service OrderService {
  entity OrderItems as projection on db.OrderItems;

  // ABAP FUNCTION → CAP Function
  function calculateOrderTotal(items : array of {
    quantity : Decimal;
    price    : Decimal;
  }) returns Decimal;
}
```

**3. Service Implementation (srv/order-service.js):**
```javascript
/**
 * Order Calculation Service
 * Transformed from ABAP function Z_CALCULATE_ORDER_TOTAL
 * Business logic preserved: 10% discount for orders over $1000
 */
module.exports = (srv) => {

  // ABAP: FUNCTION z_calculate_order_total
  srv.on('calculateOrderTotal', async (req) => {
    const { items } = req.data;

    // ABAP: DATA: lv_subtotal TYPE p DECIMALS 2
    let subtotal = 0;

    // ABAP: LOOP AT order_items INTO ls_item
    //       lv_subtotal = lv_subtotal + ( ls_item-quantity * ls_item-price )
    for (const item of items) {
      subtotal += item.quantity * item.price;
    }

    let total;

    // ABAP: IF lv_subtotal > 1000
    //         total = lv_subtotal * '0.90'.  "10% discount
    //       ELSE
    //         total = lv_subtotal.
    //       ENDIF.
    if (subtotal > 1000) {
      total = subtotal * 0.90;  // CRITICAL: 10% bulk discount preserved
    } else {
      total = subtotal;
    }

    // ABAP: TYPE p DECIMALS 2 → round to 2 decimals
    return Number(total.toFixed(2));
  });
};
```

**4. Unit Tests (test/order-service.test.js):**
```javascript
const cds = require('@sap/cds/lib');
const { expect } = require('chai');

describe('OrderService - calculateOrderTotal', () => {
  let OrderService;

  before(async () => {
    OrderService = await cds.connect.to('OrderService');
  });

  // Test preserved from ABAP logic
  it('should apply 10% discount for orders over $1000', async () => {
    const result = await OrderService.calculateOrderTotal({
      items: [
        { quantity: 10, price: 110 }  // $1100 subtotal
      ]
    });
    expect(result).to.equal(990);  // $1100 * 0.90
  });

  it('should not discount orders under $1000', async () => {
    const result = await OrderService.calculateOrderTotal({
      items: [
        { quantity: 5, price: 100 }  // $500 subtotal
      ]
    });
    expect(result).to.equal(500);
  });
});
```

**5. Deployment to SAP BTP (mta.yaml):**
```yaml
ID: sap-abap-migration
_schema-version: '3.2'
version: 1.0.0

modules:
  - name: sap-migration-srv
    type: nodejs
    path: srv
    requires:
      - name: sap-migration-db
    provides:
      - name: srv-api
        properties:
          srv-url: ${default-url}

  - name: sap-migration-db
    type: hdb
    path: db
    parameters:
      memory: 256M
      disk-quota: 512M

resources:
  - name: sap-migration-db
    type: com.sap.xs.hdi-container
    parameters:
      service: hana
      service-plan: hdi-shared
```

**Exposed as OData V4:**
```
POST /odata/v4/order/calculateOrderTotal
Content-Type: application/json

{
  "items": [
    { "quantity": 10, "price": 110 }
  ]
}

Response: { "value": 990 }
```

## Success Criteria
- ✅ Business logic preservation: 100% (10% discount threshold preserved)
- ✅ SAP ecosystem: CAP + BTP (stays within SAP)
- ✅ Code quality: Modern CDS models, typed, tested
- ✅ Cloud-native: Deployable to SAP BTP on AWS/Azure/GCP
- ✅ OData API: Auto-generated, SAP-standard integration
- ✅ Performance: SAP HANA Cloud optimized
- ✅ Maintainability: Clear CDS models, documented business logic

---

**This spec enables Kiro to be the hero that resurrects dead ABAP code into modern SAP CAP applications running on BTP - keeping enterprises within the SAP ecosystem while modernizing their stack.**
