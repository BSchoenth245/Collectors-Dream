const express = require('express');
const app = express();

app.get('/api/test', (req, res) => {
    console.log('Test route hit!');
    res.json({ message: 'Test works!' });
});

app.listen(8001, () => {
    console.log('Test server running on port 8001');
});