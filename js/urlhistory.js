import $ from 'jquery';
import NProgress from 'nprogress';

import { loadURL } from './nav/loading.js';
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
      await loadURL('#column', 'blog.html');
      highlightTrail(null);
      break;
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
}

export function pushStateAndNav(pageName) {
  window.history.pushState({ page: pageName }, null, '#/' + pageName);
  doNav(pageName);
}

//クリックイベント関数の簡略化
//javascript使っていたり　JQuery使っていたり分かりづらい
//統一すべき
function onClick(id, callback) {
  document.getElementById(id).addEventListener('click', callback);
}
//各ボタンの処理
onClick('aboutDaisetsuzan', function () {
  pushStateAndNav('aboutDaisetsuzan');
});

onClick('aboutSugatami', function () {
  pushStateAndNav('aboutSugatami');
});

onClick('aboutTrailToPeak', function () {
  pushStateAndNav('aboutTrailToPeak');
});

onClick('about6hLoop', function () {
  pushStateAndNav('about6hLoop');
});

onClick('aboutSusoai', function () {
  pushStateAndNav('aboutSusoai');
});

onClick('info', function () {
  pushStateAndNav('info');
});
onClick('info_child', function () {
  pushStateAndNav('info');
});

onClick('aboutDaisetsuzanGrade', function () {
  pushStateAndNav('aboutDaisetsuzanGrade');
});

onClick('blog', function () {
  pushStateAndNav('blog');
});
onClick('aboutUs', function () {
  pushStateAndNav('aboutUs');
});

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

$(document).ajaxStart(() => {
  NProgress.start();
});

$(document).ajaxStop(() => {
  NProgress.done();
});

$(document).ajaxError(() => {
  NProgress.done();
});
