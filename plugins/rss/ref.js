const fetch = require('node-fetch');
const RSSParser = require('rss-parser');
const rss = new RSSParser();

const FEED_URL = 'https://blog.goo.ne.jp/2291yamaiku/rss2.xml';

/**
 * Load blog feed for template
 */
async function getBlog() {
  let feedXML;
  try {
    const res = await fetch(FEED_URL);
    feedXML = await res.text();
  } catch (err) {
    console.warn('Warning: Error reading blog feed');
    throw err;
  }

  let feed;
  try {
    feed = await rss.parseString(feedXML);
  } catch (err) {
    console.log(feedXML);
    console.warn('Warning: Error parsing blog feed');
    throw err;
  }

  const posts = feed.items.map(parseItem);

  return {
    posts,
  };
}

/**
 * Format an individual post for use in blog template
 * @param {*} post - Post data from feed
 */
function parseItem(post, i) {
  const dateObj = new Date(post.isoDate);
  const weeks = ['日', '月', '火', '水', '木', '金', '土'];
  const date = `${dateObj.getFullYear()}年 ${
    dateObj.getMonth() + 1
  }月 ${dateObj.getDate()}日 ${weeks[dateObj.getDay()]}曜日`;

  const title = post.title;
  const headPic = post.enclosure !== undefined ? post.enclosure.url : null;
  const description = post.content
    .replace(/\\n<p>/g, '<p>') //delete '/n'
    .replace(/style=\\(".*?"|'.*?'|[^'"])*?\//g, '') //delete 'style'
    .replace(/\\/g, ''); //delete '\'

  return {
    id: i,
    date,
    title,
    headPic,
    description,
  };
}

module.exports = getBlog;
