

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

var sketch;

//ポップアップ処理
closer.onclick = function() {
    container.style.display = 'none';
    closer.blur();
    return false;
};
const overlayPopup = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});

var expandedAttribution = new ol.control.Attribution({
    collapsible: false
});


//---座標定義---------------------------------
var sugatami = ol.proj.fromLonLat([142.82877,43.66210]);
var asahidake = ol.proj.fromLonLat([142.84192,43.66144]);
var nakadakeOnsen = ol.proj.fromLonLat([142.84258,43.67512]);
var markerNakadakeOnsen = ol.proj.fromLonLat([142.861559,43.681867]);

var view = new ol.View({
     center: asahidake,

     maxZoom: 16, minZoom: 11,
});

//---マップの定義
var map = new ol.Map({
    controls: ol.control.defaults({attribution:false}).extend([
        expandedAttribution,new geolocateControl(),
    ]),
    target: document.getElementById('map'),
    renderer: 'canvas',
    overlays:[overlayPopup],
    layers: layersList,
    loadTilesWhileAnimating: true,
    view:view
});
//---スケールラインの設定
var scaleLine = new ol.control.ScaleLine();
map.addControl(scaleLine);

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

//トップボタンの表示
$(function(){
  var pagetop = $('#toTop');
  pagetop.hide();
  console.log($(window).height());
    // positionまでスクロールしたらボタン表示
    $("html,body").scroll(function () {
        if (($(this).scrollTop() > (position - $(window).height()*0.2) ) && ($('#toTop').is(':hidden'))){
            pagetop.fadeIn();
            console.log('fadeIn');
        } else if(($(this).scrollTop() <= (position - $(window).height()*0.2)) && ($('#toTop').is(':visible'))){
            pagetop.fadeOut();
            console.log('fadeOut');
        }
    });
  pagetop.click(function () {
     $('body, html').animate({scrollTop: 0 }, 500);
     return false;
  });
});


//クリックイベント関数の簡略化
function onClick(id, callback) {
    document.getElementById(id).addEventListener('click', callback);
}
//各ボタンの処理
onClick('aboutAsahidake', function() {
    view.setCenter(sugatami);
    view.setZoom(16.5);
    scrollTo(0,0);
    $(function(){
        $("#column").load("aboutDaisetsuzan.html");
        $("html,body").animate({scrollTop:position},600);
    });
});

onClick('aboutSugatami', function() {
    view.setCenter(sugatami);
    view.setZoom(16.5);
    $(function(){
        $("#column").load("aboutSugatami.html");
    });
});

onClick('aboutTrailToPeak',function(){
    view.setCenter(asahidake);
    view.setZoom(15);
    $(function(){
        $("#column").load("aboutTrailToPeak.html");
    });
});

onClick('about6hLoop',function(){
    view.setCenter(nakadakeOnsen);
    view.setZoom(14);
    $(function(){
        $("#column").load("about6hLoop.html");
    });

    //ポップアップ "中岳温泉"
    // content.innerHTML = '<p>中岳温泉</p>'
    // overlayPopup.setPosition(markerNakadakeOnsen);
    // container.style.display = 'block'; 
});



//写真レイヤーグループの中にVisibleがあるか
var isAnyPicVisible = function(){
    for(var k in layersList[2].values_.layers.array_){
        if(layersList[2].values_.layers.array_[k].getVisible()){
            return true;
        }
    }
    return false;
}

//写真一覧クリック処理用
 var pictureOnClick =  function(layer,id){
    return function(){
        console.dir('pictureOnClick');
        content.innerHTML = '<p>' + 'test' + '</P>' ;
        var dir = layersList[2].values_.layers.array_[layer].values_.source.featureChangeKeys_[id][0].target.values_.Path.replace(/[\\\/:]/g, '_').trim();
        content.innerHTML += '<img class="fit-picture" src=images/' + dir + ' id=' + id + ' alt="test Pic">'
        var point = layersList[2].values_.layers.array_[layer].values_.source.featureChangeKeys_[id][0].target.values_.geometry.flatCoordinates;
        overlayPopup.setPosition(point);
        container.style.display = 'block';
    }
}

