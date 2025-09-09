console.log('🚀 Starting simple server...');

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Simple server working!' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🎉 Simple server running on port ${PORT}`);
});
