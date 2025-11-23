# SAP MCP Architecture

## 🏗️ Dual MCP Server Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                              KIRO AI                                │
│                    (Claude with SAP Knowledge)                      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Uses both MCP servers
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
    ┌───────────────────────────┐   ┌───────────────────────────┐
    │   ABAP Analyzer MCP       │   │   SAP CAP MCP             │
    │   (Custom Python)         │   │   (Official SAP)          │
    ├───────────────────────────┤   ├───────────────────────────┤
    │ • parse_abap              │   │ • cap_generate_cds        │
    │ • detect_sap_patterns     │   │ • cap_validate_cds        │
    │ • generate_modern_equiv   │   │ • cap_lookup_pattern      │
    │ • validate_business_logic │   │ • cap_get_service_template│
    │ • extract_data_model      │   │                           │
    └───────────────────────────┘   └───────────────────────────┘
                    │                           │
                    │                           │
                    ▼                           ▼
    ┌───────────────────────────┐   ┌───────────────────────────┐
    │   Legacy ABAP Code        │   │   Modern SAP CAP          │
    │   • Parse syntax          │   │   • Official patterns     │
    │   • Extract logic         │   │   • CDS validation        │
    │   • Identify patterns     │   │   • Best practices        │
    │   • Map data structures   │   │   • Service templates     │
    └───────────────────────────┘   └───────────────────────────┘
```

---

## 🔄 Transformation Workflow

```
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 1: ANALYZE LEGACY                                               │
├──────────────────────────────────────────────────────────────────────┤
│ Input: ABAP code                                                     │
│ Tool: parse_abap (ABAP Analyzer MCP)                                │
│ Output: {                                                            │
│   "variables": [...],                                                │
│   "database_ops": [...],                                             │
│   "business_logic": [...],                                           │
│   "functions": [...]                                                 │
│ }                                                                    │
└──────────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 2: IDENTIFY SAP PATTERNS                                        │
├──────────────────────────────────────────────────────────────────────┤
│ Input: Parsed ABAP                                                   │
│ Tool: detect_sap_patterns (ABAP Analyzer MCP)                       │
│ Output: {                                                            │
│   "tables": ["VBAK", "VBAP"],                                       │
│   "modules": ["SD"],                                                 │
│   "bapis": ["BAPI_SALESORDER_CREATE"],                              │
│   "patterns": ["pricing_logic", "credit_check"]                     │
│ }                                                                    │
└──────────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 3: GET MODERN PATTERNS                                          │
├──────────────────────────────────────────────────────────────────────┤
│ Input: "custom action with calculation"                             │
│ Tool: cap_lookup_pattern (SAP CAP MCP)                              │
│ Output: Official SAP CAP pattern with:                              │
│   • CDS service definition                                           │
│   • Service handler template                                         │
│   • Best practices                                                   │
│   • Error handling                                                   │
└──────────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 4: GENERATE CODE                                                │
├──────────────────────────────────────────────────────────────────────┤
│ Kiro combines:                                                       │
│   • ABAP business logic (from step 1-2)                             │
│   • CAP patterns (from step 3)                                       │
│   • SAP domain knowledge (from steering docs)                        │
│                                                                      │
│ Output: Modern SAP CAP application                                   │
│   • CDS data models                                                  │
│   • Service handlers                                                 │
│   • Business logic preserved                                         │
└──────────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 5: VALIDATE                                                     │
├──────────────────────────────────────────────────────────────────────┤
│ Input: Generated CDS code                                            │
│ Tool: cap_validate_cds (SAP CAP MCP)                                │
│ Output: Validation results from official SAP compiler               │
│   ✅ Syntax correct                                                  │
│   ✅ Service definition valid                                        │
│   ✅ Follows SAP best practices                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Tool Interaction Matrix

| Phase | ABAP Analyzer | SAP CAP MCP | Kiro AI | Output |
|-------|---------------|-------------|---------|--------|
| Parse | ✅ parse_abap | - | Orchestrates | Structured ABAP |
| Analyze | ✅ detect_sap_patterns | - | Interprets | SAP patterns |
| Design | - | ✅ cap_lookup_pattern | Combines | CAP template |
| Generate | ✅ extract_data_model | ✅ cap_generate_cds | Synthesizes | CDS models |
| Implement | - | ✅ cap_get_service_template | Adapts | Service code |
| Validate | ✅ validate_business_logic | ✅ cap_validate_cds | Verifies | Quality check |

