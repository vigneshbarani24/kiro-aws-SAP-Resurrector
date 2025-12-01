async function testAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/resurrections');
    const data = await response.json();
    
    console.log('API Response Status:', response.status);
    console.log('Total Resurrections:', data.count);
    console.log('\nFirst 3 Resurrections:');
    
    data.resurrections.slice(0, 3).forEach((r, i) => {
      console.log(`\n${i + 1}. ${r.name}`);
      console.log(`   Status: ${r.status}`);
      console.log(`   Module: ${r.module}`);
      console.log(`   Original LOC: ${r.originalLOC}`);
      console.log(`   LOC Saved: ${r.locSaved}`);
      console.log(`   Quality Score: ${r.qualityScore}`);
      console.log(`   ABAP Objects: ${r.abapObjectCount}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
