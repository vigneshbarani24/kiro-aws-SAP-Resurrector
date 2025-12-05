const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
  const { VBAK, VBAP, KONV, KNA1 } = this.entities;

  this.before('CREATE', 'VBAK', async (req) => {
    console.log('Validating customer credit limit before creating a sales order');
    const salesOrder = req.data;
    const customer = await SELECT.one.from(KNA1).where({ KUNNR: salesOrder.KUNNR });
    if (!customer) throw new Error('Customer not found');

    if (salesOrder.NETWR > customer.CREDIT_LIMIT) {
      throw new Error('Exceeds customer credit limit');
    }
  });

  this.on('READ', 'VBAK', async (req) => {
    console.log('Calculating total for sales orders');
  });

  this.after('READ', 'VBAK', async (salesOrders, req) => {
    console.log('Applying discounts and calculating tax');
    for (const order of salesOrders) {
      let subtotal = 0;
      const items = await SELECT.from(VBAP).where({ VBELN: order.VBELN });
      for (const item of items) {
        subtotal += item.NETPR * item.KWMENG;
        const discounts = await SELECT.from(KONV).where({ KNUMV: item.KNUMV, KSCHL: 'DISC' });
        for (const discount of discounts) {
          subtotal -= discount.KWERT;
        }
      }
      // Apply bulk discount
      if (subtotal > 10000) { // Threshold for bulk discount
        subtotal *= 0.95; // 5% bulk discount
      }

      const tax = subtotal * 0.1; // Assume 10% tax rate
      order.TOTAL = subtotal + tax;
    }
  });

});