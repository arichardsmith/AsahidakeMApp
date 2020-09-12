import { Overlay } from 'ol';

import { imgHTML } from './pic-column';
import { onPhotosLoad, getPhotoLocation } from './layers/photos';

//---ポップアップ用の準備----------------------------
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

/**
 * ポップアップ表示
 * @param {*} imgSrcs - 表示写真source
 * @param {*} coords - Pointの場所
 */
export function showPopup(imgSrcs, coords) {
  if (!Array.isArray(imgSrcs)) {
    // 一つなら、Arrayに変化
    imgSrcs = [imgSrcs];
  }

  const imgHtml = imgSrcs
    .map(imgHTML) // HTML String変化
    .join('');

  content.innerHTML = imgHtml;
  overlayPopup.setPosition(coords);

  container.style.display = 'block';

  overlayPopup.panIntoView({
    margin: 20,
  });
}

export function hidePopup() {
  container.style.display = 'none';
  closer.blur();
  return false;
}

closer.addEventListener('click', hidePopup);

export const overlayPopup = new Overlay({
  element: container,
  positioning: 'top-center',
});

//Show HowToUShowPicOnMap
function showHowTo() {
  let cookies_get = document.cookie.split(';');
  if (cookies_get.indexOf('KiaOla=Hai') == -1) {
    const visiblePhotos = getVisiblePhotos().reverse();
    if (visiblePhotos != null) {
      const imgSource = `/images/MapPics/${visiblePhotos[0]}`;
      const point = getPhotoLocation(imgSource);
      //showPopup(imgSource,point);

      const HTML = `<br/>
                          <h1 style='font-size:16px;color:#3273DC;'>【写真の表示方法】</h1>
                          <div>
                          <p>①地図の下にある写真の一覧の中からクリック</p>
                          <p>②地図上にある丸いプロットをクリック</p>
                          </div>
                          `;
      content.innerHTML = HTML;
      overlayPopup.setPosition(point);

      container.style.display = 'block';

      overlayPopup.panIntoView({
        margin: 20,
      });
    }
    document.cookie = 'KiaOla=Hai; max-age=86400;';
  }
}

onPhotosLoad(showHowTo); // 写真レイヤーロード後
