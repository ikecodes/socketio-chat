const express = require('express');

const router = express();

router.get('/', (req, res) => {
  res.send('You are connected');
});

module.exports = router;
