const { promisify } = require("util");
const { writeFile: writeFileCB } = require("fs");
const writeFile = promisify(writeFileCB);

const fetch = require("node-fetch");
const RSSParser = require("rss-parser");

const rss = new RSSParser();

const BACKOFF = 2;

module.exports = {
  async onPreBuild({ inputs, utils }) {
    const { feedUrl, filename, retries = 0, retryDelay = 2 } = inputs;

    let result = undefined;

    for (let i = 0; i < retries; i++) {
      const [fetchErr, xmlContent] = await tryCatch(async () => {
        const res = await fetch(feedUrl);
        if (!res.ok) {
          throw new Error(`${res.statusCode}: ${res.statusText}`);
        }
        return await res.text();
      });

      if (fetchErr !== null) {
        console.log(
          `Fetch failed with error "${fetchErr.message}". Retrying ${
            retries - i
          } times`
        );
      } else {
        const [parseErr, feed] = await tryCatch(async () => {
          const feed = await rss.parseString(xmlContent);

          return {
            posts: feed.items.map(parseItem),
          };
        });

        if (parseErr !== null) {
          console.log(
            `Parse failed with error "${parseErr.message}". Retrying ${
              retries - i
            } times`
          );
        } else {
          result = feed;
          break;
        }
      }

      const retryTime = retryDelay * 1000 * Math.pow(BACKOFF, i);
      await wait(retryTime);
    }

    if (result === undefined) {
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

    result.updated = (new Date(Date.now())).toISOString()
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

/**
 * Run a (async) function with go style errors.
 * Saves nesting hell of try catch statements.
 * @param {function} fn
 */
async function tryCatch(fn) {
  try {
    return [null, await fn()];
  } catch (err) {
    return [err, null];
  }
}

/**
 * Format an individual post for use in blog template
 * @param {*} post - Post data from feed
 */
function parseItem(post, i) {
  let headPic = null;
  if (post.enclosure !== undefined && post.enclosure.url !== undefined) {
    headPic = post.enclosure.url;
  }

  const description = post.content
    .replace(/\\n<p>/g, "<p>") //delete '/n'
    .replace(/style=\\(".*?"|'.*?'|[^'"])*?\//g, "") //delete 'style'
    .replace(/\\/g, ""); //delete '\'

  return {
    id: i,
    date: post.isoDate,
    title: post.title,
    headPic,
    description,
  };
}
