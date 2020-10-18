const { promisify } = require("util");
const {
  createWriteStream,
  writeFile: writeFileCB,
  existsSync,
  readFile: readFileCB,
} = require("fs");
const writeFile = promisify(writeFileCB);
const readFile = promisify(readFileCB);

const fetch = require("node-fetch");
const RSSParser = require("rss-parser");
const mkdir = require("mkdirp");
const { dirname } = require("path");

const rss = new RSSParser();

const BACKOFF = 2;

module.exports = {
  async onPreBuild({ inputs, utils }) {
    const {
      feedUrl,
      filename,
      errorFile,
      retries = 0,
      retryDelay = 2,
    } = inputs;

    let result = undefined;
    const log = new Logger(errorFile);

    for (let i = 0; i < retries; i++) {
      const [fetchErr, xmlContent] = await tryCatch(async () => {
        const res = await fetch(feedUrl);
        if (!res.ok) {
          throw new Error(`${res.statusCode}: ${res.statusText}`);
        }
        return await res.text();
      });

      if (fetchErr !== null) {
        log.write(
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
          log.write(
            `Parse failed with error "${parseErr.message}". Retrying ${
              retries - i
            } times`,
            "Feed content:",
            xmlContent
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

        if (process.env.INCOMING_HOOK_BODY !== undefined) {
          // Add new post from webhook
          const post = JSON.parse(
            decodeURIComponent(process.env.INCOMING_HOOK_BODY)
          );
          const content = JSON.parse(await readFile(filename));

          result = {
            posts: [post, ...content.posts].map((post, i) => {
              return {
                ...post,
                id: i,
              };
            }),
          };

          log.write("Restored from cache and adding new post from webhook");
        } else {
          log.write("Restored from cache");
          log.end();

          return;
        }
      } else {
        result = {
          posts: [], // Set to an empty array so the json is valid
        };
        log.write("No file in cache, will output an empty file");
      }
    }

    const data = JSON.stringify(result);
    ensureFile(filename);
    await writeFile(filename, data);
    await utils.cache.save(filename, { ttl: 3 * 24 * 60 * 60 }); // Cache for 3 days
    log.write("Successfully wrote rss json");
    log.end();
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

function ensureFile(filepath) {
  const dir = dirname(filepath);
  if (!existsSync(dir)) {
    mkdir.sync(dir);
  }
}

/**
 * Logging helper. Outputs messages to both the console and a file
 */
class Logger {
  constructor(outputFile) {
    this.stream = null;
    this.target = outputFile;
    this.entries = [];
  }

  writeMsg(msg) {
    if (this.stream === null) {
      ensureFile(this.target);
      this.stream = createWriteStream(this.target);
    }

    this.stream.write(msg + "\n");
  }

  write(...lines) {
    const timestamp = new Date().toISOString();

    lines[0] = `[${timestamp}] ${lines[0]}`;

    const msg = lines.join("\n");
    console.log(lines[0]);
    this.writeMsg(msg);
  }

  end() {
    if (this.stream !== null) {
      this.stream.end();
    }
  }
}
