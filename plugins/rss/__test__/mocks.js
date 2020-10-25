jest.mock("fs", () => {
  const fs = jest.requireActual("fs");

  return {
    ...fs,
    writeFile: jest.fn((filename, data, cb) => {
      cb();
    })
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
