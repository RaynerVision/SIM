// Servidor Principal

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./api/routes');
const proxyBinance = require('./api/proxyBinance');
const { startDataUpdates } = require('./services/cacheManager');

const app = express();

// Configurações
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rotas
app.use(proxyBinance);   // <-- proxy para Binance (/api/binance/*)
app.use('/api', routes); // <-- suas rotas normais

// Inicia o serviço de atualização automática
startDataUpdates();

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
