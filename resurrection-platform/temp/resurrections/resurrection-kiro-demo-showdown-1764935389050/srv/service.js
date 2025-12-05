const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
  const { VBAK, VBAP, KONV, KNA1 } = this.entities;

  // Before creating a sales order, check customer's credit limit
  this.before('CREATE', VBAK, async (req) => {
    console.log('Checking customer credit limit');
    const { KUNNR } = req.data;
    const customer = await cds.tx(req).run(SELECT.one.from(KNA1).where({ KUNNR }));
    if (!customer) {
      req.error(404, `Customer ${KUNNR} not found`);
      return;
    }
    if (customer.KLIMK < req.data.NETWR) {
      req.error(400, `Customer ${KUNNR} exceeds credit limit`);
    }
  });

  // Calculate sales order total when creating or updating line items
  this.before(['CREATE', 'UPDATE'], VBAP, (req) => {
    console.log('Calculating line item total');
    const { KWMENG, NETPR } = req.data;
    req.data.NETWR = KWMENG * NETPR; // Quantity * Price
  });

  // Apply various pricing conditions (discounts, tax) after creating/updating line items
  this.after(['CREATE', 'UPDATE'], VBAP, async (req) => {
    console.log('Applying pricing conditions');
    const { VBELN, POSNR } = req.data;
    const conditions = await cds.tx(req).run(SELECT.from(KONV).where({ VBELN, POSNR }));
    let adjustedPrice = req.data.NETWR;
    conditions.forEach(condition => {
      switch (condition.KSCHL) {
        case 'ZDIS': // Discount
          adjustedPrice -= condition.KWERT;
          break;
        case 'ZTAX': // Tax
          adjustedPrice += condition.KWERT;
          break;
        default:
          console.log(`Condition ${condition.KSCHL} not recognized`);
      }
    });
    await cds.tx(req).run(UPDATE(VBAP).set({ NETWR: adjustedPrice }).where({ VBELN, POSNR }));
  });

  // After creating a sales order, calculate and update the total
  this.after('CREATE', VBAK, async (req, salesOrder) => {
    console.log('Calculating sales order total');
    const items = await cds.tx(req).run(SELECT.from(VBAP).where({ VBELN: salesOrder.VBELN }));
    let total = items.reduce((acc, item) => acc + item.NETWR, 0);
    await cds.tx(req).run(UPDATE(VBAK).set({ NETWR: total }).where({ VBELN: salesOrder.VBELN }));
  });
});