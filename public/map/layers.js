var AsahidakeMap = (function (exports) {
  'use strict';

  const baseSource = {
    url: '/map/tiles/{z}/{x}/{y}.png',
    tilePixelRatio: 1
  };

  const retinaSource = {
    url: '/map/tiles/2x/{z}/{x}/{y}.png',
    tilePixelRatio: 2
  };

  const isRetina = window.matchMedia('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)').matches;

  const baseTiles = new ol.layer.Tile({
    source: new ol.source.XYZ(isRetina ? retinaSource : baseSource),
    extent: [15890800.0, 5401150.0, 15918700.0, 5426850.0],
    interactive: true
  });

  const SOURCE_CACHE = new Map();
  const SOURCE_ROOT = '/map/data/';
  /**
   * Load source file, cacheing requests
   * @param {string} path - File to load
   */
  function loadSource(path) {
    const fullPath = SOURCE_ROOT + path;

    if (SOURCE_CACHE.has(fullPath)) {
      return SOURCE_CACHE.get(fullPath)
    }

    try {
      const task = fetch(fullPath).then(res => res.json());
      SOURCE_CACHE.set(fullPath, task);
      return task
    } catch (err) {
      console.error('The following error occured when loading geodata');
      console.error(err);
    }
  }

  const GeoJSON = new ol.format.GeoJSON();

  /**
   * Helper function to asyncronously load a layer source
   * @param {*} layer - Target layer
   * @param {*} featuresPromise - Promise that resolves with features json
   * @param {*} sourceOpts - Other options to apply to the source
   */
  function connectGeoJSONSource(layer, featuresPromise, sourceOpts = {}) {
    return Promise.resolve(featuresPromise).then(geoData => {
      if (geoData === null || !Array.isArray(geoData.features) || geoData.features.length < 1) {
        layer.set('title', null); // Remove layer from list
        return
      }
    
      const source = new ol.source.Vector({
        ...sourceOpts,
        features: GeoJSON.readFeatures(geoData, { featureProjection: 'EPSG:3857' })
      });
    
      layer.setSource(source);
    })
  }

  const kurodake = [
  	15899228.890813727,
  	5413063.7404938275,
  	15912938.319705235,
  	5422830.47369097
  ];
  const nakadake = [
  	15899228.890813727,
  	5413272.70665701,
  	15903199.394036591,
  	5416284.892751929
  ];
  const loop = [
  	15899228.890813727,
  	5413063.7404938275,
  	15904526.157371525,
  	5416403.292199796
  ];
  const tennyoga = [
  	15896267.3550505,
  	5411330.6321919765,
  	15899383.076703139,
  	5413272.70665701
  ];
  const summit = [
  	15899228.890813727,
  	5413063.7404938275,
  	15902455.52199312,
  	5413531.170369489
  ];
  const sugatami = [
  	15899228.890813727,
  	5413048.429889194,
  	15900239.875193141,
  	5413615.0496835755
  ];
  var trailExtents = {
  	kurodake: kurodake,
  	nakadake: nakadake,
  	loop: loop,
  	tennyoga: tennyoga,
  	summit: summit,
  	sugatami: sugatami
  };

  const STROKE_WIDTH = 3;

  function getLayerColour(grade, alpha = 1) {
    switch(grade) {
      case 1:
        return `rgba(62,119,200,${alpha})`
      case 2:
        return `rgba(33,153,31,${alpha})`
      case 3:
        return `rgba(255,202,0,${alpha})`
      case 4:
        return `rgba(242,133,0,${alpha})`
      case 5:
        return `rgba(235,25,60,${alpha})`
      default:
        return `rgba(66,66,66,${alpha})`
    }
  }

  function styleTrail(feature) {
    const grade = feature.get('grade');
    const trails = feature.get('trails');

    const highlightedTrail = highlight.currentTrail;

    // Set alpha depending on currently highlighted trail
    const alpha = highlightedTrail === null || trails.includes(highlightedTrail)
        ? 1
        : 0.5;

    return new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: getLayerColour(grade, alpha),
        width: STROKE_WIDTH
      })
    })
  }

  function gradeSVG(grade) {
    const colour = getLayerColour(grade);

    return `
  <svg width="1em" height="1em" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M0 50 H 100" stroke="${colour}" stroke-width="20" /></svg>
  `
  }

  function createTrailLayer(grade) {
    const layer = new ol.layer.Vector({
      source: null,
      style: styleTrail,
      interactive: true,
      title: `${gradeSVG(grade)} グレード ${grade}`
    });

    const gradeKey = `grade${grade}`;

    const features = loadSource('base.json')
      .then(base => base.trails[gradeKey]);

    connectGeoJSONSource(layer, features, {
      attributions: '<a href="http://www.daisetsuzan.or.jp/">大雪山国立公園連絡協議会</a>'
    });

    return layer
  }

  const trailLayers = [1, 2, 3, 4, 5].map(createTrailLayer);

  const TRAIL_NAMES = Object.keys(trailExtents);

  /**
   * Trail highlight state wrapper
   * @param {*} layers - Layers to update on change
   */
  function Highlighter(layers) {
    this.updateLayers = layers;
    this.currentTrail = null;
  }

  /**
   * Updates highlighted trail
   * @param {*} trail 
   */
  Highlighter.prototype.update = function (trail) {
    if (trail !== null && !TRAIL_NAMES.includes(trail)) {
      console.warn(`Can't highlight ${trail}. No matching trail found`);
      trail = null;
    }

    this.currentTrail = trail;
    // Set all layers to changed to update map
    this.updateLayers.forEach(layer => layer.changed());
  };

  // Automate the helper functions
  for (let trail of TRAIL_NAMES) {
    /**
     * Highlight function
     */
    Highlighter.prototype[trail] = function () {
      this.update(trail);
    };
  }

  /**
   * Clears trail highlighting
   */
  Highlighter.prototype.clear = function () {
    this.update(null);
  };

  const highlight = new Highlighter(trailLayers);

  const POINT_RADIUS = 5;
  const LABEL_COLOUR = 'rgba(64, 64, 64, 1)';

  const labelPoint = new ol.style.RegularShape({
    radius: POINT_RADIUS,
    points: 3,
    fill: new ol.style.Fill({ color: LABEL_COLOUR })
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
        return ol.style.Style({
          image: labelPoint
        })
      }

      const font = lang === 'jp'
        ? '0.8em "ヒラギノ角ゴ Pro W6", "Hiragino Kaku Gothic Pro",Osaka, "メイリオ", Meiryo, "ＭＳ Ｐゴシック", "MS PGothic", sans-serif'
        : '0.7em Arial Black, Arial, sans-serif';

      const text = new ol.style.Text({
        font,
        text: labelText,
        textBaseline: 'bottom',
        textAlign: 'center',
        offsetX: 0,
        offsetY: 0 - (POINT_RADIUS + 2),
        placement: 'point',
        maxAngle: 0,
        fill: new ol.style.Fill({
          color: LABEL_COLOUR
        }),
        stroke: new ol.style.Stroke({
          color: 'rgba(255, 255, 255, 1)',
          width: 3
        })
      });

      return new ol.style.Style({
        image: labelPoint,
        text
      })
    }
  }

  const layerBase = {
    declutter: true,
    interactive: true,
    type: 'base'
  };

  const jpLabelsLayer = new ol.layer.Vector({
    ...layerBase,
    style: styleLabel('jp'),
    title: '日本語'
  });

  const enLabelsLayer = new ol.layer.Vector({
    ...layerBase,
    style: styleLabel('en'),
    title: 'English',
    visible: false
  });

  const labelFeatures = loadSource('base.json').then(base => base.labels);

  connectGeoJSONSource(jpLabelsLayer, labelFeatures);
  connectGeoJSONSource(enLabelsLayer, labelFeatures);

  const LOAD_DEBOUNCE = 200;
  const PHOTO_ROOT = '/images/MapPics/';

  function createPointStyle(color = 'rgba(66, 66, 66, 1)') {
    return () => (
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({ color: 'rgba(255, 255, 255, 1)' }),
          stroke: new ol.style.Stroke({
            color,
            width: 3
          })
        })
      })
    )
  }

  function createTitle(text, color = 'rgba(66, 66, 66, 1)') {
    return `<svg width="1em" height="1em" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><circle stroke="${color}" fill="#fff" stroke-width="20" cx="50" cy="50" r="40"></circle></svg> ${text}`
  }

  function createPhotoLayer(opts) {
    const layer = new ol.layer.Vector({
      declutter: true,
      interactive: true,
      style: createPointStyle(opts.color),
      title: createTitle(opts.title, opts.color)
    });

    layer.on('change', updateLocationMap);

    const source = loadSource(opts.source);
    connectGeoJSONSource(layer, source);

    return layer
  }

  const nakadakeLayer = createPhotoLayer({
    source: 'nakadake.json',
    title: '中岳温泉コース',
    color: 'rgba(126,179,44,1)'
  });

  const summitLayer = createPhotoLayer({
    source: 'summit.json',
    title: '旭岳山頂コース',
    color: 'rgba(255,202,0,1)'
  });

  const loopLayer = createPhotoLayer({
    source: 'loop.json',
    title: '一日周回コース',
    color: 'rgba(242,133,0,1)'
  });

  const tennyogaLayer = createPhotoLayer({
    source: 'tennyoga.json',
    title: '天女ヶ原コース',
    color: 'rgba(33,153,31,1)'
  });

  const photoLayers = [
    tennyogaLayer,
    loopLayer,
    nakadakeLayer,
    summitLayer
  ];

  const photoLocations = new Map();

  function updateLocationMap(e) {
    const layerSource = e.target.getSource(); // Extract source

    if (layerSource === null) {
      return
    }

    const photoFeatures = layerSource.getFeatures();

    for (let feat of photoFeatures) {
      const src = feat.get('src');
      const geom = feat.getGeometry();

      const coords = geom instanceof ol.geom.Point ? geom.getCoordinates() : undefined;
      photoLocations.set(PHOTO_ROOT + src, coords); // There needs to be a / prepended for the source lookup
    }
  }


  const photoCBs = [];
  /**
   * 写真レイヤーロードイベント
   * @param {*} cb 
   */
  function onPhotosLoad(cb) {
    photoCBs.push(cb);
  }

  let debounceTimeout = null;
  function handlePhotoLoad() {
    if (debounceTimeout !== null) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(() => {
      debounceTimeout = null;
      dispatchLoadEvent();
    }, LOAD_DEBOUNCE);
  }

  function dispatchLoadEvent() {
    if (photoCBs.length > 0) {
      photoCBs.forEach(cb => cb());
    }
  }

  photoLayers.forEach(layer => {
    layer.on('change:source', handlePhotoLoad);
  });

  exports.baseTiles = baseTiles;
  exports.enLabelsLayer = enLabelsLayer;
  exports.extents = trailExtents;
  exports.highlight = highlight;
  exports.jpLabelsLayer = jpLabelsLayer;
  exports.onPhotosLoad = onPhotosLoad;
  exports.photoLayers = photoLayers;
  exports.photoLocations = photoLocations;
  exports.trailLayers = trailLayers;

  return exports;

}({}));