// Set up filesystem mock first
const fs = jest.requireActual('fs');
fs.writeFile = jest.fn(function writeFile(file, data, cb) {
  process.nextTick(() => cb(null));
});

jest.mock('node-fetch');
jest.mock('xml2json');

const fetch = require('node-fetch');
const { Response } = jest.requireActual('node-fetch');

const xmlParser = require('xml2json');
const realXMLParser = jest.requireActual('xml2json');

const { resolve } = require('path');
// Helper function to resolve path names
const r = (...file) => resolve(__dirname, ...file);

const plugin = require('./index.js');

/**
 * Mock a fetch response with the text xml data
 */
function loadFixture() {
  return new Promise((resolve, reject) => {
    fs.readFile(r('./fixture.xml'), (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(new Response(content));
      }
    });
  });
}

/**
 * Run the plugin with the given feed settings
 * @param {*} feedOpts - Feed options to override the defaults
 */
function testRun(feedOpts) {
  // Mock for netlify plugin utils
  const utils = {
    cache: {
      has: () => false,
      save: () => void 1,
    },
  };

  // Mock feed
  const feed = {
    name: 'test-feed',
    url: 'http://test-feed.com',
    ttl: 120,
    ...feedOpts,
  };

  const inputs = {
    feeds: [feed],
    dataDir: './',
  };

  return plugin.onPreBuild({ inputs, utils });
}

// Reset the mocks on every test
beforeEach(() => {
  fetch.mockClear();
  fs.writeFile.mockClear();
  xmlParser.toJson.mockClear();
});

test('it writes the correct JSON output under normal circumstances', async () => {
  fetch.mockImplementation(loadFixture);
  xmlParser.toJson.mockImplementation((...args) =>
    realXMLParser.toJson(...args)
  );

  await testRun();

  expect(fs.writeFile).toHaveBeenCalled();
  expect(fs.writeFile.mock.calls[0][1]).toMatchSnapshot();
});

test('it retries if fetch fails', async () => {
  fetch
    .mockImplementationOnce(() => Promise.reject('Fetch error'))
    .mockImplementation(loadFixture);

  xmlParser.toJson.mockImplementation((...args) =>
    realXMLParser.toJson(...args)
  );

  await testRun({ retries: 2, retryDelay: 0.1 });

  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fs.writeFile).toHaveBeenCalled();
  expect(fs.writeFile.mock.calls[0][1]).toMatchSnapshot();
});

test('it retries if parse fails', async () => {
  fetch.mockImplementation(loadFixture);

  xmlParser.toJson
    .mockImplementationOnce(() => {
      throw new Error('Parse error');
    })
    .mockImplementation((...args) => realXMLParser.toJson(...args));

  await testRun({ retries: 2, retryDelay: 0.1 });

  expect(fetch).toHaveBeenCalledTimes(2);
  expect(xmlParser.toJson).toHaveBeenCalledTimes(2);
  expect(fs.writeFile).toHaveBeenCalled();
  expect(fs.writeFile.mock.calls[0][1]).toMatchSnapshot();
});

test('it gives up after given tries', async () => {
  fetch
    .mockImplementationOnce(() => Promise.reject('Fetch error'))
    .mockImplementationOnce(() => Promise.reject('Fetch error'))
    .mockImplementation(loadFixture);

  xmlParser.toJson.mockImplementation((...args) =>
    realXMLParser.toJson(...args)
  );

  await expect(testRun({ retries: 1, retryDelay: 0.1 })).rejects.toThrow();

  expect(fetch).toHaveBeenCalledTimes(2);
  expect(xmlParser.toJson).not.toHaveBeenCalled();
  expect(fs.writeFile).not.toHaveBeenCalled();
});

test('it times out', async () => {
  fetch.mockImplementation(loadFixture);

  xmlParser.toJson.mockImplementation(() => {
    throw new Error('Parse Error');
  });

  await expect(
    testRun({ retries: 10, retryDelay: 0.1, timeout: 3 })
  ).rejects.toThrow();

  expect(fetch).toHaveBeenCalled();
  expect(fs.writeFile).not.toHaveBeenCalled();
});
