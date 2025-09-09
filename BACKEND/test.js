console.log('Starting test...');
const express = require('express');
console.log('Express loaded');
const app = express();
console.log('App created');

app.get('/', (req, res) => {
  res.json({ message: 'Test working!' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
});
