const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    const resurrections = await prisma.resurrection.findMany({
      include: {
        abapObjects: true,
        _count: {
          select: {
            transformationLogs: true
          }
        }
      }
    });
    
    console.log('Total resurrections:', resurrections.length);
    console.log('\nResurrections:');
    resurrections.forEach(r => {
      console.log(`\nID: ${r.id}`);
      console.log(`Name: ${r.name}`);
      console.log(`Status: ${r.status}`);
      console.log(`Module: ${r.module}`);
      console.log(`Original LOC: ${r.originalLOC}`);
      console.log(`LOC Saved: ${r.locSaved}`);
      console.log(`Quality Score: ${r.qualityScore}`);
      console.log(`Complexity Score: ${r.complexityScore}`);
      console.log(`ABAP Objects: ${r.abapObjects.length}`);
      console.log(`Transformation Logs: ${r._count.transformationLogs}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
