import { Group, Vector as VectorLayer } from 'ol/layer';
import { Point } from 'ol/geom';
import { Circle, Style, Stroke, Fill } from 'ol/style';

import { loadSource, connectGeoJSONSource } from './util.js';

const LOAD_DEBOUNCE = 200;
const PHOTO_ROOT = '/images/MapPics/';

/**
 * Photoレイヤー定義
 */
export const nakadakeLayer = createPhotoLayer({
  source: 'nakadake.json',
  title: '中岳温泉コース',
  color: 'rgba(126,179,44,1)',
});

export const summitLayer = createPhotoLayer({
  source: 'summit.json',
  title: '旭岳山頂コース',
  color: 'rgba(255,202,0,1)',
});

export const loopLayer = createPhotoLayer({
  source: 'loop.json',
  title: '一日周回コース',
  color: 'rgba(242,133,0,1)',
});

export const tennyogaLayer = createPhotoLayer({
  source: 'tennyoga.json',
  title: '天女ヶ原コース',
  color: 'rgba(33,153,31,1)',
});

export const sugatamiLayer = createPhotoLayer({
  source: 'sugatami.json',
  title: '姿見の池園地内',
  color: 'rgba(6,63,252,1)',
});

const photoLayers = [
  nakadakeLayer,
  summitLayer,
  loopLayer,
  tennyogaLayer,
  sugatamiLayer,
];

export const photosGroup = new Group({
  title: '写真',
  layers: photoLayers,
});

/**
 * 写真レイヤー変化イベント
 * @param {*} cb
 */
export function onPhotosChange(cb) {
  photoCBs.push(cb);
}

/**
 * 写真の地点 Lookup
 * @param {*} src - データのsrc (rootから)
 */
export function getPhotoLocation(src) {
  const res = photoLocations.get(src);

  if (res === undefined) {
    // Maybe it's a relative path
    return photoLocations.get(PHOTO_ROOT + src);
  }

  return res;
}

function createPointStyle(color = 'rgba(66, 66, 66, 1)') {
  return () =>
    new Style({
      image: new Circle({
        radius: 5,
        fill: new Fill({ color: 'rgba(255, 255, 255, 1)' }),
        stroke: new Stroke({
          color,
          width: 3,
        }),
      }),
    });
}

function createTitle(text, color = 'rgba(66, 66, 66, 1)') {
  return `<svg width="1em" height="1em" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><circle stroke="${color}" fill="#fff" stroke-width="20" cx="50" cy="50" r="40"></circle></svg> ${text}`;
}

function createPhotoLayer(opts) {
  const layer = new VectorLayer({
    declutter: true,
    interactive: true,
    style: createPointStyle(opts.color),
    title: createTitle(opts.title, opts.color),
  });

  layer.on('change:source', updateLocationMap);

  const source = loadSource(opts.source);
  connectGeoJSONSource(layer, source);

  return layer;
}

const photoLocations = new Map();

function updateLocationMap(e) {
  const layerSource = e.target.getSource(); // Extract source

  if (layerSource === null) {
    return;
  }

  const photoFeatures = layerSource.getFeatures();

  for (let feat of photoFeatures) {
    const src = feat.get('src');
    const geom = feat.getGeometry();

    const coords = geom instanceof Point ? geom.getCoordinates() : undefined;
    photoLocations.set(PHOTO_ROOT + src, coords); // There needs to be a / prepended for the source lookup
  }
}

// Photo events
const photoCBs = [];
let debounceTimeout = null;
function handlePhotoChange() {
  if (debounceTimeout !== null) {
    clearTimeout(debounceTimeout);
  }

  debounceTimeout = setTimeout(() => {
    debounceTimeout = null;
    photoCBs.forEach((cb) => cb());
  }, LOAD_DEBOUNCE);
}

photoLayers.forEach((layer) => {
  layer.on('change:source', handlePhotoChange);
  layer.on('change:visible', handlePhotoChange);
});
