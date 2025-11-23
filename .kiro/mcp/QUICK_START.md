# SAP MCP Servers - Quick Start Guide

## 🚀 Ready to Use!

Both MCP servers are configured and ready in `.kiro/settings/mcp.json`

---

## 📋 Available Tools

### Custom ABAP Analyzer

**Server:** `abap-analyzer`

| Tool | Purpose | Auto-Approved |
|------|---------|---------------|
| `parse_abap` | Extract business logic from ABAP code | ✅ Yes |
| `detect_sap_patterns` | Identify BAPIs, tables, SAP modules | ✅ Yes |
| `generate_modern_equivalent` | Transform ABAP → TypeScript/Python | ❌ No |
| `validate_business_logic` | Compare original vs transformed | ❌ No |
| `extract_data_model` | Generate data models from ABAP | ✅ Yes |

### Official SAP CAP MCP

**Server:** `sap-cap`

| Tool | Purpose | Auto-Approved |
|------|---------|---------------|
| `cap_generate_cds` | Generate CDS models from schemas | ❌ No |
| `cap_validate_cds` | Validate CDS syntax (official compiler) | ✅ Yes |
| `cap_lookup_pattern` | Find SAP-approved CAP patterns | ✅ Yes |
| `cap_get_service_template` | Get official service templates | ✅ Yes |

---

## 💡 Usage Examples

### Example 1: Parse Legacy ABAP

**Ask Kiro:**
```
"Use the ABAP analyzer to parse this code and extract business logic:

FUNCTION z_calculate_discount.
  DATA: lv_discount TYPE p DECIMALS 2.
  
  IF iv_amount > 1000.
    lv_discount = iv_amount * '0.10'.
  ENDIF.
ENDFUNCTION.
"
```

**Kiro will:**
1. Call `parse_abap` tool (auto-approved)
2. Extract business logic patterns
3. Identify the 10% discount rule
4. Return structured analysis

---

### Example 2: Get CAP Service Template

**Ask Kiro:**
```
"Use the SAP CAP MCP to get a service template for a CRUD service"
```

**Kiro will:**
1. Call `cap_get_service_template` (auto-approved)
2. Return official SAP CAP service pattern
3. Include CDS definition + service handler
4. Follow SAP best practices

---

### Example 3: Complete Transformation

**Ask Kiro:**
```
"Transform this ABAP function to SAP CAP:

FUNCTION z_get_customer_orders.
  SELECT * FROM vbak
    INTO TABLE et_orders
    WHERE kunnr = iv_customer_id.
ENDFUNCTION.
"
```

**Kiro will:**
1. Use `parse_abap` to analyze ABAP
2. Use `detect_sap_patterns` to identify VBAK table (Sales Orders)
3. Use `cap_lookup_pattern` to find CAP query pattern
4. Generate modern CAP code with CDS model
5. Use `cap_validate_cds` to validate syntax

---

## 🔄 Workflow: Legacy → Modern

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ANALYZE LEGACY                                           │
│    Tool: parse_abap                                         │
│    Input: ABAP code                                         │
│    Output: Business logic, data structures, patterns        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. IDENTIFY SAP PATTERNS                                    │
│    Tool: detect_sap_patterns                                │
│    Input: Parsed ABAP                                       │
│    Output: SAP modules, tables, BAPIs                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. GET MODERN PATTERNS                                      │
│    Tool: cap_lookup_pattern                                 │
│    Input: Pattern type (e.g., "custom action")             │
│    Output: Official SAP CAP pattern                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. GENERATE CODE                                            │
│    Kiro combines: ABAP logic + CAP patterns                 │
│    Output: Modern SAP CAP code                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. VALIDATE                                                 │
│    Tool: cap_validate_cds                                   │
│    Input: Generated CDS code                                │
│    Output: Syntax validation, errors/warnings               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Pro Tips

### Tip 1: Chain Tools
Ask Kiro to use multiple tools in sequence:
```
"Parse this ABAP code, detect SAP patterns, then generate 
the CAP equivalent using official templates"
```

### Tip 2: Validate Everything
Always validate generated CDS:
```
"Validate this CDS model using the official SAP compiler"
```

### Tip 3: Look Up Patterns First
Before generating code, look up official patterns:
```
"What's the official SAP CAP pattern for custom actions?"
```

### Tip 4: Extract Data Models
Generate TypeScript interfaces from ABAP:
```
"Extract the data model from this ABAP code and generate 
TypeScript interfaces"
```

---

## 🔧 Troubleshooting

### MCP Server Not Found

**Problem:** `sap-cap` server fails to start

**Solution:** The server uses `npx -y @cap-js/mcp-server` which auto-installs. Ensure you have Node.js 18+ installed:
```bash
node --version  # Should be 18+
```

### Python MCP Issues

**Problem:** `abap-analyzer` fails to start

**Solution:** Ensure Python 3.9+ is installed:
```bash
python3 --version  # Should be 3.9+
```

### Tool Not Auto-Approved

**Problem:** Kiro asks for approval on every tool call

**Solution:** Add the tool to `autoApprove` list in `.kiro/settings/mcp.json`

---

## 📚 Resources

**Custom ABAP Analyzer:**
- Implementation: `.kiro/mcp/abap-analyzer.py`
- Spec: `.kiro/mcp/abap-analyzer-server.json`

**Official SAP CAP MCP:**
- NPM: `@cap-js/mcp-server`
- GitHub: https://github.com/cap-js/mcp-server
- SAP CAP Docs: https://cap.cloud.sap/docs/

**MCP Protocol:**
- Spec: https://modelcontextprotocol.io/

---

## 🎬 Demo Commands

Try these with Kiro:

```
1. "Parse this ABAP SELECT statement and tell me what SAP table it uses"

2. "Show me the official SAP CAP pattern for implementing custom actions"

3. "Transform this ABAP pricing function to SAP CAP, preserving all business logic"

4. "Validate this CDS model using the official SAP compiler"

5. "Extract the data model from this ABAP code and generate a CDS entity"
```

---

**Both MCP servers are configured and ready. Just ask Kiro to use them!** 🚀
