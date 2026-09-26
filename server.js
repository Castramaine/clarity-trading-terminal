const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, status: 'Clarity server running' });
});

app.get('/api/market', async (req, res) => {
  const { symbol, interval = '1h', limit = '500', apiKey = '' } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Missing symbol' });
  }

  const isCrypto = /USDT$/i.test(symbol) || /BTC|ETH|SOL|XRP|ADA|DOGE|BNB|AVAX/i.test(symbol);

  try {
    if (isCrypto) {
      const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${Number(limit) || 500}`;
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        return res.status(response.status).json({ error: 'Binance request failed', details: text });
      }

      const data = await response.json();
      const candles = data.map(d => ({
        time: d[0] / 1000,
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5]),
      }));

      return res.json(candles);
    }

    const key = apiKey || process.env.FINNHUB_API_KEY;
    if (!key) {
      return res.status(401).json({ error: 'Finnhub API key required for stock symbols' });
    }

    const intervalMap = { '15m': '15', '1h': '60', '4h': '60', '1d': 'D' };
    const resolution = intervalMap[interval] || '60';
    const to = Math.floor(Date.now() / 1000);
    const secondsMap = {
      '15m': 900,
      '1h': 3600,
      '4h': 14400,
      '1d': 86400,
    };
    const from = to - ((Number(limit) || 500) * (secondsMap[interval] || 3600));

    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}&token=${encodeURIComponent(key)}`;
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: 'Finnhub request failed', details: text });
    }

    const data = await response.json();
    if (data.s !== 'ok') {
      return res.status(400).json({ error: 'Invalid symbol or key for Finnhub', details: data });
    }

    const candles = data.t.map((time, index) => ({
      time: Number(time),
      open: Number(data.o[index]),
      high: Number(data.h[index]),
      low: Number(data.l[index]),
      close: Number(data.c[index]),
      volume: Number(data.v[index]),
    }));

    return res.json(candles);
  } catch (err) {
    console.error('Market fetch failed:', err);
    return res.status(500).json({ error: 'Failed to fetch market data', details: err.message });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Clarity app is running on http://localhost:${PORT}`);
});
