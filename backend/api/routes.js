// (Endpoint /dados)
const express = require('express');
const { getCachedData } = require('../services/cacheManager');
const router = express.Router();

/**
 * Rota principal que entrega os dados cacheados
 * Exemplo de uso: /api/dados?interval=1h
 */
router.get('/dados', async (req, res) => {
    try {
        const interval = req.query.interval || '1h';
        const data = await getCachedData(interval);
        
        res.json({
            success: true,
            interval,
            data: data.coins,
            top200: data.top200,
            lastUpdated: data.lastUpdated
        });
    } catch (error) {
        console.error('Erro na rota /dados:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao recuperar dados'
        });
    }
});

module.exports = router;

