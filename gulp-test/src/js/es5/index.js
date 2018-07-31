"use strict";

// import canvasLayer from './canvasLayer/canvasLayer';
// console.log(canvasLayer);
var map = null;
var tileLayer = null;
var tilegrid = null;
var tilegridList = [];
var dataList = [{
    n: "北京",
    "X": 116.395645,
    "Y": 39.929986,
    value: 9
}, {
    n: "上海",
    "X": 121.487899,
    "Y": 31.249162,
    value: 5
}, {
    n: "天津",
    "X": 117.210813,
    "Y": 39.14393,
    value: 1
}, {
    n: "重庆",
    "X": 106.530635,
    "Y": 29.544606,
    value: 2
}, {
    n: "沧州",
    "X": 116.863806,
    "Y": 38.297615,
    value: 2
}, {
    n: "沧州",
    "X": 116.863806,
    "Y": 38.297615,
    value: 2
}, {
    n: "沧州",
    "X": 116.863806,
    "Y": 38.297615,
    value: 2
}, {
    n: "廊坊",
    "X": 116.703602,
    "Y": 39.518611,
    value: 2
}, {
    n: "衡水",
    "X": 115.686229,
    "Y": 37.746929,
    value: 2
}, {
    n: "邯郸",
    "X": 114.482694,
    "Y": 36.609308,
    value: 2
}, {
    n: "承德",
    "X": 117.933822,
    "Y": 40.992521,
    value: 2
}];
var tileSize = 32;
dataList.forEach(function (item, i) {
    dataList[i].coordinate = ol.proj.transform([item.X, item.Y], 'EPSG:4326', 'EPSG:3857');
});
window.onload = function () {
    var resolutions = [];
    var extent = [12665080.52765571, 2550703.6338763316, 12725465.780000998, 2601457.820657688]; //深圳地区
    var projection = new ol.proj.get("EPSG:3857");
    var projectionExtent = projection.getExtent();
    for (var i = 0; i < 19; i++) {
        resolutions[i] = Math.pow(2, 18 - i);
    }
    console.log(resolutions);
    tilegrid = new ol.tilegrid.TileGrid({
        origin: ol.extent.getBottomLeft(projectionExtent),
        resolutions: resolutions,
        extent: projectionExtent, //extent,
        tileSize: [tileSize, tileSize]
    });
    tileLayer = new ol.layer.Tile({
        source: new ol.source.TileDebug({
            projection: projection,
            tileGrid: tilegrid,
            tileSize: [tileSize, tileSize],
            extent: projectionExtent,
            wrapX: false
        }),
        visible: false
    });
    map = new ol.Map({
        target: "map",
        layers: [new ol.layer.Tile({
            source: new ol.source.OSM({
                projection: projection,
                tileGrid: tilegrid,
                tileSize: [tileSize, tileSize],
                extent: projectionExtent,
                wrapX: false
            })
        }), tileLayer],
        view: new ol.View({
            projection: projection,
            center: [12697184.079535482, 3963239.3065151004], //深圳
            resolutions: resolutions
        })
    });
    map.getView().setZoom(6);
    // getGridInfo();
    //渲染全部完成
    map.once('postrender', function (e) {
        createWangge();
        addVectorLayer();
        addPopup();
        addLineVectorLayer();
        addImg();
    });
    return;
};
var layer = null;
//网格图
function createWangge() {
    layer = new canvasLayer({
        map: map,
        data: dataList,
        tileSize: tileSize,
        tilegrid: tilegrid
    });
}

function clearCanvas(context) {
    console.log(context);
}

function creatliubianxing() {
    var App = {
        init: function init() {
            layer = new liubian({
                map: map, // 对应的mapv实例
                parentDom: $('.ol-viewport')[0],
                zIndex: 1, // 图层层级
                data: [{
                    n: "北京",
                    "X": 116.395645,
                    "Y": 39.929986,
                    value: 9
                }, {
                    n: "上海",
                    "X": 121.487899,
                    "Y": 31.249162,
                    value: 5
                }, {
                    n: "天津",
                    "X": 117.210813,
                    "Y": 39.14393,
                    value: 1
                }, {
                    n: "重庆",
                    "X": 106.530635,
                    "Y": 29.544606,
                    value: 2
                }], // 数据
                drawOptions: { // 绘制参数
                    size: 50, // 网格大小
                    globalAlpha: 0.5,
                    unit: 'px', // 单位
                    label: { // 是否显示文字标签
                        show: true
                    },
                    gradient: { // 显示的颜色渐变范围
                        '0': 'blue',
                        '0.6': 'cyan',
                        '0.7': 'lime',
                        '0.8': 'yellow',
                        '1.0': 'red'
                    }
                }
            });
            layer.init();
        }
    };
    App.init();
}
/*
 * ol地理坐标转化屏幕坐标
 */
function lngLatToXY(lngLat) {
    var cityPoint = ol.proj.transform(lngLat, 'EPSG:4326', 'EPSG:3857'); //地理坐标系转化为投影坐标系
    return map.getPixelFromCoordinate(cityPoint);
}
/*
 * ol地理坐标转化屏幕坐标3857
 */
