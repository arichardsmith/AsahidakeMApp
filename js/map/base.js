import { Tile } from 'ol/layer';
import { XYZ } from 'ol/source';

const baseSource = {
  url: '/map/tiles/{z}/{x}/{y}.png',
  tilePixelRatio: 1,
  attributions: '(測量法に基づく国土地理院長承認（使用）R 2JHs 394)',
};

const retinaSource = {
  url: '/map/tiles/2x/{z}/{x}/{y}.png',
  tilePixelRatio: 2,
  attributions: '(測量法に基づく国土地理院長承認（使用）R 2JHs 394)',
};

const isRetina = window.matchMedia(
  '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'
).matches;

export const baseTiles = new Tile({
  source: new XYZ(isRetina ? retinaSource : baseSource),
  extent: [15890800.0, 5401150.0, 15918700.0, 5426850.0],
  interactive: true,
});
