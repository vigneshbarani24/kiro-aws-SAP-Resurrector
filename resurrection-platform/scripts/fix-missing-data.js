const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixMissingData() {
  try {
    console.log('🔍 Checking for resurrections with missing data...\n');
    
    const resurrections = await prisma.resurrection.findMany();
    
    let fixed = 0;
    
    for (const r of resurrections) {
      const updates = {};
      
      // Fix originalLOC if missing but linesOfCode exists
      if (!r.originalLOC && r.linesOfCode) {
        updates.originalLOC = r.linesOfCode;
        console.log(`✅ ${r.name}: Setting originalLOC to ${r.linesOfCode}`);
      }
      
      // Set default values for null fields
      if (r.locSaved === null) {
        updates.locSaved = 0;
        console.log(`✅ ${r.name}: Setting locSaved to 0`);
      }
      
      if (r.qualityScore === null && r.status === 'COMPLETED') {
        updates.qualityScore = 0;
        console.log(`✅ ${r.name}: Setting qualityScore to 0 (completed but not scored)`);
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await prisma.resurrection.update({
          where: { id: r.id },
          data: updates
        });
        fixed++;
      }
    }
    
    console.log(`\n✨ Fixed ${fixed} resurrections`);
    console.log(`📊 Total resurrections: ${resurrections.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingData();
