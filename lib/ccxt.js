import ccxt from 'ccxt';
import ObjectsToCsv from 'objects-to-csv';

async function getTrades(exchangeName, pair, date) {
  const exchange = new ccxt[exchangeName]();
  await exchange.loadMarkets();

  const since = new Date(date).getTime();
  const allTrades = await exchange.fetchTrades(pair, since, 1000);
  const trades = allTrades
    .map((trade) => ({
      datetime: trade.datetime,
      timestamp: trade.timestamp,
      side: trade.side,
      price: trade.price,
      amount: trade.amount,
      cost: trade.cost,
    }));
  console.table(trades);
  const csv = new ObjectsToCsv(trades);
  // Save to file:
  await csv.toDisk('./trade.csv');
}
console.log(new Date(1632974023601).toLocaleTimeString());
getTrades('gateio', 'FIDA/USDT', new Date(2021, 8, 30, 5, 29, 0));
