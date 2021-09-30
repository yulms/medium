import tor from './tor.js';

// function getRandomInterval(interval, spread = 0.5) {
//   const min = interval * (1 - spread);
//   const max = interval * (1 + spread);
//   return Math.floor(Math.random() * (max - min + 1) + min);
// }

function start() {
  tor.socksPorts.forEach((port) => {
    const doIteration = async () => {
      tor.setPort(port);
      // const timeStart = Date.now();
      const result = await tor.needle('get', 'https://medium.com/');
      const requestInfo = result.req;
      // console.log(requestInfo._headerSent);
      console.log(requestInfo._header);

      // GET / HTTP/1.1
      // accept: */*
      // user-agent: Needle/3.0.0 (Node.js v14.17.6; win32 x64)
      // host: medium.com
      // Connection: close

      // const requestTime = Date.now() - timeStart;
      // const timeout = Math.max(getRandomInterval(10000) - requestTime, 0);
      // setTimeout(doIteration, timeout, count + 1);
    };

    doIteration();
  });
}

start();
setTimeout(() => {
  console.log('ss');
  tor.renewSession('lbhtrnjh');
}, 20000);
