var size = 0;
var placement = 'point';

var style_kanshiinmaplabels_7 = function(feature, resolution){
    var context = {
        feature: feature,
        variables: {}
    };
    var value = ""
    var labelText = "";
    size = 0;
    var labelFont = "15.600000000000001px \'.SF NS Text\', sans-serif";
    var labelFill = "#4a4a4a";
    var bufferColor = "#ffffff";
    var bufferWidth = 2.0;
    var textAlign = "left";
    var offsetX = 8;
    var offsetY = 3;
    var placement = 'point';
    if (feature.get("jp") !== null) {
        labelText = String(feature.get("jp"));
    }
    var style = [ new ol.style.Style({
        image: new ol.style.Circle({radius: 12.0 + size,
             fill: new ol.style.Fill({color: 'rgba(64,64,64,1.0)'})}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];

    return style;
};
