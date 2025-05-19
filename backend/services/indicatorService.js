/**
 * Calcula todos os indicadores técnicos
 */
function calculateEMA(closes, period) {
    const k = 2 / (period + 1);
    let ema = closes.slice(0, period).reduce((a, b) => a + b) / period;
    
    for (let i = period; i < closes.length; i++) {
        ema = closes[i] * k + ema * (1 - k);
    }
    return ema;
}

function processIndicators(klines) {
    const closes = klines.map(c => parseFloat(c[4]));
    const currentPrice = closes[closes.length - 1];
    
    return {
        currentPrice,
        ema9: calculateEMA(closes, 9),
        ema12: calculateEMA(closes, 12),
        ema26: calculateEMA(closes, 26),
        ema50: calculateEMA(closes, 50),
        ema100: calculateEMA(closes, 100),
        ema200: calculateEMA(closes, 200)
    };
}

module.exports = {
    processIndicators
};


// Adicione cálculos mais precisos para os EMAs
function calculateEMAs(closes) {
    return {
        ema9: calculateEMA(closes, 9),
        ema12: calculateEMA(closes, 12),
        ema26: calculateEMA(closes, 26),
        ema50: calculateEMA(closes, 50),
        ema100: calculateEMA(closes, 100),
        ema200: calculateEMA(closes, 200)
    };
}

// Atualize a função processIndicators
function processIndicators(klines) {
    const closes = klines.map(c => parseFloat(c[4]));
    const currentPrice = closes[closes.length - 1];
    
    return {
        currentPrice,
        ...calculateEMAs(closes)
    };
}