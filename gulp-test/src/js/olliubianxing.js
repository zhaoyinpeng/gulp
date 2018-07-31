// openlayer版本六边形
function liubian(option) {
    this.option = option || {};
    this._map = this.option.map;
    this.canvasDiv = document.getElementById('canvasDiv');
    if (!this.canvasDiv) {
        var div = document.createElement('div');
        div.id = 'canvasDiv';
        div.style.position = 'absolute';
        div.style.height = this._map.getSize()[1] + 'px';
        div.style.width = this._map.getSize()[0] + 'px';
        div.style.top = 0;
        div.style.left = 0;
        this.canvasDiv = div;
        this.option.parentDom.appendChild(div);
    };
    this.init();
    this._bindEvent();
};
liubian.prototype = {
    _bindEvent: function() {
        var me = this;
        //渲染全部完成
        var pointerdragFun = function() {
            $("#canvasID").remove();
        };
        this._map.un("pointerdrag", pointerdragFun);
        this._map.on("pointerdrag", pointerdragFun);
        var moveendFun = function() {
            $("#canvasID").remove();
            me.init();
        }
        this._map.un("moveend", moveendFun);
        this._map.on("moveend", moveendFun);

        // this._map.on("pan-start", function() {
        //     $("#canvasID").remove();
        // });
        // this._map.on("pan-end", function() {
        //     me.init();
        // });
        // this._map.on("zoom-start", function() {
        //     $("#canvasID").remove();
        // });
        // this._map.on("zoom-end", function() {
        //     me.init();
        // });
    },
    init: function() {
        var me = this,
            option = this.option,
            map = option.map;
        var width = this.canvasDiv.style.width,
            height = this.canvasDiv.style.height;
        var getCanvasID = document.getElementById('canvasID');
        if (!getCanvasID) {
            $('#canvasDiv').append('<canvas id="canvasID" width=' + width + ' height=' + height + '></canvas>');
            getCanvasID = document.getElementById('canvasID');
        }
        var ctx = getCanvasID.getContext("2d");
        this.zoomUnit = Math.pow(2, 18 - map.getView().getZoom());
        // this.zoomUnit =  18 - map.getView().getZoom();
        // this.zoomUnit = map.getView().getZoom();
        var param = me.formatParam(this.option);
        param.zoomUnit = this.zoomUnit;
        // console.log(param);
        var data = [];
        me.generalGradient(option.drawOptions.gradient);
        //========================
        // var extend = map.getView().calculateExtent(map.getSize());
        var Mercator = map.getView().getCenter();
        var lngLat = ol.proj.transform(Mercator, 'EPSG:3857', 'EPSG:4326');
        // var webMercator = lngLatToXY(lngLat);
        var mapSize = map.getSize();
        var nwMc = {
            x: lngLat[0] - mapSize[0] / 2 * param.zoomUnit,
            y: lngLat[1] + mapSize[1] / 2 * param.zoomUnit
        }
        // console.log(nwMc);
        option.data.forEach(function(item) {
            data.push(item.value);
            var pixel = lngLatToXY([item.X, item.Y]);
            item.x1 = pixel[0];
            item.y1 = pixel[1];
            if (item.x1 && item.y1) {
                item.px = (item.x1 - nwMc.x) / param.zoomUnit;
                item.py = (nwMc.y - item.y1) / param.zoomUnit;
            }
        });
        var obj1 = {
            data: option.data,
            nwMc: nwMc,
            size: me.size,
            zoomUnit: param.zoomUnit,
            ctx: ctx
        };
        console.log(obj1);
        var grid = me.honeycombGrid(obj1);
        console.log(grid);
        var obj = {
            ctx: ctx,
            size: me.size,
            zoomUnit: param.zoomUnit,
            fillColors: param.colors,
            max: Math.max.apply(null, data),
            min: Math.min.apply(null, data),
            grids: grid
        }
        me.drawHoneyComb(obj);
        // require(["esri/geometry/webMercatorUtils", "esri/geometry/Extent", "esri/geometry/Point"], function(webMercatorUtils, Extent, Point) {
        //     // webMercator = webMercatorUtils.lngLatToXY(105.403119, 38.028658);
        //     // console.log(map);
        //     var extend = new Extent(map.extent);
        //     // console.log(extend.getCenter());
        //     webMercator = webMercatorUtils.lngLatToXY(map.extent.getCenter().x, map.extent.getCenter().y);
        //     // console.log(webMercator);
        //     var nwMcX = map.extent.getCenter().x - map.width / 2 * param.zoomUnit;
        //     var point = new Point(extend.getCenter());
        //     // console.log(screenPoint);
        //     var nwMc = {
        //         x: nwMcX,
        //         y: map.extent.getCenter().y + map.height / 2 * param.zoomUnit
        //     };
        //     // var nwMc1 ={x: nwMcX, y: map.extent.getCenter().y + map.height / 2 * param.zoomUnit};
        //     // var nwMc = map.toScreen(nwMc);
        //     console.log(nwMc);
        //     option.data.forEach(function(item) {
        //         data.push(item.value);
        //         var pixel = webMercatorUtils.lngLatToXY(item.X, item.Y);
        //         item.x1 = pixel[0];
        //         item.y1 = pixel[1];
        //         if (item.x1 && item.y1) {
        //             item.px = (item.x1 - nwMc.x) / param.zoomUnit;
        //             item.py = (nwMc.y - item.y1) / param.zoomUnit;
        //         }
        //     });
        //     // console.log(option.data);
        //     var obj1 = {
        //         data: option.data,
        //         nwMc: nwMc,
        //         size: me.size,
        //         zoomUnit: param.zoomUnit,
        //         ctx: ctx
        //     };
        //     console.log(obj1);
        //     var grid = me.honeycombGrid(obj1);
        //     console.log(grid);
        //     var obj = {
        //         ctx: ctx,
        //         size: me.size,
        //         zoomUnit: param.zoomUnit,
        //         fillColors: param.colors,
        //         max: Math.max.apply(null, data),
        //         min: Math.min.apply(null, data),
        //         grids: grid
        //     }
        //     me.drawHoneyComb(obj);
        // });
    },
    generalGradient: function generalGradient(grad) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var gradient = ctx.createLinearGradient(0, 0, 0, 256);
        canvas.width = 1;
        canvas.height = 256;
        for (var i in grad) {
            gradient.addColorStop(i, grad[i]);
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1, 256);
        this._grad = ctx.getImageData(0, 0, 1, 256).data;
    },
    formatParam: function(option) {
        var fillColors = this.fillColors = [
            [73, 174, 34],
            [119, 191, 26],
            [160, 205, 18],
            [202, 221, 10],
            [248, 237, 1],
            [225, 222, 3],
            [254, 182, 10],
            [254, 126, 19],
            [254, 84, 27],
            [253, 54, 32]
        ];
        var size = option.size || '50';
        size = parseInt(size, 10) * this.zoomUnit;
        this.size = size;
        option.colors = fillColors;
        return option;
    },
    getColorByGradient: function getColorByGradient(count) {
        var max = this.max || 10;
        var index = count / max;
        if (index > 1) {
            index = 1;
        }
        index *= 255;
        index = parseInt(index, 10);
        index *= 4;
        var color = 'rgba(' + this._grad[index] + ', ' + this._grad[index + 1] + ', ' + this._grad[index + 2] + ',' + this._grad[index + 3] / 255 + ')';
        return color;
    },
    honeycombGrid: function(obj) {
        var data = obj.data;
        var nwMc = obj.nwMc;
        var size = obj.size;
        var zoomUnit = obj.zoomUnit;
        var ctx = obj.ctx;
        var max;
        var min;
        var _this = {};
        var grids = {};
        var gridStep = _this.gridStep = size / zoomUnit;
        var depthX = _this.depthX = gridStep;
        var depthY = _this.depthY = gridStep * 3 / 4;
        var sizeY = 2 * size * 3 / 4;
        var startYMc = parseInt(nwMc.y / sizeY + 1, 10) * sizeY;
        var startY = (nwMc.y - startYMc) / zoomUnit;
        startY = _this.startY = parseInt(startY, 10);
        var startXMc = parseInt(nwMc.x / size, 10) * size;
        var startX = (startXMc - nwMc.x) / zoomUnit;
        startX = _this.startX = parseInt(startX, 10);
        var endX = parseInt(ctx.canvas.width + depthX, 10);
        var endY = parseInt(ctx.canvas.height + depthY, 10);
        var pointX = startX;
        var pointY = startY;
        var odd = false;
        while (pointY < endY) {
            while (pointX < endX) {
                var x = odd ? pointX - depthX / 2 : pointX;
                x = parseInt(x, 10);
                grids[x + '|' + pointY] = grids[x + '|' + pointY] || {
                    x: x,
                    y: pointY,
                    len: 0
                };
                pointX += depthX;
            }
            odd = !odd;
            pointX = startX;
            pointY += depthY;
        }
        console.log(grids);
        for (var i in data) {
            var value = data[i].value;
            var pX = data[i].px;
            var pY = data[i].py;
            var fixYIndex = Math.round((pY - startY) / depthY);
            var fixY = fixYIndex * depthY + startY;
            var fixXIndex = Math.round((pX - startX) / depthX);
            var fixX = fixXIndex * depthX + startX;
            if (fixYIndex % 2) {
                fixX = fixX - depthX / 2;
            }
            if (fixX < startX || fixX > endX || fixY < startY || fixY > endY) {
                continue;
            }
            if (grids[fixX + '|' + fixY]) {
                grids[fixX + '|' + fixY].len += value;
                var num = grids[fixX + '|' + fixY].len;
                max = max || num;
                min = min || num;
                max = Math.max(max, num);
                min = Math.min(min, num);
            }
        }
        return {
            grids: grids,
            max: max,
            min: min
        };
    },
    drawHoneyComb: function(obj) {
        var me = this;
        var options = me.formatParam(this.option);
        var ctx = obj.ctx;
        var grids = obj.grids.grids;
        var gridsW = obj.size / obj.zoomUnit;
        var color = obj.fillColors;
        var step = (obj.max - obj.min - 1) / color.length;
        var drowZero = false;
        for (var i in grids) {
            var x = grids[i].x;
            var y = grids[i].y;
            var count = grids[i].len;
            var level = count / step | 0;
            level = level >= color.length ? color.length - 1 : level;
            level = level < 0 ? 0 : level;
            var useColor = me.getColorByGradient(count);
            try {
                if (options.opacity) {
                    var alpha = parseInt(useColor.match(/rgba\(.+?\,.+?\,.+?\,(.+?)\)/)[1] * options.opacity) / 255;
                    useColor = useColor.replace(/(rgba\(.+?\,.+?\,.+?\,).+?(\))/, '$1' + alpha + '$2');
                }
            } catch (e) {}
            if (count > 0 && obj.min && obj.max) {
                me.draw(x, y, gridsW , useColor, ctx);
            }
            // draw text
            if (me.option.drawOptions.label.show) {
                if (count > 0) {
                    ctx.save();
                    ctx.textBaseline = 'middle';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = 'rgba(255,255,255,0.8)';
                    ctx.fillText(parseInt(count), x, y);
                    ctx.restore();
                }
            }
        }
    },
    draw: function(x, y, gridStep, color, ctx) {
        // console.log(color);
        console.log(gridStep);
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(x, y - gridStep / 2);
        ctx.lineTo(x + gridStep / 2, y - gridStep / 2);
        ctx.lineTo(x + gridStep / 2, y + gridStep / 2);
        ctx.lineTo(x, y + gridStep / 2);
        ctx.lineTo(x - gridStep / 2, y + gridStep / 2);
        ctx.lineTo(x - gridStep / 2, y - gridStep / 2);
        ctx.fill();
        ctx.closePath();

        // ctx.beginPath();
        // ctx.fillStyle = 'red';
        
        // ctx.beginPath();
        // ctx.strokeStyle = 'red';
        // ctx.arc(x,y - gridStep / 2,4,0,2*Math.PI);
        // ctx.stroke();

        // ctx.strokeStyle = 'green';
        // ctx.arc(x + gridStep / 2,y - gridStep / 4,4,0,2*Math.PI);
        // ctx.stroke();

        // ctx.strokeStyle = 'blue';
        // ctx.arc(x + gridStep / 2,y + gridStep / 4,4,0,2*Math.PI);
        // ctx.stroke();

        // ctx.strokeStyle = 'black';
        // ctx.arc(x ,y + gridStep / 2,4,0,2*Math.PI);
        // ctx.stroke();
        // ctx.closePath();
    }
}