//写真一覧の表示
var DisplayPicColum = function(){
    console.dir('inPicColum');
    pic.innerHTML = '';
    for(var k in layersList[2].values_.layers.array_){
       
        if(layersList[2].values_.layers.array_[k].getVisible() == false)continue;
        for(var i in layersList[2].values_.layers.array_[k].values_.source.featureChangeKeys_){
            var dir = layersList[2].values_.layers.array_[k].values_.source.featureChangeKeys_[i][0].target.values_.Path.replace(/[\\\/:]/g, '_').trim();
            var ol_uid = i;
            pic.innerHTML += '<img class="fit-picture" src=images/' + dir + ' id="' + ol_uid +  '" alt="test Pic">';
            //console.dir(pic.innerHTML);
        }
    }
    //---event 処理
    for(var k in layersList[2].values_.layers.array_){
        if(layersList[2].values_.layers.array_[k].getVisible() == false)continue;
        for(var i in layersList[2].values_.layers.array_[k].values_.source.featureChangeKeys_){
            var ol_uid = i;
            onClick(ol_uid,pictureOnClick(k,ol_uid));
        }
    }
    //---
}
//最初の表示
DisplayPicColum();


//memo
//layersList[2]  //画像グループ
//layersList[2].values_.layers.array_     //各画像レイヤー
//layersList[2].values_.layers.array_[1].values_.source.featureChangeKeys_[ よくわからん ][0] // 各画像の場所
//
//jsonSource_test_8.featureChangeKeys_[4529][0].target.values_.Path         //Pathの場所
//layersList[2].values_.layers.array_[1].values_.source.featureChangeKeys_[4513][0].target.values_.Path   ///上に同じ
//


//layerSwitcher の制作
var layerSwitcher = new ol.control.LayerSwitcher({tipLabel: "Layers"});
map.addControl(layerSwitcher);

map.getView().fit([15897862.879900, 5411688.868681, 15905044.845058, 5417318.640126], map.getSize());

var NO_POPUP = 0
var ALL_FIELDS = 1

/**
 * Returns either NO_POPUP, ALL_FIELDS or the name of a single field to use for
 * a given layer
 * @param layerList {Array} List of ol.Layer instances
 * @param layer {ol.Layer} Layer to find field info about
 */
function getPopupFields(layerList, layer) {
    // Determine the index that the layer will have in the popupLayers Array,
    // if the layersList contains more items than popupLayers then we need to
    // adjust the index to take into account the base maps group
    var idx = layersList.indexOf(layer) - (layersList.length - popupLayers.length);
    return popupLayers[idx];
}


var collection = new ol.Collection();
var featureOverlay = new ol.layer.Vector({
    map: map,
    source: new ol.source.Vector({
        features: collection,
        useSpatialIndex: false // optional, might improve performance
    }),
    style: [new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#f00',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.1)'
        }),
    })],
    updateWhileAnimating: true, // optional, for instant visual feedback
    updateWhileInteracting: true // optional, for instant visual feedback
});

var doHighlight = false;
var doHover = false;

var highlight;
var autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});

