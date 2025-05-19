// (Conexão com Binance)
const axios = require('axios');
const { processIndicators } = require('./indicatorService');

class BinanceService {
    constructor() {
        this.apiUrl = process.env.BINANCE_API_URL;
    }

    /**
     * Busca as top 200 moedas por volume
     */
    async getTop200Coins() {
        try {
            const response = await axios.get(`${this.apiUrl}/ticker/24hr`);
            return response.data
                .filter(c => c.symbol.endsWith('USDT'))
                .sort((a, b) => b.quoteVolume - a.quoteVolume)
                .slice(0, 200)
                .map(c => c.symbol);
        } catch (error) {
            console.error('Erro ao buscar top 200:', error);
            throw error;
        }
    }

    /**
     * Busca dados de candles para um par específico
     */
    async getKLinesData(symbol, interval) {
        try {
            const response = await axios.get(
                `${this.apiUrl}/klines?symbol=${symbol}&interval=${interval}&limit=300`
            );
            return {
                symbol,
                ...processIndicators(response.data),
                lastUpdated: new Date()
            };
        } catch (error) {
            console.error(`Erro ao processar ${symbol} (${interval}):`, error);
            return null;
        }
    }
}

module.exports = new BinanceService();