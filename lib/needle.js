import needle from 'needle';
import SocksProxyAgent from 'socks-proxy-agent';

const ports = [9050, 9052, 9053, 9054, 9055];

function createAgent(port) {
  const protocol = 'socks://';
  const ipAddress = '127.0.0.1';
  const proxyUri = `${protocol}${ipAddress}:${port}`;
  const socksAgent = SocksProxyAgent(proxyUri);
  return socksAgent;
}

ports.forEach((port, index) => {
  console.log(port);
  const agent = createAgent(port);
  needle.get('https://api.ipify.org', { agent }, (error, response) => {
    if (!error && response.statusCode === 200) {
      console.log(`port: ${port}, index: ${index}, ip: ${response.body}`);
    }
  });
});

// const response2 = await needle('get', 'https://api.ipify.org');
// console.log(response2.body);