//---マウスポインター動かしたときの処理
var onPointerMove = function(evt) {
    if (!doHover && !doHighlight) {
        return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var coord = evt.coordinate;
    var popupField;
    var currentFeature;
    var currentLayer;
    var currentFeatureKeys;
    var clusteredFeatures;
    var popupText = '<ul>';
    map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        // We only care about features from layers in the layersList, ignore
        // any other layers which the map might contain such as the vector
        // layer used by the measure tool
        if (layersList.indexOf(layer) === -1) {
            return;
        }
        var doPopup = false;
        for (k in layer.get('fieldImages')) {
            if (layer.get('fieldImages')[k] != "Hidden") {
                doPopup = true;
            }
        }
        currentFeature = feature;
        currentLayer = layer;
        clusteredFeatures = feature.get("features");
        var clusterFeature;
        if (typeof clusteredFeatures !== "undefined") {
            if (doPopup) {
                for(var n=0; n<clusteredFeatures.length; n++) {
                    clusterFeature = clusteredFeatures[n];
                    currentFeatureKeys = clusterFeature.getKeys();
                    popupText += '<li><table>'
                    for (var i=0; i<currentFeatureKeys.length; i++) {
                        if (currentFeatureKeys[i] != 'geometry') {
                            popupField = '';
                            if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label") {
                                popupField += '<th>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</th><td>';
                            } else {
                                popupField += '<td colspan="2">';
                            }
                            if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label") {
                                popupField += '<strong>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</strong><br />';
                            }
                            if (layer.get('fieldImages')[currentFeatureKeys[i]] != "ExternalResource") {
                                popupField += (clusterFeature.get(currentFeatureKeys[i]) != null ? autolinker.link(clusterFeature.get(currentFeatureKeys[i]).toLocaleString()) + '</td>' : '');
                            } else {
                                popupField += (clusterFeature.get(currentFeatureKeys[i]) != null ? '<img src="images/' + clusterFeature.get(currentFeatureKeys[i]).replace(/[\\\/:]/g, '_').trim()  + '" /></td>' : '');
                            }
                            popupText += '<tr>' + popupField + '</tr>';
                        }
                    } 
                    popupText += '</table></li>';    
                }
            }
        } else {
            currentFeatureKeys = currentFeature.getKeys();
            if (doPopup) {
                popupText += '<li><table>';
                for (var i=0; i<currentFeatureKeys.length; i++) {
                    if (currentFeatureKeys[i] != 'geometry') {
                        popupField = '';
                        if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label") {
                        //    popupField += '<th>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</th><td>';
                        } else {
                        //    popupField += '<td colspan="2">';
                        }
                        if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label") {
                        //    popupField += '<strong>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</strong><br />';
                        }
                        if (layer.get('fieldImages')[currentFeatureKeys[i]] != "ExternalResource") {
                        //    popupField += (currentFeature.get(currentFeatureKeys[i]) != null ? autolinker.link(currentFeature.get(currentFeatureKeys[i]).toLocaleString()) + '</td>' : '');
                        } else {
                        //    popupField += (currentFeature.get(currentFeatureKeys[i]) != null ? '<img src="images/' + currentFeature.get(currentFeatureKeys[i]).replace(/[\\\/:]/g, '_').trim()  + '" /></td>' : '');
                        }
                        popupText += '<tr>' + popupField + '</tr>';
                    }
                }
                popupText += '</table></li>';
            }
        }
    });
    if (popupText == '<ul>') {
        popupText = '';
    } else {
        popupText += '</ul>';
    }

    if (doHighlight) {
        if (currentFeature !== highlight) {
            if (highlight) {
                featureOverlay.getSource().removeFeature(highlight);
            }
            if (currentFeature) {
                var styleDefinition = currentLayer.getStyle().toString();

                if (currentFeature.getGeometry().getType() == 'Point') {
                    var radius = styleDefinition.split('radius')[1].split(' ')[1];

                    highlightStyle = new ol.style.Style({
                        image: new ol.style.Circle({
                            fill: new ol.style.Fill({
                                color: "#ffff00"
                            }),
                            radius: radius
                        })
                    })
                } else if (currentFeature.getGeometry().getType() == 'LineString') {

                    var featureWidth = styleDefinition.split('width')[1].split(' ')[1].replace('})','');

                    highlightStyle = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#ffff00',
                            lineDash: null,
                            width: featureWidth
                        })
                    });

                } else {
                    highlightStyle = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: '#ffff00'
                        })
                    })
                }
                featureOverlay.getSource().addFeature(currentFeature);
                featureOverlay.setStyle(highlightStyle);
            }
            highlight = currentFeature;
        }
    }

    if (doHover) {
        if (popupText) {
            overlayPopup.setPosition(coord);
            content.innerHTML = popupText;
            container.style.display = 'block';        
        } else {
            container.style.display = 'none';
            closer.blur();
        }
    }
};


