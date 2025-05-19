// (Núcleo do Cache)

const BinanceService = require('./binanceService');

class CacheManager {
    constructor() {
        this.cache = {
            '1h': { coins: [], top200: [], lastUpdated: null },
            '4h': { coins: [], top200: [], lastUpdated: null },
            '1d': { coins: [], top200: [], lastUpdated: null }
        };
        this.isUpdating = false;
        this.lastGlobalUpdate = null; // Guarda a última atualização geral
    }

    /**
     * Atualiza todos os dados no cache
     */
    async updateAllData() {
        if (this.isUpdating) return;
        this.isUpdating = true;

        try {
            const top200 = await BinanceService.getTop200Coins();

            await Promise.all([
                this.updateTimeframe('1h', top200),
                this.updateTimeframe('4h', top200),
                this.updateTimeframe('1d', top200)
            ]);

            this.lastGlobalUpdate = new Date(); // Atualiza data da última atualização geral

            // Console log só no backend (para você ver no terminal)
            console.log('✅ Cache atualizado:', this.lastGlobalUpdate);
        } catch (error) {
            console.error('❌ Erro na atualização:', error);
        } finally {
            this.isUpdating = false;
        }
    }

    /**
     * Atualiza um timeframe específico
     */
    async updateTimeframe(interval, top200) {
        const coins = [];

        for (const symbol of top200) {
            const data = await BinanceService.getKLinesData(symbol, interval);
            if (data) coins.push(data);
        }

        this.cache[interval] = {
            coins,
            top200,
            lastUpdated: new Date()
        };
    }

    /**
     * Retorna dados cacheados para o front-end (sem lastGlobalUpdate)
     */
    getData(interval) {
        return this.cache[interval] || { coins: [], top200: [], lastUpdated: null };
    }

    /**
     * Método para você consultar a última atualização geral, somente no backend
     */
    getLastUpdate() {
        return this.lastGlobalUpdate;
    }
}

const cacheManager = new CacheManager();

/**
 * Inicia o serviço de atualização automática
 */
function startDataUpdates() {
    // Atualiza imediatamente ao iniciar
    cacheManager.updateAllData();

    // Agenda atualizações periódicas (tempo em minutos definido nas variáveis de ambiente)
    setInterval(
        () => cacheManager.updateAllData(),
        process.env.UPDATE_INTERVAL_MINUTES * 60 * 1000
    );
}

module.exports = {
    cacheManager,
    getCachedData: (interval) => cacheManager.getData(interval),
    startDataUpdates
};
