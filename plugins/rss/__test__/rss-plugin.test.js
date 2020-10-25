const { join, resolve } = require("path");

// Apply mocks
require("./mocks");

const fs = require("fs");
const fetch = require("node-fetch");
const plugin = require("../index.js");

function pluginSetup(opts = {}) {
  if (opts.inputs === undefined) {
    opts.inputs = {};
  }

  if (opts.cache === undefined) {
    opts.cache = {};
  }

  return {
    inputs: {
      filename: join(__dirname, "./temp/output.json"),
      errorFile: join(__dirname, "./temp/error.txt"),
      feedUrl: "https://blog.goo.ne.jp/2291yamaiku/rss2.xml",
      retries: 3,
      retryDelay: 0.1,
      ...opts.inputs,
    },
    utils: {
      cache: {
        has: jest.fn(() => false),
        save: () => void 0,
        restore: jest.fn(() => void 0),
        ...opts.cache,
      },
    },
  };
}

function loadResult() {
  return fs.vfs.get("__result__");
}

beforeEach(() => {
  fetch.mockClear();
  fs.writeFile.mockClear();
  fs.resetVFS();
});

test("plugin runs successfully", async () => {
  const opts = pluginSetup();
  await plugin.onPreBuild(opts);

  expect(fs.writeFile).toBeCalled();

  const writeFile = fs.writeFile.mock.calls[0][0];
  const writeContent = fs.writeFile.mock.calls[0][1];

  expect(writeFile).toEqual(opts.inputs.filename);
  const writeObj = JSON.parse(writeContent);
  const fixtObj = JSON.parse(loadResult());
  
  expect(writeObj).toMatchObject(fixtObj)
});

test("plugin favors new data over cached", async () => {
  const pluginOpts = pluginSetup({
    cache: {
      has: () => Promise.resolve(true),
    },
  });

  await plugin.onPreBuild(pluginOpts);

  expect(pluginOpts.utils.cache.restore).not.toBeCalled();
});

test("plugin retries on fetch error", async () => {
  fetch
    .mockImplementationOnce(() => {
      throw new Error("Test error");
    })
    .mockImplementationOnce(() => {
      throw new Error("Test error");
    });

  await plugin.onPreBuild(pluginSetup());

  expect(fetch).toBeCalledTimes(3);
  expect(fs.writeFile).toBeCalled();
  expect(fs.writeFile.mock.calls[0][1]).toEqual(loadResult());
});

test("plugin retries on parse error", async () => {
  fetch.mockImplementationOnce(() => {
    const { Response } = jest.requireActual("node-fetch");
    return Promise.resolve(new Response("This ain't xml"));
  });

  await plugin.onPreBuild(pluginSetup());

  expect(fetch).toBeCalledTimes(2);
  expect(fs.writeFile).toBeCalled();
  expect(fs.writeFile.mock.calls[0][1]).toEqual(loadResult());
});
