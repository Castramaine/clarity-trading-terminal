# Clarity Trading Terminal

A live web app for crypto and stock market analysis with a dark trading-terminal UI, multi-timeframe bias detection, RSI, ADX/SNR, EMA overlays, and live Binance/Finnhub data integration.

## Features
- Live crypto charting via Binance
- Stock charting via Finnhub
- Multi-timeframe trend alignment
- RSI and ADX/SNR panel
- Heikin Ashi toggle
- EMA and VWAP overlays
- API key modal for stock data

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app:
   ```bash
   npm start
   ```

3. Open the app in your browser:
   ```text
   http://localhost:3000
   ```

## Optional environment variable
You can set a default API key for stock data in a `.env` file:

```env
FINNHUB_API_KEY=your_key_here
PORT=3000
```

The frontend also supports saving a Finnhub key in the browser for local use.

## Notes
This app serves a static frontend from `public/index.html` and proxies market data requests through a lightweight Express server.
