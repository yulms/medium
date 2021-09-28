import tr from 'tor-request';

function start() {
  const ports = [9050, 9052, 9053, 9054];

  const doIteration = (count = 0) => {
    const port = ports[count % ports.length];
    // console.log(port);
    tr.setTorAddress('127.0.0.1', port);
    tr.request('https://api.ipify.org', (err, res, body) => {
      if (!err && res.statusCode === 200) {
        console.log(`IP is: ${body}, port: ${port}`);
        if (count === 2) console.timeEnd();
        setTimeout(() => {
          doIteration(count + 1);
        }, 0);
      } else {
        console.log(err);
      }
    });

    // setTimeout(doIteration, 0);
    // setTimeout(() => {
    //   // tr.newTorSession(doIteration);
    //   doIteration();
    // }, 0);
  };
  console.time();
  doIteration();
}

tr.TorControlPort.password = 'lbhtrnjh';
start();
// setTimeout(() => {
//   console.log('замена сессии');
//   tr.newTorSession(() => console.log('сессия заменена'));
// }, 20000);
