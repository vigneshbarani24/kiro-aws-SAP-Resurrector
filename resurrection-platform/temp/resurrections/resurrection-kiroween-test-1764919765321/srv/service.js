const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
  const { EKKO, EKPO } = this.entities;

  // Handling before READ event for EKKO to filter open purchase orders
  this.before('READ', EKKO, (req) => {
    console.log('Filtering open purchase orders');
    // Assuming 'status' field indicates if a PO is open; adjust field name as per actual model
    req.query.where('status =', 'OPEN');
  });

  // Handling READ event for generating report for open POs with quantities and price
  this.on('READ', EKKO, async (req) => {
    console.log('Generating report for open purchase orders');
    const ekko = await SELECT.from(EKKO).where({status: 'OPEN'});
    const ekpoItemsPromises = ekko.map(po => SELECT.from(EKPO).where({PO_ID: po.ID}));
    const ekpoItems = await Promise.all(ekpoItemsPromises);
    const report = ekko.map((po, index) => ({
      PO_ID: po.ID,
      Items: ekpoItems[index]
        .filter(item => item.status === 'OPEN') // Filter open items
        .map(item => ({
          Item_ID: item.ID,
          Quantity: item.quantity,
          Price: item.price
        }))
    }));
    return report;
  });

  // Optionally, handle after READ event if any post-processing is required
  this.after('READ', EKKO, (data, req) => {
    console.log('Post-processing report data');
    // Example: Convert currency, adjust quantity units etc.
    // This is just a placeholder for any potential logic
  });
});