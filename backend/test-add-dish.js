const http = require('http');

const dishData = JSON.stringify({
  name: 'Test Dish From Bot',
  category: 'Test',
  price: 150,
  available: true,
  timeSlots: ['morning'],
  description: 'Test description'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/dishes',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': dishData.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Response:', data);
  });
});

req.on('error', (error) => console.error('❌ Error:', error));
req.write(dishData);
req.end();