---

## 🔧 Configuration Flow

```
.kiro/settings/mcp.json
         │
         ├─── abap-analyzer
         │    │
         │    ├─── command: python3
         │    ├─── args: [".kiro/mcp/abap-analyzer.py"]
         │    └─── autoApprove: [parse_abap, detect_sap_patterns, extract_data_model]
         │
         └─── sap-cap
              │
              ├─── command: npx
              ├─── args: ["-y", "@cap-js/mcp-server"]
              └─── autoApprove: [cap_lookup_pattern, cap_validate_cds, cap_get_service_template]
```

---

## 📊 Data Flow Example

### Input: Legacy ABAP
```abap
FUNCTION z_calculate_discount.
  DATA: lv_discount TYPE p DECIMALS 2.
  
  SELECT SUM( netwr ) FROM vbak
    INTO lv_total
    WHERE kunnr = iv_customer.
  
  IF lv_total > 1000.
    lv_discount = lv_total * '0.10'.
  ENDIF.
ENDFUNCTION.
```

### Step 1: ABAP Analyzer → parse_abap
```json
{
  "variables": [
    {"name": "lv_discount", "type": "p", "decimals": 2},
    {"name": "lv_total", "type": "p"}
  ],
  "database": [
    {"operation": "SELECT", "table": "vbak", "fields": ["netwr"]}
  ],
  "business_logic": [
    {"type": "condition", "rule": "IF lv_total > 1000"},
    {"type": "calculation", "formula": "lv_total * 0.10"}
  ]
}
```

### Step 2: ABAP Analyzer → detect_sap_patterns
```json
{
  "tables": [
    {"name": "VBAK", "description": "Sales Document Header", "module": "SD"}
  ],
  "patterns": {
    "discount_logic": true,
    "customer_specific": true
  },
  "modules": ["SD"]
}
```

### Step 3: SAP CAP MCP → cap_lookup_pattern
```javascript
// Official SAP CAP pattern for custom function
service DiscountService {
  function calculateDiscount(customerId: String) returns Decimal;
}

module.exports = (srv) => {
  srv.on('calculateDiscount', async (req) => {
    const { customerId } = req.data;
    // Implementation here
  });
};
```

### Step 4: Kiro Generates
```javascript
// Combined: ABAP logic + CAP pattern
service DiscountService {
  function calculateDiscount(customerId: String) returns Decimal;
}

module.exports = (srv) => {
  const { SalesOrders } = cds.entities;
  
  srv.on('calculateDiscount', async (req) => {
    const { customerId } = req.data;
    
    // ABAP: SELECT SUM( netwr ) FROM vbak WHERE kunnr = iv_customer
    const result = await SELECT.one`SUM(netValue) as total`
      .from(SalesOrders)
      .where({ customerID: customerId });
    
    const total = result.total || 0;
    
    // ABAP: IF lv_total > 1000 THEN lv_discount = lv_total * '0.10'
    let discount = 0;
    if (total > 1000) {
      discount = total * 0.10;
    }
    
    // ABAP: TYPE p DECIMALS 2
    return Number(discount.toFixed(2));
  });
};
```

### Step 5: SAP CAP MCP → cap_validate_cds
```
✅ CDS syntax valid
✅ Service definition correct
✅ Follows SAP CAP best practices
✅ Ready for deployment
```

---

## 🏆 Why This Architecture Wins

### Separation of Concerns
- **ABAP Analyzer:** Domain expert for legacy
- **SAP CAP MCP:** Authority for modern
- **Kiro AI:** Orchestrator and synthesizer

### Best of Both Worlds
- **Custom tools** for specialized parsing
- **Official tools** for production patterns
- **AI intelligence** for combining them

### Production-Grade
- Not mock implementations
- Official SAP compiler validation
- Enterprise-ready output

### Extensible
- Add more custom analyzers for other legacy languages
- Integrate more official vendor MCPs
- Scale to any modernization scenario

---

## 📚 Related Documentation

- **Configuration:** `.kiro/settings/mcp.json`
- **Full Guide:** `.kiro/mcp/README.md`
- **Quick Start:** `.kiro/mcp/QUICK_START.md`
- **Setup Complete:** `.kiro/mcp/MCP_SETUP_COMPLETE.md`

---

**This dual MCP architecture showcases production-grade AI-powered legacy modernization.** 🚀