function ollngLatToXY(lngLat) {
    return map.getPixelFromCoordinate(lngLat);
}
//获取划线的维度
function getLatList() {
    var mapZoom = map.getView().getZoom();
    var mapZoomSize = Math.pow(mapZoom, 2);
}
//添加经纬度
function addPointFeature(lngLat) {
    lngLat = ol.proj.transform(lngLat, 'EPSG:4326', 'EPSG:3857');
    var feature = new ol.Feature(new ol.geom.Point(lngLat));
    return feature;
}
var pointFeature = new ol.Feature(new ol.geom.Point(ol.proj.transform([110, 40], 'EPSG:4326', 'EPSG:3857')));
var lineFeature = new ol.Feature(new ol.geom.LineString([[1e7, 4e6], [1.5e7, 4e6]]));
var polygonFeature = new ol.Feature(new ol.geom.Polygon([[[-3e6, -1e6], [-3e6, 1e6], [-1e6, 1e6], [-1e6, -1e6], [-3e6, -1e6]]]));
var MultiPointFeature = new ol.Feature(new ol.geom.MultiPoint([[1.3e7, 4.3e6], [1.1e7, 4.3e6]]));
//添加圆图层
var circleLayer = null;

function addVectorLayer() {
    circleLayer = new ol.layer.Vector({
        style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 10,
                fill: new ol.style.Fill({
                    color: 'red'
                }),
                stroke: new ol.style.Stroke({
                    color: 'green',
                    width: 4
                })
            }),
            fill: new ol.style.Fill({
                color: 'red'
            }),
            stroke: new ol.style.Stroke({
                color: 'green',
                width: 4
            }),
            text: new ol.style.Text({
                font: '12px Calibri,sans-serif',
                fill: new ol.style.Fill({
                    color: '#000'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                }),
                text: 'text'
            })
        }),
        source: new ol.source.Vector({
            features: [pointFeature, lineFeature, polygonFeature, MultiPointFeature]
        }),
        title: '矢量图层'
    });
    map.addLayer(circleLayer);
}
// 添加弹窗
function addPopup() {
    // Popup showing the position the user clicked
    window.popup = new ol.Overlay({
        element: document.getElementById('popup')
    });
    map.addOverlay(popup);
    map.on('click', function (evt) {
        console.log('click');
        var element = popup.getElement();
        var coordinate = evt.coordinate;
        var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326'));
        popup.setPosition(coordinate);
        element.innerHTML = '<p>The location you clicked was:</p><code>' + hdms + '</code>';
        element.style.display = 'block';
    });
}
var vectorLayerLine = null;
//添加矢量图层 selectBox
function addLineVectorLayer() {
    var vectorSource = new ol.source.Vector({
        url: 'https://openlayers.org/en/v4.6.5/examples/data/geojson/countries.geojson',
        format: new ol.format.GeoJSON(),
        name: 'selectBoxLayer'
    });
    vectorLayerLine = new ol.layer.Vector({
        source: vectorSource
    });
    map.addLayer(vectorLayerLine);
    // 添加一个简单的单击选择事件
    var select = new ol.interaction.Select({
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'red'
            }),
            stroke: new ol.style.Stroke({
                color: 'green',
                width: 4
            })
        })
    });
    map.addInteraction(select);
    var selectedFeatures = select.getFeatures();
    //添加选择框选择事件
    var dragBox = new ol.interaction.DragBox({
        condition: ol.events.condition.platformModifierKeyOnly,
        className: 'ol-dragbox'
    });
    map.addInteraction(dragBox);
    dragBox.on('boxend', function () {
        // features that intersect the box are added to the collection of selected features
        var extent = dragBox.getGeometry().getExtent();
        vectorSource.forEachFeatureIntersectingExtent(extent, function (feature) {
            selectedFeatures.push(feature);
        });
    });
    // clear selection when drawing a new box and when clicking on the map
    dragBox.on('boxstart', function () {
        selectedFeatures.clear();
    });
    selectedFeatures.on(['add', 'remove'], function (event) {
        // if(event.type)
        console.log(event);

        var names = selectedFeatures.getArray().map(function (feature) {
            return feature.get('name');
        });
        if (names.length > 0) {
            console.log(names.join(', '));
        } else {
            console.log('No countries selected');
        }
    });
}
var jiuduanLayer = null;
//添加图标
function addImg() {
    var featureA = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([110, 20], 'EPSG:4326', 'EPSG:3857'))
    });
    var featrueAStyle = new ol.style.Style({
        image: new ol.style.Icon({
            src: 'https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/icon-police.png?v=md5',
            size: [20, 20]
        })
    });
    featureA.setStyle(featrueAStyle);
    // jiuduanLayer.getSource().addFeature(featureA);
    jiuduanLayer = new ol.layer.Vector({
        name: 'ImgLayer',
        source: new ol.source.Vector({
            features: [featureA]
        })
    });
    map.addLayer(jiuduanLayer);
}