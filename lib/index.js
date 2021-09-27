import tr from 'tor-request';

// const tr = require('tor-request');

tr.request('https://api.ipify.org', (err, res, body) => {
  console.log(err);
  if (!err && res.statusCode === 200) {
    console.log(`Your public (through Tor) IP is: ${body}`);
  }
});
