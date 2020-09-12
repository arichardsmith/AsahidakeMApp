import { GeoJSON } from 'ol/format';
import { Vector } from 'ol/source';

const SOURCE_CACHE = new Map();
const SOURCE_ROOT = '/map/data/';
/**
 * Load source file, cacheing requests
 * @param {string} path - File to load
 */
export function loadSource(path) {
  const fullPath = SOURCE_ROOT + path;

  if (SOURCE_CACHE.has(fullPath)) {
    return SOURCE_CACHE.get(fullPath);
  }

  try {
    const task = fetch(fullPath)
      .then((res) => res.json())
      .catch((err) => {
        emitLoadError(err);
        return null;
      });

    SOURCE_CACHE.set(fullPath, task);
    return task;
  } catch (err) {
    emitLoadError(err);
  }
}

function emitLoadError(err) {
  console.error('The following error occured when loading geodata');
  console.error(err);
}

const geo = new GeoJSON();

/**
 * Helper function to asyncronously load a layer source
 * @param {*} layer - Target layer
 * @param {*} featuresPromise - Promise that resolves with features json
 * @param {*} sourceOpts - Other options to apply to the source
 */
export function connectGeoJSONSource(layer, featuresPromise, sourceOpts = {}) {
  return Promise.resolve(featuresPromise).then((geoData) => {
    if (
      geoData === null ||
      !Array.isArray(geoData.features) ||
      geoData.features.length < 1
    ) {
      layer.set('title', null); // Remove layer from list
      return;
    }

    const source = new Vector({
      ...sourceOpts,
      features: geo.readFeatures(geoData, {
        featureProjection: 'EPSG:3857',
      }),
    });

    layer.setSource(source);
  });
}
