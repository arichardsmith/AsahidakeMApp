const { promisify } = require('util');
const writeFile = promisify(require('fs').writeFile);

const fetch = require('node-fetch');
const parser = require('xml2json');
const c = require('ansi-colors');

/**
 * Edited version of https://github.com/philhawksworth/netlify-plugin-fetch-feeds/blob/master/index.js
 * with:
 * - Error handling
 * - Retries
 * - Backoff
 */

const BACKOFF = 2;

module.exports = {
  onPreBuild({ inputs, utils }) {
    if (!Array.isArray(inputs.feeds)) {
      // No feeds to process
      return;
    }

    const feedTasks = inputs.feeds.map((feed) =>
      processFeed(feed, inputs, utils)
    );

    return Promise.all(feedTasks);
  },
};

/**
 * Process an individual feed
 * @param {*} feed
 */
async function processFeed(feed, inputs, utils) {
  // Where to write the output json to
  const dataFilePath = `${inputs.dataDir}/${feed.name}.json`;

  // reinstate from cache if it is present
  if (await utils.cache.has(dataFilePath)) {
    await utils.cache.restore(dataFilePath);
    console.log('Restored from cache:', c.green(feed.url));

    return;
  } else {
    // If it's not cached, let's fetch it and cache it.

    const tries = feed.retries !== undefined ? feed.retries + 1 : 1;
    const delay = feed.retryDelay !== undefined ? feed.retryDelay : 2; // Default to 2s
    const timeout = feed.timeout !== undefined ? feed.timeout : 120; // Default to 2m

    const start = Date.now();
    const cutoff = start + timeout * 1000;

    let json;

    for (let i = 1; i <= tries; i++) {
      try {
        json = await doLoad(feed.url);
        break; // Stop looping early
      } catch (err) {
        const time = Math.round((Date.now() - start) / 1000);
        if (i === tries || Date.now() > cutoff) {
          // Last try
          throw new Error(
            `${c.red('Error: ')} Unable to load rss feed at ${
              feed.url
            } after ${tries} tries and ${time}s`
          );
        } else {
          console.warn(
            c.yellow('Warning: '),
            `Load failed, trying again ${tries - i} times`,
            c.grey(`(${time}s)`)
          );

          const retryTime = delay * 1000 * Math.pow(BACKOFF, i);
          await wait(retryTime);
        }
      }
    }

    const data = JSON.stringify(json);
    await writeFile(dataFilePath, data);
    await utils.cache.save(dataFilePath, { ttl: feed.ttl });

    console.log(
      'Fetched and cached: ',
      c.yellow(feed.url),
      c.gray(`(TTL:${feed.ttl} seconds)`)
    );

    return true;
  }
}

/**
 * Attempt to load a feed
 * @param {string} url - Url of feed
 */
async function doLoad(url) {
  let res;

  try {
    res = await fetch(url);
  } catch (err) {
    console.warn(
      c.yellow('Warning:'),
      `Failed to fetch feed from ${url}. The following error occured:`
    );
    console.log(err);
    throw err;
  }

  const contentType = res.headers.get('content-type');
  if (/application\/json/i.test(contentType)) {
    return res.json();
  } else {
    const content = await res.text();
    try {
      const json = parser.toJson(content, { object: true });
      return json;
    } catch (err) {
      console.warn(
        c.yellow('Warning:'),
        `Failed to parse feed at ${feed.url}. The following error occured:`
      );
      console.log(err);
      throw err;
    }
  }
}

/**
 * Pause async excecution for given period
 * @param {number} ms - Time to pause for (in ms)
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}
