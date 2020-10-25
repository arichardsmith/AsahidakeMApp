const loadFeed = require("../common/load-feed.js");

const FEED_URL = "https://blog.goo.ne.jp/2291yamaiku/rss2.xml";

/**
 * Read RSS feed and return its content
 * 
 * TODO: Add cache control header
 */
exports.handler = async function (event, context) {
  try {
    const rss = await loadFeed(FEED_URL);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      body: JSON.stringify(rss),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: `500 Internal Server Error\n${err.msg}`,
    };
  }
};
