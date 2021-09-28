import needle from 'needle';
import SocksProxyAgent from 'socks-proxy-agent';
import net from 'net';
import os from 'os';

const ports = [9050, 9052, 9053, 9054, 9055];

function createAgent(port = 9050) {
  const protocol = 'socks://';
  const ipAddress = '127.0.0.1';
  const proxyUri = `${protocol}${ipAddress}:${port}`;
  const socksAgent = SocksProxyAgent(proxyUri);
  return socksAgent;
}

const torControlPort = {
  password: '', // password for ControlPort
  host: 'localhost',
  port: 9051,

  send(commands, callback) {
    const socket = net.connect({
      host: this.host || 'localhost',
      port: this.port || 9051,
    }, () => {
      const commandString = `${commands.join('\n')}\n`;
      socket.write(commandString);
    });

    socket.on('error', (err) => {
      console.log(err, 'ControlPort communication error');
    });

    let data = '';
    socket.on('data', (chunk) => {
      data += chunk.toString();
    });

    socket.on('end', () => {
      callback(null, data);
    });
  },
};

function newTorSession(callback) {
  const password = torControlPort.password || '';
  const commands = [
    `authenticate "${password}"`, // authenticate the connection
    'signal newnym', // send the signal (renew Tor session)
    'quit', // close the connection
  ];

  torControlPort.send(commands, (err, data) => {
    if (err) {
      attachCommonControlPortErrorDetails(err);
      callback(err);
    } else {
      const lines = data.split(os.EOL).slice(0, -1);

      const success = lines.every((val, ind, arr) =>
        // each response from the ControlPort should start with 250 (OK STATUS)
        val.length <= 0 || val.indexOf('250') >= 0);

      if (!success) {
        var err = new Error(`Error communicating with Tor ControlPort\n${data}`);
        attachCommonControlPortErrorDetails(err);
        callback(err);
      } else {
        callback(null, 'Tor session successfully renewed!!');
      }
    }
  });
}

const agent = createAgent();
const { body: response } = await needle('get', 'https://api.ipify.org', { agent });
console.log(response);
