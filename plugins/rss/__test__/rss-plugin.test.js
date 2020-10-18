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
  expect(writeContent).toEqual(loadResult());
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

test("plugin restores cached data if fetch fails", async () => {
  fetch.mockImplementationOnce(() => {
    throw new Error("Fetch error");
  });

  const has = jest.fn(() => Promise.resolve(true));
  const restore = jest.fn(() => Promise.resolve());

  const opts = pluginSetup({
    inputs: {
      retries: 0,
    },
    cache: {
      has,
      restore,
    },
  });

  await plugin.onPreBuild(opts);

  expect(has).toBeCalledWith(opts.inputs.filename);
  expect(restore).toBeCalledWith(opts.inputs.filename);
});

test("plugin adds content if provided by webhook", async () => {
  fetch.mockImplementationOnce(() => {
    throw new Error("Fetch error");
  });

  const has = jest.fn(() => Promise.resolve(true));
  const restore = jest.fn((filename) => {
    const content = loadResult();

    return new Promise((resolve, reject) => {
      fs.writeFile(filename, content, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  const opts = pluginSetup({
    inputs: { retries: 0 },
    cache: {
      has,
      restore,
    },
  });

  process.env.INCOMING_HOOK_BODY = encodeURIComponent(
    JSON.stringify({
      title: "Test post",
      date: "2020-10-16T06:53:26.000Z",
      headPic:
        "https://blogimg.goo.ne.jp/user_image/0d/80/cf91f6785ee142c259ea5a81adcb9ff5.jpg",
      description: "A fake post",
    })
  );

  await plugin.onPreBuild(opts);

  const expected = JSON.parse(loadResult());
  const newPost = {
    id: 0,
    date: "2020-10-16T06:53:26.000Z",
    title: "Test post",
    headPic:
      "https://blogimg.goo.ne.jp/user_image/0d/80/cf91f6785ee142c259ea5a81adcb9ff5.jpg",
    description: "A fake post",
  };

  expected.posts = [
    newPost,
    ...expected.posts.map((post) => {
      post.id++;
      return post;
    }),
  ];

  const output = JSON.parse(fs.vfs.get(resolve(opts.inputs.filename)));
  expect(output).toMatchObject(expected);
});
