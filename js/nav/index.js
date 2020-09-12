import { fitView, highlightTrail } from '../map/index.js';
import { loadURL } from './loading.js';

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
  console.dir('pushStateAndNav');
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

onClick('info', function () {
  pushStateAndNav('info');
  // $("html,body").animate({scrollTop:position},600);
});

onClick('aboutDaisetsuzanGrade', function () {
  pushStateAndNav('aboutDaisetsuzanGrade');
});

onClick('blog', function () {
  pushStateAndNav('blog');
});

window.onpopstate = function () {
  console.dir('onpopstate  state:' + history.state.page);
  doNav(history.state.page);
};
