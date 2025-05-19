const express = require('express');
const axios = require('axios');
const router = express.Router();

const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

router.use('/api/binance', async (req, res) => {
  try {
    const url = BINANCE_API_BASE + req.originalUrl.replace('/api/binance', '');

    const response = await axios.get(url, {
      headers: req.headers,
      params: req.query
    });

    res.json(response.data);
  } catch (error) {
    console.error('Erro no proxy da Binance:', error.message);
    res.status(500).json({ error: 'Erro ao acessar a API da Binance' });
  }
});

module.exports = router;
