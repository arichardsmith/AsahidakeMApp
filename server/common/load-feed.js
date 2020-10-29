const fetch = require("node-fetch");
const RSSParser = require("rss-parser");

module.exports = async function loadFeed(url) {
  let rssContent;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Fetch failed\n${res.statusText}`);
    }

    rssContent = await res.text();
  } catch (err) {
    err.message = `Fetch failed\n${err.message}`;
    throw err;
  }

  const rss = new RSSParser();

  try {
    const feed = await rss.parseString(rssContent);
    const posts = feed.items.map(parseItem);

    const parsedFeed = {
      updated: posts[0].date,
      posts,
    };

    return parsedFeed;
  } catch (err) {
    err.message = `RSS parse failed\n${err.message}`;
    throw err;
  }
};

function parseItem(post, i) {
  let headPic = null;
  if (post.enclosure !== undefined && post.enclosure.url !== undefined) {
    headPic = post.enclosure.url;
  }

  const description = post.content
    .replace(/\\n<p>/g, "<p>") //delete '/n'
    .replace(/style=\\(".*?"|'.*?'|[^'"])*?\//g, "") //delete 'style'
    .replace(/\\/g, "") //delete '\'
    .replace(/キタキツネ/g, "キタキツネ🦊")     //🤫🤫🤫  
    .replace(/エゾシカ/g, "エゾシカ🦌")         
    .replace(/エゾシマリス/g, "エゾシマリス🐿");

  return {
    id: i,
    date: post.isoDate,
    title: post.title,
    headPic,
    description,
  };
}
