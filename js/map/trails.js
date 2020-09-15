import { Vector as VectorLayer, Group } from 'ol/layer';
import { Style, Stroke } from 'ol/style';

import { extents } from './extents';
import { connectGeoJSONSource, loadSource } from './util.js';

const STROKE_WIDTH = 3;
let highlightedTrail = null;

/**
 * 登山道ハイライト
 * 現在ハイライトできる登山道は：（./extents.jsによる}
 * sugatami, summit, nakadake, loop, tennyoga, nakadake
 *
 * @param {string} trail - 登山道の名前 (romajiで)
 */
export function highlightTrail(trail) {
  if (trail !== null && !TRAIL_NAMES.includes(trail)) {
    console.warn(`Can't highlight ${trail}. No matching trail found`);
    trail = null;
  }

  highlightedTrail = trail;
  // Set all layers to changed to update map
  trailLayers.forEach((layer) => layer.changed());
}

function getLayerColour(grade, alpha = 1) {
  switch (grade) {
    case 1:
      return `rgba(62,119,200,${alpha})`;
    case 2:
      return `rgba(33,153,31,${alpha})`;
    case 3:
      return `rgba(255,202,0,${alpha})`;
    case 4:
      return `rgba(242,133,0,${alpha})`;
    case 5:
      return `rgba(235,25,60,${alpha})`;
    default:
      return `rgba(66,66,66,${alpha})`;
  }
}

function styleTrail(feature) {
  const grade = feature.get('grade');
  const trails = feature.get('trails');

  const baseStyle = new Style({
    stroke: new Stroke({
      color: getLayerColour(grade, 1),
      width: STROKE_WIDTH,
    }),
  });

  if (!trails.includes(highlightedTrail)) {
    return baseStyle;
  }

  const highlightStyle = new Style({
    stroke: new Stroke({
      color: getLayerColour(grade, 0.3), // ハイライトalpha
      width: STROKE_WIDTH + 8, // ハイライト幅
    }),
  });

  return [baseStyle, highlightStyle];
}

function gradeSVG(grade) {
  const colour = getLayerColour(grade);

  return `
  <svg width="1em" height="1em" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M0 50 H 100" stroke="${colour}" stroke-width="20" /></svg>
  `;
}

function createTrailLayer(grade) {
  const layer = new VectorLayer({
    source: null,
    style: styleTrail,
    interactive: true,
    title: `${gradeSVG(grade)} グレード ${grade}`,
  });

  const gradeKey = `grade${grade}`;

  const features = loadSource('base.json').then(
    (base) => base.trails[gradeKey]
  );

  connectGeoJSONSource(layer, features, {
    attributions:
      '<a href="http://www.daisetsuzan.or.jp/">(大雪山国立公園連絡協議会)</a>',
  });

  return layer;
}

const trailLayers = [1, 2, 3, 4, 5].map(createTrailLayer);

const TRAIL_NAMES = Object.keys(extents);

// 登山道グループ
export const trailGroup = new Group({
  title: '登山道',
  layers: trailLayers,
});
