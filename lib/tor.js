import needle from 'needle';
import SocksProxyAgent from 'socks-proxy-agent';
import net from 'net';
import os from 'os';

class Tor {
  protocol = 'socks://';
  socksPorts = [9050, 9052, 9053, 9054];
  ipAddress = '127.0.0.1';
  controlPortHost = 'localhost';
  controlPort = 9051;
  controlPortPassword = 'lbhtrnjh';
  #agent = this.#createAgent(this.socksPorts[0]);
  #count = 0;

  #createAgent(port) {
    const proxyUri = `${this.protocol}${this.ipAddress}:${port}`;
    const socksAgent = SocksProxyAgent(proxyUri);
    return socksAgent;
  }

  changeIP() {
    this.#count += 1;
    const port = this.socksPorts[this.#count % this.socksPorts.length];
    this.#agent = this.#createAgent(port);
  }

  async needle(type = 'get', url = 'https://api.ipify.org') {
    const response = await needle(type, url, { agent: this.#agent });
    return response;
  }

  createNewSession() {
    const commands = [
      `authenticate "${this.controlPortPassword}"`,
      'signal newnym', // send the signal (renew Tor session)
      'quit', // close the connection
    ];

    return new Promise((resolve, reject) => {
      const socket = net.connect({
        host: this.controlPortHost,
        port: this.controlPort,
      }, () => {
        const commandString = `${commands.join('\n')}\n`;
        socket.write(commandString);
      });

      socket.on('error', (err) => {
        console.log('ControlPort communication error');
        reject(err);
      });

      let data = '';
      socket.on('data', (chunk) => {
        data += chunk.toString();
      });

      socket.on('end', () => {
        const lines = data.split(os.EOL).slice(0, -1);
        // each response from the ControlPort should start with 250 (OK STATUS)
        const success = lines.every((line) => line.length <= 0 || line.includes('250'));
        if (!success) {
          const err = new Error(`Error communicating with Tor ControlPort\n${data}`);
          reject(err);
        }
        resolve('done');
      });
    });
  }
}

const tor = new Tor();
export default tor;

// test

function start() {
  const doIteration = async (count = 0) => {
    tor.changeIP();
    try {
      const response = await tor.needle('get', 'https://medium.com/_/api/collections/c114225aeaf7/latest');
      if (response.statusCode !== 200) throw new Error(`Запрос №${count}. Ошибка ответа сервера. Код: ${response.statusCode}, сообщение: ${response.statusMessage}`);
      // if (!(count % 100)) {
      console.log(`Выполнено ${count} запросов`);
      // }
      setTimeout(doIteration, 500, count + 1);
    } catch (err) {
      console.log(err);
    }
  };
  doIteration();
}

start();

setInterval(() => {
  console.log('Создаем новую сессию');
  tor.createNewSession();
}, 20000);
