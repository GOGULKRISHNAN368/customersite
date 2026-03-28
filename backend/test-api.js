async function testAPI() {
  try {
    const res = await fetch('http://localhost:5000/api/menu');
    const data = await res.json();
    console.log('Received from backend API:', data);
  } catch(e) {
    console.error('Fetch error:', e);
  }
}
testAPI();
