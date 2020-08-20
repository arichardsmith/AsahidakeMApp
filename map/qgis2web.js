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
                //ここ
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
    overlayPopup.panIntoView({
        margin: 20
    })
    container.style.display = 'block';
}

function hidePopup() {
    container.style.display = 'none';
    closer.blur();
    return false;
}

closer.addEventListener('click', hidePopup)

const overlayPopup = new ol.Overlay({
    element: container
});


//---座標定義---------------------------------
var sugatami = ol.proj.fromLonLat([142.82877,43.66210]);
var asahidake = ol.proj.fromLonLat([142.84192,43.66144]);
var nakadakeOnsen = ol.proj.fromLonLat([142.84258,43.67512]);
var markerNakadakeOnsen = ol.proj.fromLonLat([142.861559,43.681867]);

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
    layer.on('change:visible', DisplayPicColum);
})

AsahidakeMap.onPhotosLoad(DisplayPicColum) // 写真レイヤーロード後

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

// //中岳温泉のポップアップの定義------
// // Iconオブジェクト設定
//  var iconFeature = new ol.Feature({
//      geometry:new ol.geom.Point(markerNakadakeOnsen),
//      name: 'testaaaa',
//  });

//  // Iconスタイル設定
// var iconStyle = new ol.style.Style({
//     image: new ol.style.Icon({
//         src: 'images/onsen.png',
//         //size:10
//         //scale:0.5
//     })
// });

// // Iconソース設定
// const vectorSource = new ol.source.Vector({
//     features: [iconFeature]
// });

// // Iconレイヤ設定
// const vectorLayer = new ol.layer.Vector({
//     source: vectorSource,
//     style: iconStyle
// });
// //map.addLayer(vectorLayer);

//自動スクロール用のpositon取得
var scrollPoint = document.getElementById('column'); // 移動させたい位置の要素を取得
var rect = scrollPoint.getBoundingClientRect();
var position = rect.top;    // 一番上からの位置を取得


// $(function(){
//     //トップボタンの表示
//     var ToTopBtn = $('#toTop');
//     ToTopBtn.hide();
//     console.log($(window).height());
//     // positionまでスクロールしたらボタン表示
//     $("html,body").scroll(function () {
//         if (($(this).scrollTop() > (position - $(window).height()*0.2) ) && ($('#toTop').is(':hidden'))){
//             ToTopBtn.fadeIn();
//             console.log('fadeIn');
//         } else if(($(this).scrollTop() <= (position - $(window).height()*0.2)) && ($('#toTop').is(':visible'))){
//             ToTopBtn.fadeOut();
//             console.log('fadeOut');
//         }
//     });
//     //トップボタンのクリックイベント
//     ToTopBtn.click(function () {
//         $('body, html').animate({scrollTop: 0 }, 500);
//         return false;
//     });

//     //記事ボタンのクリックイベント
//     $('#toColumn').click(function () {
//         $('body, html').animate({scrollTop: position }, 500);
//         return false;
//     });    


// });

const toColumn = document.getElementById('toColumn');
//クリックイベント関数の簡略化
function onClick(id, callback) {
    document.getElementById(id).addEventListener('click', callback);
}
//各ボタンの処理
onClick('aboutAsahidake', function() {
    view.setCenter(sugatami);
    view.setZoom(16.5);
 //   scrollTo(0,0);
    toColumn.innerHTML='大雪山について 読む'
    $(function(){
        $("#column").load("aboutDaisetsuzan.html");
        $("html,body").animate({scrollTop:position},600);
    });
});

onClick('aboutSugatami', function() {
    view.setCenter(sugatami);
    view.setZoom(16.5);
    toColumn.innerHTML='姿見園地について 読む'
    $(function(){
        $("#column").load("aboutSugatami.html");
    });
});

onClick('aboutTrailToPeak',function(){
    view.setCenter(asahidake);
    view.setZoom(15);
    toColumn.innerHTML='旭岳山頂ルートについて 読む'
    $(function(){
        $("#column").load("aboutTrailToPeak.html");
    });
});

onClick('about6hLoop',function(){
    view.setCenter(nakadakeOnsen);
    view.setZoom(14);
    toColumn.innerHTML='一日周回コースについて 読む'
    $(function(){
        $("#column").load("about6hLoop.html");
    });

    //ポップアップ "中岳温泉"
    // content.innerHTML = '<p>中岳温泉</p>'
    // overlayPopup.setPosition(markerNakadakeOnsen);
    // container.style.display = 'block'; 
});

onClick('trail_Info',function(){
    toColumn.innerHTML='各種情報 読む';
    $(function(){
        $("#column").load("trail_Info.html");
        $("html,body").animate({scrollTop:position},600);
    });
});

//memo
//photosGroup  //画像グループ
//photosGroup.getLayers().getArray()    //各画像レイヤー
//layer.getFeatures()    //各Feature
//feature.getGeometry.getCoordinates() // Featureの場所
//

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

function DisplayPicColum() {
    console.dir('inPicColum');
    
    const visiblePhotos = getVisiblePhotos().reverse(); // 順番は反対
    console.log(visiblePhotos)
    let newHTML = '';
    for (let photoSrc of visiblePhotos) {
        newHTML += imgHTML(photoSrc);
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
    return `<img class="fit-picture" src="/images/MapPics/${src}" alt="test Pic" />`
}

var autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});

//マップクリックイベント
function handleMapPointer(evt) {
    const pixel = evt.pixel;
    const coord = evt.coordinate;
    const photoLayers = photosGroup.getLayers().getArray();

    const imgs = []
    map.forEachFeatureAtPixel(pixel, (feature, layer) => {
        if (photoLayers.includes(layer)) {
            // 写真レイヤーの場合
            const imgSrc = feature.get('src');
            imgs.push(imgSrc);
        }
    })

    const filteredImages = imgs.filter(img => img !== undefined); // srcのないのを抜く

    if (filteredImages.length > 0) {
        // クリックした写真Pointある
        showPopup(filteredImages, coord);
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

// var scrollPoint = document.getElementById('column'); // 移動させたい位置の要素を取得
// var rect = scrollPoint.getBoundingClientRect();
// var position = rect.top;    // 一番上からの位置を取得
// $(function(){
//         $("#column").load("aboutDaisetsuzan.html");
//         $("html,body").delay(1000).animate({scrollTop:position},1000);
// });


