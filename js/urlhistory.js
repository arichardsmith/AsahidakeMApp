import $ from 'jquery';
import NProgress from 'nprogress';

import { loadURL } from './nav/loading.js';
import { loadBlog } from './nav/blog.js';
import { fitView, highlightTrail } from './nav/map-control.js';
/**
 * ナビの処理
 * いつも同じようにナビするため、必ずこの関数を使って
 * @param {string} target - 次のページ
 */
export async function doNav(target) {
  // マップ更新はload後ため、loadURLはawait
  switch (target) {
    case 'aboutDaisetsuzan':
      await loadURL('#column', 'aboutDaisetsuzan.html');
      fitView('loop');
      highlightTrail(null);
      break;
    case 'aboutTrailToPeak':
      await loadURL('#column', 'aboutTrailToPeak.html');
      fitView('summit');
      highlightTrail('summit');
      break;
    case 'about6hLoop':
      await loadURL('#column', 'about6hLoop.html');
      fitView('loop');
      highlightTrail('loop');
      break;
    case 'aboutSusoai':
      await loadURL('#column', 'aboutSusoai.html');
      fitView('nakadake');
      highlightTrail('nakadake');
      break;
    case 'info':
      await loadURL('#column', 'info.html');
      highlightTrail(null);
      break;
    case 'aboutDaisetsuzanGrade':
      await loadURL('#column', 'aboutDaisetsuzanGrade.html');
      highlightTrail(null);
      break;
    case 'blog':
      await loadBlog('#column');
      hookBlogLinks();
      highlightTrail(null);
      return; // hookContentLinks実行しないため
    case 'aboutUs':
      await loadURL('#column', 'aboutUs.html');
      highlightTrail(null);
      break;
    case 'aboutSugatami':
    default:
      // 404 = aboutSugatami
      await loadURL('#column', 'aboutSugatami.html');
      fitView('sugatami');
      highlightTrail('sugatami');
      break;
  }

  hookContentLinks(); //ロード後、毎回内容のリンクイベント付け
}

export function pushStateAndNav(pageName) {
  window.history.pushState({ page: pageName }, null, '#/' + pageName);
  doNav(pageName);
}

/**
 * サイト内リンクのイベント関数
 * @param {*} evt 
 */
function handleClick(evt) {
  evt.preventDefault();

  const link = evt.target.closest("a");　//　もしく、aの中のelement
  const page = new URL(link.href).hash.replace(/^#\//, "");
  pushStateAndNav(page)
  link.blur() // blurしないとメニュー閉まらない
}

/**
 * ナビゲーションにイベント付け
 */
function hookNavLinks() {
  const links = [
    ...document.querySelectorAll('.navbar a[href^="/#/"]'),
    ...document.querySelectorAll('.navbar a[href^="#/"]')
  ] // 全てのサイト内リンク

  links.forEach(link => link.addEventListener("click", handleClick))
}

/**
 * ページ内容内のリンクにイベント付け
 */
function hookContentLinks() {
  const links = [
    ...document.querySelectorAll('#column a[href^="/#/"]'),
    ...document.querySelectorAll('#column a[href^="#/"]')
  ] // 全てのサイト内リンク

  links.forEach(link => link.addEventListener("click", handleClick))
}

function isInternalLink(element) {
  const host = new URL(element.href).host;
  return host === "kanshiin.netlify.app";
}

function hookBlogLinks() {
  const allLinks = Array.from(document.querySelectorAll("#column a"));
  const blogLinks = allLinks.filter(isInternalLink);

  blogLinks.forEach(link => link.addEventListener("click", handleClick));
}

const navElements = document.querySelectorAll('.navbar-burger,.navbar-menu');

function toggleNavBarClass() {
  for (let element of navElements) {
    element.classList.toggle('is-active');
  }
}

for (let element of navElements) {
  // navElementsは本当のArrayじゃないから、for (... of ...)のみ使える
  element.addEventListener('click', toggleNavBarClass);
}

window.onpopstate = function () {
  const page = history.state !== null ? history.state.page : null;
  doNav(page);
};

doNav(document.location.hash.substring(2));
hookNavLinks(); // 一回だけリンクのイベント付け

$(document).ajaxStart(() => {
  NProgress.start();
});

$(document).ajaxStop(() => {
  NProgress.done();
});

$(document).ajaxError(() => {
  NProgress.done();
});
