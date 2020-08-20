var wms_layers = [];



var format_AsahidakeRopeway_2 = new ol.format.GeoJSON();
var features_AsahidakeRopeway_2 = format_AsahidakeRopeway_2.readFeatures(json_AsahidakeRopeway_2, 
    {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_AsahidakeRopeway_2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_AsahidakeRopeway_2.addFeatures(features_AsahidakeRopeway_2);
var lyr_AsahidakeRopeway_2 = new ol.layer.Vector({
    declutter: true,
    source:jsonSource_AsahidakeRopeway_2, 
    style: style_AsahidakeRopeway_2,
    interactive: true,
    title: '<img src="styles/legend/AsahidakeRopeway_2.png" /> AsahidakeRopeway'
});

//-------------------
var format_kanshiinmaptrails_6 = new ol.format.GeoJSON();
var features_kanshiinmaptrails_6 = format_kanshiinmaptrails_6.readFeatures(json_kanshiinmaptrails_6, 
    {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_kanshiinmaptrails_6 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_kanshiinmaptrails_6.addFeatures(features_kanshiinmaptrails_6);
var lyr_kanshiinmaptrails_6 = new ol.layer.Vector({
    declutter: true,
    source:jsonSource_kanshiinmaptrails_6, 
    style: style_kanshiinmaptrails_6,
    interactive: true,
    title: 'kanshiin-map trails<br />\
    <img src="styles/legend/kanshiinmaptrails_6_0.png" /> Grade 1<br />\
    <img src="styles/legend/kanshiinmaptrails_6_1.png" /> Grade 2<br />\
    <img src="styles/legend/kanshiinmaptrails_6_2.png" /> Grade 3<br />\
    <img src="styles/legend/kanshiinmaptrails_6_3.png" /> Grade 4<br />\
    <img src="styles/legend/kanshiinmaptrails_6_4.png" /> Grade 5<br />\
    <img src="styles/legend/kanshiinmaptrails_6_5.png" /> Unknown Grade<br />'
});
var format_kanshiinmaplabels_7 = new ol.format.GeoJSON();
var features_kanshiinmaplabels_7 = format_kanshiinmaplabels_7.readFeatures(json_kanshiinmaplabels_7, 
    {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_kanshiinmaplabels_7 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_kanshiinmaplabels_7.addFeatures(features_kanshiinmaplabels_7);
var lyr_kanshiinmaplabels_7 = new ol.layer.Vector({
    declutter: true,
    source:jsonSource_kanshiinmaplabels_7, 
    style: style_kanshiinmaplabels_7,
    interactive: true,
    title: '<img src="styles/legend/kanshiinmaplabels_7.png" /> kanshiin-map labels'
});
////更新時用タグ
//-------------------------
var format_susoai_0 = new ol.format.GeoJSON();
var features_susoai_0 = format_susoai_0.readFeatures(json_susoai_0, 
    {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_susoai_0 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_susoai_0.addFeatures(features_susoai_0);
var lyr_susoai_0 = new ol.layer.Vector({
    declutter: true,
    source:jsonSource_susoai_0, 
    style: style_susoai_0,
    interactive: true,
    title: '<img src="styles/legend/susoai_0.png" /> susoai'
});
//-------------------------
var format_test_8 = new ol.format.GeoJSON();
var features_test_8 = format_test_8.readFeatures(json_test_8, 
    {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_test_8 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_test_8.addFeatures(features_test_8);
var lyr_test_8 = new ol.layer.Vector({
    declutter: true,
    source:jsonSource_test_8, 
    style: style_test_8,
    interactive: true,
    title: '<img src="styles/legend/test_8.png" /> test'
});
//-------------------------




///----test tiles
var lyr_tileBaseMap = new ol.layer.Tile({
    declutter: true,
    source : new ol.source.XYZ({
        url: "./layers/baseMapTiles/{z}/{x}/{y}.png",

}),
    interactive: true,
    title: '<img src="styles/legend/tileBaseMap.png" /> tileBaseMap',
    extent: [15890800.0,      5401150.0,      15918700.0,      5426850.0]
             

});
//---test tile till here




////更新時用タグ
var group_test = new ol.layer.Group({
    layers: [lyr_test_8,lyr_susoai_0],
    title: "test"});
var group_Source = new ol.layer.Group({
    layers: [lyr_kanshiinmaptrails_6,lyr_kanshiinmaplabels_7,],
    title: "Source"});
var group_BaseMap = new ol.layer.Group({
    layers: [lyr_AsahidakeRopeway_2,lyr_tileBaseMap,],
    title: "BaseMap"});


lyr_AsahidakeRopeway_2.setVisible(true);
lyr_kanshiinmaptrails_6.setVisible(true);
lyr_kanshiinmaplabels_7.setVisible(true);
lyr_test_8.setVisible(true);
lyr_susoai_0.setVisible(true);
lyr_tileBaseMap.setVisible(true);
var layersList = [group_BaseMap,group_Source,group_test];
//更新時用タグ
//fieldAliases  //fieldImages   //fieldLabels
lyr_AsahidakeRopeway_2.set('fieldAliases', {'Name': 'Name', 'description': 'description', 'timestamp': 'timestamp', 'begin': 'begin', 'end': 'end', 'altitudeMode': 'altitudeMode', 'tessellate': 'tessellate', 'extrude': 'extrude', 'visibility': 'visibility', 'drawOrder': 'drawOrder', 'icon': 'icon', 'fid': 'fid', 'jp': 'jp', 'en': 'en', });
lyr_kanshiinmaptrails_6.set('fieldAliases', {'fid': 'fid', 'grade': 'grade', 'closed': 'closed', 'route': 'route', });
lyr_kanshiinmaplabels_7.set('fieldAliases', {'fid': 'fid', 'jp': 'jp', 'en': 'en', 'type': 'type', });

lyr_susoai_0.set('fieldAliases', {'Name': 'Name', 'Date': 'Date', 'Time': 'Time', 'RelPath': 'RelPath', });

lyr_test_8.set('fieldAliases', {'ID': 'ID', 'Name': 'Name', 'Date': 'Date', 'Time': 'Time', 'Path': 'Path', 'RelPath': 'RelPath', });
lyr_AsahidakeRopeway_2.set('fieldImages', {'Name': '', 'description': '', 'timestamp': '', 'begin': '', 'end': '', 'altitudeMode': '', 'tessellate': '', 'extrude': '', 'visibility': '', 'drawOrder': '', 'icon': '', 'fid': '', 'jp': '', 'en': '', });
lyr_kanshiinmaptrails_6.set('fieldImages', {'fid': '', 'grade': 'Range', 'closed': 'CheckBox', 'route': '', });
lyr_kanshiinmaplabels_7.set('fieldImages', {'fid': 'TextEdit', 'jp': 'TextEdit', 'en': 'TextEdit', 'type': 'TextEdit', });

lyr_susoai_0.set('fieldImages', {'Name': 'TextEdit', 'Date': 'DateTime', 'Time': 'DateTime', 'RelPath': 'TextEdit', });

lyr_test_8.set('fieldImages', {'ID': 'Hidden', 'Name': 'Hidden', 'Date': 'DateTime', 'Time': 'DateTime', 'Path': 'ExternalResource', 'RelPath': 'TextEdit', });

lyr_AsahidakeRopeway_2.set('fieldLabels', {});
lyr_kanshiinmaptrails_6.set('fieldLabels', {});
lyr_kanshiinmaplabels_7.set('fieldLabels', {});
//lyr_test_1.set('fieldLabels', {});

lyr_susoai_0.set('fieldLabels', {});

lyr_test_8.set('fieldLabels', {});
lyr_test_8.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});

lyr_tileBaseMap.set('fieldLabels', {});
lyr_tileBaseMap.set('fieldImages', {});
lyr_tileBaseMap.set('fieldAliases', {});