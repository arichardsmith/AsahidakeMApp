import { RegularShape, Style, Fill, Stroke, Text } from 'ol/style';
import { Vector as VectorLayer } from 'ol/layer';

import { loadSource, connectGeoJSONSource } from './util.js';

const POINT_RADIUS = 5;
const LABEL_COLOUR = 'rgba(64, 64, 64, 1)';

const labelPoint = new RegularShape({
  radius: POINT_RADIUS,
  points: 3,
  fill: new Fill({ color: LABEL_COLOUR }),
});

/**
 * Style label with point and text
 * @param {('jp' | 'en')} lang - Label language
 */
function styleLabel(lang = 'jp') {
  return function (feature) {
    const labelText = feature.get(lang);

    if (labelText === null) {
      // Return just a point if there is no text
      return Style({
        image: labelPoint,
      });
    }

    const font =
      lang === 'jp'
        ? '0.8em "ヒラギノ角ゴ Pro W6", "Hiragino Kaku Gothic Pro",Osaka, "メイリオ", Meiryo, "ＭＳ Ｐゴシック", "MS PGothic", sans-serif'
        : '0.7em Arial Black, Arial, sans-serif';

    const text = new Text({
      font,
      text: labelText,
      textBaseline: 'bottom',
      textAlign: 'center',
      offsetX: 0,
      offsetY: 0 - (POINT_RADIUS + 2),
      placement: 'point',
      maxAngle: 0,
      fill: new Fill({
        color: LABEL_COLOUR,
      }),
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 1)',
        width: 3,
      }),
    });

    return new Style({
      image: labelPoint,
      text,
    });
  };
}

const layerBase = {
  declutter: true,
  interactive: true,
  type: 'base',
};

export const jpLabelsLayer = new VectorLayer({
  ...layerBase,
  style: styleLabel('jp'),
  title: '日本語',
  zIndex: 10,
});

export const enLabelsLayer = new VectorLayer({
  ...layerBase,
  style: styleLabel('en'),
  title: 'English',
  visible: false,
  zIndex: 10,
});

const labelFeatures = loadSource('base.json').then((base) => base.labels);

connectGeoJSONSource(jpLabelsLayer, labelFeatures);
connectGeoJSONSource(enLabelsLayer, labelFeatures);
