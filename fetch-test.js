// No require needed for node >= 18

async function test() {
  const url = 'https://sistemas-administrativos-i2r74zcrh-jose-cruz.vercel.app';
  
  const endpoints = [
    '/api/academic-levels',
    '/api/careers',
    '/api/subjects',
    '/api/groups',
    '/api/templates'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(url + ep);
      const text = await res.text();
      console.log(`[${ep}] Status: ${res.status}`);
      console.log(`Body (first 100 chars): ${text.substring(0, 100)}`);
    } catch (e) {
      console.error(`[${ep}] Error:`, e.message);
    }
  }
}

test();
