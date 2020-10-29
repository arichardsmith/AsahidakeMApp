const { promisify } = require("util");
const { writeFile: writeFileCB } = require("fs");
const writeFile = promisify(writeFileCB);

const loadFeed = require("../../server/common/load-feed.js");

module.exports = {
  async onPreBuild({ inputs, utils }) {
    const { feedUrl, filename, retries = 0, retryDelay = 2 } = inputs;

    let result = await retry(() => loadFeed(feedUrl), retries, retryDelay);

    if (result === null) {
      if (await utils.cache.has(filename)) {
        await utils.cache.restore(filename);

        console.log("Restored from cache");
        return;
      } else {
        result = {
          posts: [], // Set to an empty array so the json is valid
        };
        console.log("No file in cache, will output an empty file");
      }
    }

    const data = JSON.stringify(result);

    await writeFile(filename, data);
    await utils.cache.save(filename, { ttl: 3 * 24 * 60 * 60 }); // Cache for 3 days
    console.log("Successfully wrote rss json");
  },
};

/**
 * Pause async excecution for given period
 * @param {number} ms - Time to pause for (in ms)
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

async function retry(fn, retries, retryDelay) {
  try {
    return await fn();
  } catch (err) {
    const remainingTries = retries - 1;
    if (remainingTries > 0) {
      console.log(
        `Failed to load feed. ${err.message}\nRetrying ${retries - 1} times`
      );

      const retryTime = retryDelay;
      await wait(retryTime);
      return retry(fn, remainingTries, retryDelay);
    } else {
      console.log(`Failed to load feed. ${err.message}`);
      return null;
    }
  }
}
