/**
 * Test the /start endpoint to verify it's working
 * 
 * Usage:
 *   node scripts/test-start-endpoint.js <resurrection-id>
 * 
 * Example:
 *   node scripts/test-start-endpoint.js 68ab6adf-f405-4e14-9f51-63939ea3587c
 */

const resurrectionId = process.argv[2];

if (!resurrectionId) {
  console.error('❌ Please provide a resurrection ID');
  console.log('Usage: node scripts/test-start-endpoint.js <resurrection-id>');
  process.exit(1);
}

async function testStartEndpoint() {
  const url = `http://localhost:3000/api/resurrections/${resurrectionId}/start`;
  
  console.log('🧪 Testing start endpoint...');
  console.log(`📍 URL: ${url}`);
  console.log('');

  try {
    console.log('⏳ Sending POST request...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log('');

    const contentType = response.headers.get('content-type');
    console.log(`📄 Content-Type: ${contentType}`);
    console.log('');

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('📦 Response:');
      console.log(JSON.stringify(data, null, 2));
      console.log('');

      if (response.ok) {
        console.log('✅ SUCCESS! Workflow started');
        console.log('');
        console.log('Next steps:');
        console.log(`1. Visit: http://localhost:3000/resurrections/${resurrectionId}`);
        console.log('2. Watch the console for workflow logs');
        console.log('3. Refresh the page to see progress');
      } else {
        console.log('⚠️  Request failed but endpoint is working');
        console.log('');
        console.log('Possible reasons:');
        if (response.status === 404) {
          console.log('- Resurrection not found (check ID)');
        } else if (response.status === 409) {
          console.log('- Workflow already in progress or completed');
        } else if (response.status === 400) {
          console.log('- No ABAP code in resurrection');
        }
      }
    } else {
      const text = await response.text();
      console.log('📄 Response (HTML):');
      console.log(text.substring(0, 500));
      console.log('');
      console.log('❌ ROUTE NOT REGISTERED!');
      console.log('');
      console.log('Fix:');
      console.log('1. Stop the dev server (Ctrl+C)');
      console.log('2. Delete .next directory: rm -rf .next');
      console.log('3. Restart: npm run dev');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('Possible causes:');
    console.log('- Dev server not running (start with: npm run dev)');
    console.log('- Wrong port (check if server is on port 3000)');
    console.log('- Network issue');
  }
}

testStartEndpoint();
