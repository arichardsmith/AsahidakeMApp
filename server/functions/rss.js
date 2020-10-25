const loadFeed = require("../common/load-feed.js");

const FEED_URL = "https://blog.goo.ne.jp/2291yamaiku/rss2.xml";

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
      statusCode: 503,
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: `503 Internal Server Error\n${err.msg}`,
    };
  }
};
