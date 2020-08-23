

//---現在地処理---------------------------- 
isTracking = false;
var geolocateControl = (function (Control) {
    geolocateControl = function(opt_options) {
        var options = opt_options || {};
        var button = document.createElement('button');
        button.className += ' fa fa-map-marker';
        var handleGeolocate = function() {
            if (isTracking) {
                map.removeLayer(geolocateOverlay);
                isTracking = false;
          } else if (geolocation.getTracking()) {
                map.addLayer(geolocateOverlay);
                console.dir(geolocation.getPosition());
                map.getView().setCenter(geolocation.getPosition());
                isTracking = true;
          }
        };
        button.addEventListener('click', handleGeolocate, false);
        button.addEventListener('touchstart', handleGeolocate, false);
        var element = document.createElement('div');
        element.className = 'geolocate ol-unselectable ol-control';
        element.appendChild(button);
        ol.control.Control.call(this, {
            element: element,
            target: options.target
        });
    };
    if (Control) geolocateControl.__proto__ = Control;
    geolocateControl.prototype = Object.create(Control && Control.prototype);
    geolocateControl.prototype.constructor = geolocateControl;
    return geolocateControl;
}(ol.control.Control));


//---ポップアップ用の準備---------------------------- 
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

/**
 * ポップアップ表示
 * @param {*} imgSrcs - 表示写真source 
 * @param {*} coords - Pointの場所
 */
function showPopup(imgSrcs, coords) {
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
        margin: 20
    })
}

function hidePopup() {
    container.style.display = 'none';
    closer.blur();
    return false;
}

closer.addEventListener('click', hidePopup)

const overlayPopup = new ol.Overlay({
    element: container,
    positioning: 'top-center'
});


//---座標定義---------------------------------
var sugatami = ol.proj.fromLonLat([142.82877,43.66210]);
var asahidake = ol.proj.fromLonLat([142.84192,43.66144]);
var nakadakeOnsen = ol.proj.fromLonLat([142.84258,43.67512]);

var view = new ol.View({
    center: asahidake,
    extent: [15890800.0, 5401150.0, 15918700.0, 5426850.0],
    zoom: 12,
    maxZoom: 16, minZoom: 11
});

// レイヤーグループ
const photosGroup = new ol.layer.Group({
    title: '写真',
    layers: AsahidakeMap.photoLayers
})

// マップの定義前にイベント定義。関数定義は下
photosGroup.getLayers().forEach(function (layer) {
    layer.on('change:visible', DisplayPicColumn);
})

AsahidakeMap.onPhotosLoad(DisplayPicColumn) // 写真レイヤーロード後

// 登山道グループ
const trailGroup = new ol.layer.Group({
    title: '登山道',
    layers: AsahidakeMap.trailLayers
})

// 客レイヤー
const layersList = [
    AsahidakeMap.baseTiles,
    AsahidakeMap.jpLabelsLayer,
    AsahidakeMap.enLabelsLayer,
    trailGroup,
    photosGroup
]

//---マップの定義
var map = new ol.Map({
    controls: ol.control.defaults().extend([
        new geolocateControl(),
        new ol.control.ScaleLine(), //---スケールラインの設定
        new ol.control.LayerSwitcher({tipLabel: "Layers"}) //layerSwitcher の制作
    ]),
    target: document.getElementById('map'),
    renderer: 'canvas',
    overlays:[overlayPopup],
    layers: layersList,
    loadTilesWhileAnimating: true,
    view:view
});



//自動スクロール用のpositon取得
var scrollPoint = document.getElementById('column'); // 移動させたい位置の要素を取得
var rect = scrollPoint.getBoundingClientRect();
var position = rect.top;    // 一番上からの位置を取得



const toColumn = document.getElementById('toColumn');
//クリックイベント関数の簡略化
function onClick(id, callback) {
    document.getElementById(id).addEventListener('click', callback);
}
//各ボタンの処理
onClick('aboutAsahidake', function() {
    view.setCenter(sugatami);
    view.setZoom(16.5);
    $("#column").load("aboutDaisetsuzan.html");
    // $("html,body").animate({scrollTop:position},600);
});

onClick('aboutSugatami', function() {
    view.setCenter(sugatami);
    view.setZoom(16.5);
    $("#column").load("aboutSugatami.html");
});

