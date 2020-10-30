import { Map, View, Overlay } from 'ol';
import { defaults, ScaleLine } from 'ol/control';
import LayerSwitcher from 'ol-layerswitcher';

import { extents } from './map/extents.js';
import { photosGroup, onPhotosChange, getPhotoLocation } from './map/photos';
import { baseTiles } from './map/base.js';
import { trailGroup, highlightTrail } from './map/trails.js';
import { jpLabelsLayer, enLabelsLayer } from './map/labels.js';


export { highlightTrail };

export const view = new View({
  extent: [15890800.0, 5401150.0, 15918700.0, 5426850.0],
  zoom: 12,
  maxZoom: 16,
  minZoom: 11,
});

/**
 * Viewの範囲変化
 *
 * @param {string|Array<number>} extent - 登山道のstring又はnumberのarray
 */
export function fitView(extent) {
  if (typeof extent === 'string') {
    if (extents[extent] === undefined) {
      throw new Error('No matching extent for "' + extent + '"');
    }

    extent = extents[extent];
  }

  view.fit(extent, {
    padding: [20, 50, 20, 50], // コースの周りのpadding (px)
    duration: 300, // Animation
  });
}

//---ポップアップ用の準備----------------------------
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

export const overlayPopup = new Overlay({
  element: container,
  positioning: 'top-center',
});

// 客レイヤー
export const layersList = [
  baseTiles,
  jpLabelsLayer,
  enLabelsLayer,
  trailGroup,
  photosGroup,
];

//---マップの定義
export const map = new Map({
  controls: defaults().extend([
    // new geolocateControl(), // TODO: -> Import
    new ScaleLine(), //---スケールラインの設定
    new LayerSwitcher({ tipLabel: 'Layers' }), //layerSwitcher の制作
  ]),
  target: document.getElementById('map'),
  renderer: 'canvas',
  overlays: [overlayPopup],
  layers: layersList,
  loadTilesWhileAnimating: true,
  view: view,
});

function DisplayPicColumn() {
  const visiblePhotos = getVisiblePhotos().reverse(); // 順番は反対

  let newHTML = '';
  for (let photoSrc of visiblePhotos) {
    newHTML += imgHTML(`images/MapPics/${photoSrc}`);
  }

  picColumn.innerHTML = newHTML;

  // 表示写真がない場合、no-picクラス付け
  if (visiblePhotos.length < 1) {
    picColumn.classList.add('no-pics');
  } else if (picColumn.classList.contains('no-pics')) {
    picColumn.classList.remove('no-pics');
  }
}

//写真一覧クリック処理用
function handlePhotoClick(e) {
  const targetElement = e.target;
  if (!(targetElement instanceof HTMLImageElement)) {
    // Only match clicks on img elements
    return;
  }

  const imgSource = new URL(targetElement.src).pathname; // Extract path
  const point = getPhotoLocation(imgSource);

  showPopup(imgHTML(imgSource), point);
}

//写真HTML Template
export function imgHTML(src) {
  return `<img class="fit-picture" src="${src}" />`;
}

//マップクリックイベント
function handleMapPointer(evt) {
  const pixel = evt.pixel;
  let coord = null;
  const photoLayers = photosGroup.getLayers().getArray();

  const imgs = [];
  map.forEachFeatureAtPixel(pixel, (feature, layer) => {
    if (photoLayers.includes(layer)) {
      // 写真レイヤーの場合
      const imgSrc = feature.get('src');
      imgs.push(imgSrc);
      if (coord === null) {
        const geom = feature.getGeometry();
        if (geom !== undefined && typeof geom.getCoordinates === 'function') {
          coord = geom.getCoordinates();
        }
      }
    }
  });

  if (coord === null) {
    coord = evt.coordinates;
  }

  const filteredImages = imgs
    .filter((img) => img !== undefined) // srcのないのを抜く
    .map((img) => `images/MapPics/${img}`); // Path付け

  if (filteredImages.length > 0) {
    // クリックした写真Pointある
    const popupContent = filteredImages.map(imgHTML).join('');
    showPopup(popupContent, coord);
  } else {
    hidePopup();
  }
}

//写真レイヤーグループの中のVisible写真
function getVisiblePhotos() {
  const visiblePhotoLayers = photosGroup
    .getLayers()
    .getArray() // Array変化
    .filter((layer) => layer.getVisible() && layer.getSource() !== null); // VisibleかSourceのあにレイヤー抜く

  // Loop外関数定義
  const extractSource = (feature) => feature.get('src');
  const visiblePhotos = [];

  for (let layer of visiblePhotoLayers) {
    const layerPhotos = layer
      .getSource() // Sourceは定義確認は上
      .getFeatures()
      .map(extractSource);

    visiblePhotos.push(...layerPhotos);
  }

  return visiblePhotos;
}

/**
 * ポップアップ表示
 * @param {*} popupContent - popupで表示HTML
 * @param {*} coords - Pointの場所
 */
export function showPopup(popupContent, coords) {
  content.innerHTML = popupContent;
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

closer.addEventListener('click', (evt) => {
  evt.preventDefault();
  hidePopup();
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

      showPopup(HTML, point);
    }
    document.cookie = 'KiaOla=Hai; max-age=86400;';
  }
}

const picColumn = document.getElementById('pic');
picColumn.addEventListener('click', handlePhotoClick);
onPhotosChange(DisplayPicColumn); // 写真レイヤー変化イベント
// マウスポインター動の場合は'click'の代わりに'pointermove'
map.on('click', handleMapPointer);
fitView('loop');
onPhotosChange(showHowTo); // 写真レイヤーロード後


//expand Button のイベント
const expandBtn = document.getElementById('expandBtn');
const expandLabel = document.getElementById('expandLabel');
const MAppArea = document.getElementById('MApp');
const mapArea = document.getElementById('map');
const picArea = document.getElementById('pic');
export function updateSize(){
  expandBtn.onchange = function(){
    if(expandBtn.checked){
      MAppArea.style.height = '80%';
      mapArea.style.height = '85%';
      picArea.style.height = '15%';
      expandLabel.innerHTML = 'マップを縮小';
      expandLabel.style.border = 'thin solid';
      expandLabel.style.borderTopStyle = 'none';
    }
    else{
      MAppArea.style.height = '50%';
      mapArea.style.height = '80%';
      picArea.style.height = '20%';
      expandLabel.style.border = 'none';
      expandLabel.innerHTML = 'マップを拡大';
    }
    map.updateSize();
  }
}
updateSize();

