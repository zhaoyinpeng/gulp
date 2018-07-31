let canvasLayer = function(option) {
    if(typeof(option) == 'undefined'){
        return false;
    }
    this.option = option;
    this.map = option.map;
    this.tilegrid = option.tilegrid;
    this.data = this.option.data;
    this.formatData();
    this.canvasDom = null;
    this.context = null;
    this.canvasBox = document.getElementsByClassName('ol-viewport')[0];
    this.init();
}
canvasLayer.prototype.init = function(){
    this.creatCanvas();
    this.drawRect();
    this.bindEvent();
}
canvasLayer.prototype.bindEvent = function() {
    var me = this;
    //渲染全部完成
    var pointerdragFun = function() {
        me.clear();
    };
    this.map.un("pointerdrag", pointerdragFun);
    this.map.on("pointerdrag", pointerdragFun);
    var moveendFun = function() {
        me.clear();
        me.formatData();
        me.drawRect();
    }
    this.map.un("moveend", moveendFun);
    this.map.on("moveend", moveendFun);
},
canvasLayer.prototype.creatCanvas = function() {
    if (this.canvasDom) {
        this.remove();
    }
    this.canvasDom = document.createElement('canvas');
    this.canvasDom.id = 'canvasLayer';
    this.canvasDom.style.position = 'absolute';
    this.canvasDom.height = window.screen.height;
    this.canvasDom.width = window.screen.width;
    this.canvasDom.style.top = 0;
    this.canvasDom.style.left = 0;
    this.canvasBox.appendChild(this.canvasDom);
    this.context = this.canvasDom.getContext("2d");
}
canvasLayer.prototype.remove = function() {
    this.canvasDom.parentNode.removeChild(this.canvasDom);
}
canvasLayer.prototype.clear = function() {
    this.context.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height);
}
canvasLayer.prototype.drawRect = function() {
    let context = this.context;
    var dataList = this.drawList;
    for(let i in dataList){
        var topLeftXY = ollngLatToXY(dataList[i].topLeftXY);
        var bottomRightXY = ollngLatToXY(dataList[i].bottomRightXY);
        context.fillStyle = this.getColor(dataList[i].num);
        // context.strokeStyle = this.getColor();
        // context.strokeRect(topLeftXY[0], topLeftXY[1], this.option.tileSize, this.option.tileSize);
        context.fillRect(topLeftXY[0], topLeftXY[1], this.option.tileSize, this.option.tileSize);
        context.stroke(); //绘制
        //数量
        context.textBaseline = 'middle';
        context.textAlign = 'center';
        context.fillStyle = 'rgba(255,255,255,0.8)';
        context.fillText(dataList[i].num, topLeftXY[0]+this.option.tileSize/2, topLeftXY[1]+this.option.tileSize/2);
        context.restore();
    }
    // //起始点和终点
    // context.moveTo(100, 100);
    // context.lineTo(200, 100);
    // context.lineTo(200, 200);
    // context.lineTo(100, 200);
}
//获取地图网格信息
canvasLayer.prototype.formatData = function() {
    var drawList = [];
    for(var i = 0;i<this.data.length;i++){
        var grid = this.tilegrid.getTileCoordForCoordAndResolution(this.data[i].coordinate,this.map.getView().getResolution());
        var gridKey = grid.join('|');
        if(drawList[gridKey]){
            drawList[gridKey].num += 1;
        }else{
            drawList[gridKey] = {
                gridInfo: grid,
                topLeftXY:ol.extent.getTopLeft(this.tilegrid.getTileCoordExtent(grid)),
                bottomRightXY:ol.extent.getBottomRight(this.tilegrid.getTileCoordExtent(grid)),
                num: 1
            }
        }
    }
    this.drawList = drawList;
}
canvasLayer.prototype.getColor = function(num){
    var colorList = ['red','blue','black','green','pink'];
    return colorList[(num+5)%5];
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