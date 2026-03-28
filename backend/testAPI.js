const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/menu');
    console.log('Menu Data:', res.data);
  } catch (err) {
    console.error('API Error:', err.message);
    if (err.response) console.log('Status:', err.response.status);
  }
}

test();
