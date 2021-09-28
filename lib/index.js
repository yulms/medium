import tr from 'tor-request';

const ports = [9050, 9052, 9053, 9054];
let currentPortIndex = 0;

function getPort() {
  const port = ports[currentPortIndex];
  currentPortIndex = ports.indexOf(currentPortIndex) === ports.length - 1 ? 0 : currentPortIndex + 1;
  return port;
}

function start() {
  const doIteration = () => {
    console.log(getPort());
    tr.setTorAddress('127.0.0.1', getPort());
    tr.request('https://api.ipify.org', (err, res, body) => {
      if (!err && res.statusCode === 200) {
        console.log(`Your public (through Tor) IP is: ${body}`);
      }
    });

    tr.newTorSession(doIteration);
  };

  doIteration();
}

tr.TorControlPort.password = 'lbhtrnjh';
start();
