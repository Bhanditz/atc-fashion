const fashion_redirects = require('../fashion_redirects');
const expect = require('chai').expect;
const { promisify } = require('util');
const redisUrl = 'redis://localhost:16379';
const redisClient = fashion_redirects.createRedisClient({ redisUrl: redisUrl });
const redisSet = promisify(redisClient.set).bind(redisClient);

describe('main()', () => {
  before(() => {
    redisSet('/', 'http://example.org/');
  });

  after(() => {
    redisClient.quit();
  });

  it('should return statusCode 400 if no path is passed', () => {
    let response = fashion_redirects.main();
    expect(response.statusCode).to.equal(400);
  });

  it('should return a redirect if valid path is passed', (done) => {
    let mainPromise = fashion_redirects.main({
      redisUrl: redisUrl,
      __ow_path: '/'
    });

    mainPromise.then((response) => {
      expect(response.statusCode).to.equal(301);
      expect(response.headers.location).to.equal('http://example.org/');
    }).finally(done);
  });

  it('should return statusCode 404 if invalid path is passed', (done) => {
    let mainPromise = fashion_redirects.main({
      redisUrl: redisUrl,
      __ow_path: '/invalid'
    });

    mainPromise.then((response) => {
      expect(response.statusCode).to.equal(404);
    }).finally(done);
  });
});
