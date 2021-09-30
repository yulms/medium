// import ccxt from 'ccxt';
import ObjectsToCsv from 'objects-to-csv';

// async function getTrades(exchangeName, pair, date) {
//   const exchange = new ccxt[exchangeName]();
//   await exchange.loadMarkets();

//   const since = new Date(date).getTime();
//   const allTrades = await exchange.fetchTrades(pair, since, 1000);
//   const trades = allTrades
//     .map((trade) => ({
//       datetime: trade.datetime,
//       timestamp: trade.timestamp,
//       side: trade.side,
//       price: trade.price,
//       amount: trade.amount,
//       cost: trade.cost,
//     }));
//   console.table(trades);
//   const csv = new ObjectsToCsv(trades);
//   // Save to file:
//   await csv.toDisk('./trade.csv');
// }
// console.log(new Date(1632974023601).toLocaleTimeString());
// getTrades('gateio', 'FIDA/USDT', new Date(2021, 8, 30, 5, 29, 0));

import needle from 'needle';

// 1716460715
// const result = await needle('get', 'https://data.gateapi.io/api2/1/tradeHistory/fida_usdt');
const result = await needle('get', 'https://data.gateapi.io/api2/1/tradeHistory/fida_usdt/1715750715');
console.log(result.body);
const trades = result.body.data
  .map((trade) => ({
    tradeId: trade.tradeID,
    datetime: trade.date,
    side: trade.type,
    price: trade.rate,
    amount: trade.amount,
    cost: trade.total,
  }));

console.table(trades);
const csv = new ObjectsToCsv(trades);
// Save to file:
await csv.toDisk('./trade.csv');
