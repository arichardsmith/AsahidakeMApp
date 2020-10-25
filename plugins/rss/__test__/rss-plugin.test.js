const { join } = require("path");

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

beforeEach(() => {
  fetch.mockClear();
  fs.writeFile.mockClear();
});

test("plugin runs successfully", async () => {
  const opts = pluginSetup();
  await plugin.onPreBuild(opts);

  expect(fs.writeFile).toBeCalled();

  const writeFile = fs.writeFile.mock.calls[0][0];
  expect(writeFile).toEqual(opts.inputs.filename);
  
  const writeContent = JSON.parse(fs.writeFile.mock.calls[0][1]);
  expect(writeContent.posts.length).toBeGreaterThan(0);

  const firstPost = writeContent.posts[0];
  expect(firstPost.date).toBe("2020-10-16T06:53:26.000Z");
  expect(firstPost.title).toBe("【大雪山国立公園・旭岳情報】雪景色");
  expect(firstPost.headPic).toBe("https://blogimg.goo.ne.jp/user_image/0d/80/cf91f6785ee142c259ea5a81adcb9ff5.jpg");
  expect(firstPost.description).toMatch(new RegExp("姿見の池園地はすっかり冬の様子になっています。"));
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

  const writeContent = JSON.parse(fs.writeFile.mock.calls[0][1]);
  expect(writeContent.posts.length).toBeGreaterThan(0);
});

test("plugin retries on parse error", async () => {
  fetch.mockImplementationOnce(() => {
    const { Response } = jest.requireActual("node-fetch");
    return Promise.resolve(new Response("This ain't xml"));
  });

  await plugin.onPreBuild(pluginSetup());

  expect(fetch).toBeCalledTimes(2);
  expect(fs.writeFile).toBeCalled();

  const writeContent = JSON.parse(fs.writeFile.mock.calls[0][1]);
  expect(writeContent.posts.length).toBeGreaterThan(0);
});

test("plugin includes updated timestamp", async () => {
  const opts = pluginSetup();
  await plugin.onPreBuild(opts);

  expect(fs.writeFile).toBeCalled();
  const writeContent = JSON.parse(fs.writeFile.mock.calls[0][1]);

  expect(writeContent.updated).toBeDefined();
})