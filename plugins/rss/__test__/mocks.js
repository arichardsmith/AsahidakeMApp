jest.mock("fs", () => {
  const fs = jest.requireActual("fs");
  const { resolve } = require("path");

  const vfs = new Map();
  const resetVFS = () => {
    for (let file of vfs.keys()) {
      if (file !== "__result__") {
        vfs.delete(file);
      }
    }
  };

  const resJSON = fs.readFileSync(
    resolve("./plugins/rss/__test__/result.json"),
    "utf-8"
  );
  vfs.set("__result__", resJSON);

  return {
    ...fs,
    readFile: (filename, encoding, cb) => {
      if (typeof encoding === "function") {
        cb = encoding;
      }

      if (vfs.has(filename)) {
        cb(null, vfs.get(filename));
      } else {
        return fs.readFile(filename, encoding, cb);
      }
    },
    writeFile: jest.fn((filename, data, cb) => {
      vfs.set(filename, data);
      cb();
    }),
    vfs,
    resetVFS,
  };
});

jest.mock("node-fetch", () =>
  jest.fn((url, ...args) => {
    const { readFile: readFileCB } = jest.requireActual("fs");
    const { resolve } = require("path");
    const { promisify } = require("util");

    const readFile = promisify(readFileCB);

    const fetch = jest.requireActual("node-fetch");

    async function mockFetch() {
      const feedContent = await readFile(
        resolve("./plugins/rss/__test__/feed.xml"),
        "utf-8"
      );
      return new fetch.Response(feedContent);
    }

    if (url === "https://blog.goo.ne.jp/2291yamaiku/rss2.xml") {
      return mockFetch();
    }

    return fetch(url, ...args);
  })
);
