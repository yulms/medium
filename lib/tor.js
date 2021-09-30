/*
  Интерфейс:
  setPort(port): переключение порта (новый IP, соответствующий порту);
  setNextPort(): переключение на слудующий порт (IP);
  needle(type, url, options): обрертка над методом needle, возвращает промис результата запроса
  renewSession(): создается новое соединение с Tor (меняется набор IP). Рекомендуется не чаще 30 сек.
*/

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
  #currentSocksPort;
  #agent;
  #count = 0;
  #portToUserAgent;
  #userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Edg/92.0.902.84',
  ]

  constructor() {
    this.#bindUserAgentsToPorts();
    this.setPort(this.socksPorts[0]);
  }

  #bindUserAgentsToPorts() {
    const getRandomUserAgent = () => {
      const randomIndex = Math.floor(Math.random() * (this.#userAgents.length - 1));
      return this.#userAgents[randomIndex];
    };
    const portsWithUserAgents = this.socksPorts.map((port) => [port, getRandomUserAgent()]);
    this.#portToUserAgent = new Map(portsWithUserAgents);
  }

  #createAgent(port) {
    const proxyUri = `${this.protocol}${this.ipAddress}:${port}`;
    const socksAgent = SocksProxyAgent(proxyUri);
    return socksAgent;
  }

  setPort(port) {
    this.#agent = this.#createAgent(port);
    this.#currentSocksPort = port;
  }

  setNextPort() {
    this.#count += 1;
    const port = this.socksPorts[this.#count % this.socksPorts.length];
    this.#agent = this.#createAgent(port);
  }

  async needle(type = 'get', url = 'https://api.ipify.org', params = {}) {
    const options = {
      agent: this.#agent,
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US',
        // referer: 'https://www.google.com/',
        'user-agent': this.#portToUserAgent.get(this.#currentSocksPort),
        // connection: 'Keep-Alive',
      },
      ...params,
    };
    const response = await needle(type, url, options);
    return response;
  }

  renewSession(password = '') {
    const commands = [
      `authenticate "${password}"`,
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
