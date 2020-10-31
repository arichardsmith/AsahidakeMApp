import $ from "jquery";

const INVALIDATE_CACHED_DATA = 18; //時間

function renderResult(data, target) {
  // JSONデータを受信した後に実行する処理
  var htmlStr = `
    <div class="column is-8 is-offset-2">
      <h1 class="title is-1">監視員ブログ</h1>
    </div>
    <div class="column is-8 is-offset-2" id="items">`;

  for (let post of data.posts) {
    let headPic = "";
    if (post.headPic !== null) {
      headPic = `<div  id="headPic_${post.id}"><img src="${post.headPic}" /></div>`;
    }

    const dateObj = new Date(post.date);
    const weeks = ["日", "月", "火", "水", "木", "金", "土"];
    const date = `${dateObj.getFullYear()}年 ${
      dateObj.getMonth() + 1
    }月 ${dateObj.getDate()}日 ${weeks[dateObj.getDay()]}曜日`;

    htmlStr += `
      <div class="card article has-background-white-bis" id="item_${post.id}">
        <input id="moreButton_${post.id}" class="readmore-check" type="checkbox">
        <div class="card-content readmore-content">
          <div class="media-content has-text-centered">
            <p id="date_${post.id}">${date}</p>
            <h1 class="title is-size-4" id="headTitle_${post.id}">${post.title}</h1>
            ${headPic}
          </div>
          <div class="content article-body " style="margin:2% 5%; text-align : center;" id="description_${post.id}" >
            ${post.description}
          </div>
        </div>
        <label class="readmore-label button is-link is-light" for="moreButton_${post.id}"></label>
      </div><br/>`;
  }

  htmlStr += `
    <div class="column is-8 is-offset-2">
      <a class = 'is-size-4' href = 'https://blog.goo.ne.jp/2291yamaiku'> 過去のブログはこちら</a>
    </div>`

  $(target).html(htmlStr);
}

export function loadBlog(targetSelector) {
  return new Promise((resolve, reject) => {
    const useNetlifyFunction = () => {
      $.getJSON(".netlify/functions/rss")
      .done(data => {
        renderResult(data, targetSelector);
        resolve()
      })
      .fail(err => {
        // 本ブログに移動させる
        document.location = "https://blog.goo.ne.jp/2291yamaiku";
        reject(err);
      });
    }

    $.getJSON("/CMS/KanshiinBlog.json")
      .fail((err) => {
        // 読めないなら、buildのJSONを読んで見る
        console.warn(
          "Prebuilt jsonを読み込めなかった。RSSフィードを読んでみる"
        );
        
        useNetlifyFunction();
      })
      .done(data => {
        const lastUpdate = new Date(data.updated);
        const invalidate = new Date(Date.now() - (INVALIDATE_CACHED_DATA * 60 * 60 * 1000));

        if (data.posts.length < 1 || lastUpdate < invalidate) {
          // functionで新たなデータを読む
          console.log(
            "Prebuilt jsonはあっていない、RSSフィードを読んでみる"
          );

          useNetlifyFunction();
          return;
        }

        renderResult(data, targetSelector);
        resolve()
      });
  });
}
