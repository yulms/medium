import randomUseragent from 'random-useragent';

const filter = '';
const agent = randomUseragent.getRandom((ua) => ua.browserName === 'Chrome'); // gets a random user agent string
console.log(agent);