//TryDoNotPopUpText onSingleClick
var onSingleClick = function(evt) {
    if (doHover) {
        return;
    }
    if (sketch) {
        return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var coord = evt.coordinate;
    var popupField;
    var currentFeature;
    var currentFeatureKeys;
    var clusteredFeatures;
    var popupText = '<ul>';
    map.forEachFeatureAtPixel(pixel, function(feature, layer) {

        if(layer === layersList[2].values_.layers.array_[0]　 || layer === layersList[2].values_.layers.array_[1]){ //写真レイヤーのみPopUpに指定
        //console.dir(layersList[2].values_.layers.array_[1]);
        if (feature instanceof ol.Feature && (layer.get("interactive") || layer.get("interactive") == undefined)) {
            var doPopup = false;
            //各レイヤー　各レイヤーの'fieldImages'の中にHiddenがなければフラグ上げ//
            //layer.get('fieldImages')[k]  各layerの中のfieldImages[k]取り出し
            for (k in layer.get('fieldImages')) {
                if (layer.get('fieldImages')[k] != "Hidden") {
                    doPopup = true;
                }
            }
            currentFeature = feature;
            clusteredFeatures = feature.get("features");
            var clusterFeature;
            if (typeof clusteredFeatures !== "undefined") {
                if (doPopup) {
                    for(var n=0; n<clusteredFeatures.length; n++) {
                        clusterFeature = clusteredFeatures[n];
                        currentFeatureKeys = clusterFeature.getKeys();
                        popupText += '<li><table>'
                        for (var i=0; i<currentFeatureKeys.length; i++) {
                            if (currentFeatureKeys[i] != 'geometry') {
                                popupField = '';
                                if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label") {
                                //popupField += '<th>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</th><td>';
                                } else {
                                    //popupField += '<td colspan="2">';
                                }
                                if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label") {
                                    //popupField += '<strong>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</strong><br />';
                                }
                                if (layer.get('fieldImages')[currentFeatureKeys[i]] != "ExternalResource") {
                                //    popupField += (clusterFeature.get(currentFeatureKeys[i]) != null ? autolinker.link(clusterFeature.get(currentFeatureKeys[i]).toLocaleString()) + '</td>' : '');
                                } else {
                                //    popupField += (clusterFeature.get(currentFeatureKeys[i]) != null ? '<img src="images/' + clusterFeature.get(currentFeatureKeys[i]).replace(/[\\\/:]/g, '_').trim()  + '"width="200" /></td>' : '');
                                }
                                popupText += '<tr>' + popupField + '</tr>';
                            }
                        } 
                        popupText += '</table></li>';    
                    }
                }
            } else {
                currentFeatureKeys = currentFeature.getKeys();
                if (doPopup) {
                    popupText += '<li><table>';
                    for (var i=0; i<currentFeatureKeys.length; i++) {
                        if (currentFeatureKeys[i] != 'geometry') {
                            popupField = '';
                            if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label") {
                                popupField += '<th>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</th><td>';
                            } else {
                                popupField += '<td colspan="2">';
                            }
                            if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label") {
                                popupField += '<strong>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</strong><br />';
                            }
                            if (layer.get('fieldImages')[currentFeatureKeys[i]] != "ExternalResource") {
                                popupField += (currentFeature.get(currentFeatureKeys[i]) != null ? autolinker.link(currentFeature.get(currentFeatureKeys[i]).toLocaleString()) + '</td>' : '');
                            } else {
                                //console.log(JSON.stringify(layer));
                                //console.dir(layer);
                                //popupField +='<th>' + 'test:' +json_test_8.features[0].geometry.coordinates + '</th>';
                                popupField += (currentFeature.get(currentFeatureKeys[i]) != null ? '<img src="images/' + currentFeature.get(currentFeatureKeys[i]).replace(/[\\\/:]/g, '_').trim()  + '" width="200" /></td>' : '');
                            }
                            popupText += '<tr>' + popupField + '</tr>';
                        }
                    }
                    popupText += '</table>';
                }
            }
        }
    }});
    if (popupText == '<ul>') {
        popupText = '';
    } else {
        popupText += '</ul>';
    }
    //layersList[2]つまり最後に写真のレイヤーが入っている
    //layersList[2].values_.layers.array_[0]が写真レイヤー
    
    var viewProjection = map.getView().getProjection();
    var viewResolution = map.getView().getResolution();
    for (i = 0; i < wms_layers.length; i++) {
        if (wms_layers[i][1]) {
            var url = wms_layers[i][0].getSource().getGetFeatureInfoUrl(
                evt.coordinate, viewResolution, viewProjection,
                {
                    'INFO_FORMAT': 'text/html',
                });
            if (url) {
                popupText = popupText + '<iframe style="width:100%;height:110px;border:0px;" id="iframe" seamless src="' + url + '"></iframe>';
            }
        }
    }

    if (popupText) {
        overlayPopup.setPosition(coord);
        content.innerHTML = popupText;
        container.style.display = 'block';        
    } else {
        container.style.display = 'none';
        closer.blur();
    }
};


map.on('pointermove', function(evt) {
    onPointerMove(evt);
});
map.on('singleclick', function(evt) {
    onSingleClick(evt);
});



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


var attributionComplete = false;
map.on("rendercomplete", function(evt) {
    if (!attributionComplete) {
        var attribution = document.getElementsByClassName('ol-attribution')[0];
        var attributionList = attribution.getElementsByTagName('ul')[0];
        var firstLayerAttribution = attributionList.getElementsByTagName('li')[0];
        var qgis2webAttribution = document.createElement('li');
        qgis2webAttribution.innerHTML = '<a href="https://github.com/tomchadwin/qgis2web">qgis2web</a> &middot; ';
        var olAttribution = document.createElement('li');
        olAttribution.innerHTML = '<a href="https://openlayers.org/">OpenLayers</a> &middot; ';
        var qgisAttribution = document.createElement('li');
        qgisAttribution.innerHTML = '<a href="https://qgis.org/">QGIS</a>';
        attributionList.insertBefore(qgis2webAttribution, firstLayerAttribution);
        attributionList.insertBefore(olAttribution, firstLayerAttribution);
        attributionList.insertBefore(qgisAttribution, firstLayerAttribution);
        attributionComplete = true;
    }
})

var scrollPoint = document.getElementById('column'); // 移動させたい位置の要素を取得
var rect = scrollPoint.getBoundingClientRect();
var position = rect.top;    // 一番上からの位置を取得
$(function(){
        $("#column").load("aboutDaisetsuzan.html");
        $("html,body").delay(1000).animate({scrollTop:position},1000);
});