onClick('aboutTrailToPeak',function(){
    view.setCenter(asahidake);
    view.setZoom(15);
    $("#column").load("aboutTrailToPeak.html");
});

onClick('about6hLoop',function(){
    view.setCenter(nakadakeOnsen);
    view.setZoom(14);
    $("#column").load("about6hLoop.html");

});

onClick('info',function(){
    $("#column").load("info.html");
    // $("html,body").animate({scrollTop:position},600);

});

onClick('aboutDaisetsuzanGrade',function(){
    $("#column").load("aboutDaisetsuzanGrade.html");
});

//写真レイヤーグループの中のVisible写真
function getVisiblePhotos () {
    const visiblePhotoLayers = photosGroup
        .getLayers()
        .getArray() // Array変化
        .filter(layer => layer.getVisible() && layer.getSource() !== null) // VisibleかSourceのあにレイヤー抜く
    
    // Loop外関数定義
    const extractSource = feature => feature.get('src')
    const visiblePhotos = []

    for (let layer of visiblePhotoLayers) {
        const layerPhotos = layer
            .getSource() // Sourceは定義確認は上
            .getFeatures()
            .map(extractSource)

        visiblePhotos.push(...layerPhotos)
    }

    return visiblePhotos
}

//写真一覧の表示
var eventAttached = false // 最初だけにクリックイベント付け. var=上に定義

function DisplayPicColumn() {
    console.dir('inPicColum');
    
    const visiblePhotos = getVisiblePhotos().reverse(); // 順番は反対

    let newHTML = '';
    for (let photoSrc of visiblePhotos) {
        newHTML += imgHTML(`images/MapPics/${photoSrc}`);
    }

    const picColumn = document.getElementById('pic');

    if (!eventAttached) {
      picColumn.addEventListener('click', handlePhotoClick);
      eventAttached = true
    }

    picColumn.innerHTML = newHTML;
}

//写真一覧クリック処理用
function handlePhotoClick(e) {
    const targetElement = e.target
    if (!(targetElement instanceof HTMLImageElement)) {
        // Only match clicks on img elements
        return
    }

    const imgSource = new URL(targetElement.src).pathname // Extract path
    const point = AsahidakeMap.photoLocations.get(imgSource)
    
    showPopup(imgSource, point)
}

//写真HTML Template
function imgHTML(src) {
    return `<img class="fit-picture" src="${src}" alt="test Pic" />`
}

//マップクリックイベント
function handleMapPointer(evt) {
    const pixel = evt.pixel;
    let coord = null;
    const photoLayers = photosGroup.getLayers().getArray();

    const imgs = []
    map.forEachFeatureAtPixel(pixel, (feature, layer) => {
        if (photoLayers.includes(layer)) {
            // 写真レイヤーの場合
            const imgSrc = feature.get('src');
            imgs.push(imgSrc);
            if (coord === null) {
                const geom = feature.getGeometry()
                if (geom !== undefined && typeof geom.getCoordinates === 'function') {
                    coord = geom.getCoordinates()
                }
            }
        }
    })

    if (coord === null) {
        coord = evt.coordinates
    }

    const filteredImages = imgs
        .filter(img => img !== undefined) // srcのないのを抜く
        .map(img => `images/MapPics/${img}`); // Path付け

    if (filteredImages.length > 0) {
        // クリックした写真Pointある
        showPopup(filteredImages, coord);
    } else {
        hidePopup()
    }
}

// マウスポインター動の場合は'click'の代わりに'pointermove'
map.on('click', handleMapPointer);

var geolocation = new ol.Geolocation({
  projection: map.getView().getProjection()
});


var accuracyFeature = new ol.Feature();
geolocation.on('change:accuracyGeometry', function() {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

var positionFeature = new ol.Feature();
positionFeature.setStyle(new ol.style.Style({
  image: new ol.style.Circle({
    radius: 6,
    fill: new ol.style.Fill({
      color: '#3399CC'
    }),
    stroke: new ol.style.Stroke({
      color: '#fff',
      width: 2
    })
  })
}));

geolocation.on('change:position', function() {
  var coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ?
      new ol.geom.Point(coordinates) : null);
});

var geolocateOverlay = new ol.layer.Vector({
  source: new ol.source.Vector({
    features: [accuracyFeature, positionFeature]
  })
});

geolocation.setTracking(true);



