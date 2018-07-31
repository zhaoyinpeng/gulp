/**
 * @author kyle / http://nikai.us/
 */

var resolutionScale$1 = function (context) {
    var devicePixelRatio = window.devicePixelRatio || 1;
    context.canvas.width = context.canvas.width * devicePixelRatio;
    context.canvas.height = context.canvas.height * devicePixelRatio;
    context.canvas.style.width = context.canvas.width / devicePixelRatio + 'px';
    context.canvas.style.height = context.canvas.height / devicePixelRatio + 'px';
    context.scale(devicePixelRatio, devicePixelRatio);
};

function Event() {
  this._subscribers = {}; // event subscribers
}

/**
 * Subscribe to an event, add an event listener
 * @param {String} event        Event name. Available events: 'put', 'update',
 *                              'remove'
 * @param {function} callback   Callback method. Called with three parameters:
 *                                  {String} event
 *                                  {Object | null} params
 *                                  {String | Number} senderId
 */
Event.prototype.on = function (event, callback) {
  var subscribers = this._subscribers[event];
  if (!subscribers) {
    subscribers = [];
    this._subscribers[event] = subscribers;
  }

  subscribers.push({
    callback: callback
  });
};

/**
 * Unsubscribe from an event, remove an event listener
 * @param {String} event
 * @param {function} callback
 */
Event.prototype.off = function (event, callback) {
  var subscribers = this._subscribers[event];
  if (subscribers) {
    //this._subscribers[event] = subscribers.filter(listener => listener.callback != callback);
    for (var i = 0; i < subscribers.length; i++) {
      if (subscribers[i].callback == callback) {
        subscribers.splice(i, 1);
        i--;
      }
    }
  }
};

/**
 * Trigger an event
 * @param {String} event
 * @param {Object | null} params
 * @param {String} [senderId]       Optional id of the sender.
 * @private
 */
Event.prototype._trigger = function (event, params, senderId) {
  if (event == '*') {
    throw new Error('Cannot trigger event *');
  }

  var subscribers = [];
  if (event in this._subscribers) {
    subscribers = subscribers.concat(this._subscribers[event]);
  }
  if ('*' in this._subscribers) {
    subscribers = subscribers.concat(this._subscribers['*']);
  }

  for (var i = 0, len = subscribers.length; i < len; i++) {
    var subscriber = subscribers[i];
    if (subscriber.callback) {
      subscriber.callback(event, params, senderId || null);
    }
  }
};
/**
 * @author kyle / http://nikai.us/
 */

/**
 * DataSet
 *
 * A data set can:
 * - add/remove/update data
 * - gives triggers upon changes in the data
 * - can  import/export data in various data formats
 * @param {Array} [data]    Optional array with initial data
 * the field geometry is like geojson, it can be:
 * {
 *     "type": "Point",
 *     "coordinates": [125.6, 10.1]
 * }
 * {
 *     "type": "LineString",
 *     "coordinates": [
 *         [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
 *     ]
 * }
 * {
 *     "type": "Polygon",
 *     "coordinates": [
 *         [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
 *           [100.0, 1.0], [100.0, 0.0] ]
 *     ]
 * }
 * @param {Object} [options]   Available options:
 * 
 */
function DataSet(data, options) {
    Event.bind(this)();

    this._options = options || {};
    this._data = []; // map with data indexed by id

    // add initial data when provided
    if (data) {
        this.add(data);
    }
}

DataSet.prototype = Event.prototype;

/**
 * Add data.
 */
DataSet.prototype.add = function (data, senderId) {
    if (Array.isArray(data)) {
        // Array
        for (var i = 0, len = data.length; i < len; i++) {
            if (data[i].time && data[i].time.length == 14 && data[i].time.substr(0, 2) == '20') {
                var time = data[i].time;
                data[i].time = new Date(time.substr(0, 4) + '-' + time.substr(4, 2) + '-' + time.substr(6, 2) + ' ' + time.substr(8, 2) + ':' + time.substr(10, 2) + ':' + time.substr(12, 2)).getTime();
            }
            this._data.push(data[i]);
        }
    } else if (data instanceof Object) {
        // Single item
        this._data.push(data);
    } else {
        throw new Error('Unknown dataType');
    }

    this._dataCache = JSON.parse(JSON.stringify(this._data));
};

DataSet.prototype.reset = function () {
    this._data = JSON.parse(JSON.stringify(this._dataCache));
};

/**
 * get data.
 */
DataSet.prototype.get = function (args) {
    args = args || {};

    //console.time('copy data time')
    var start = new Date();
    // TODO: 不修改原始数据，在数据上挂载新的名称，每次修改数据直接修改新名称下的数据，可以省去deepCopy
    // var data = deepCopy(this._data);
    var data = this._data;

    var start = new Date();

    if (args.filter) {
        var newData = [];
        for (var i = 0; i < data.length; i++) {
            if (args.filter(data[i])) {
                newData.push(data[i]);
            }
        }
        data = newData;
    }

    if (args.transferCoordinate) {
        data = this.transferCoordinate(data, args.transferCoordinate, args.fromColumn, args.toColumn);
    }

    // console.timeEnd('transferCoordinate time')

    return data;
};

/**
 * set data.
 */
DataSet.prototype.set = function (data) {
    this._set(data);
    this._trigger('change');
};

/**
 * set data.
 */
DataSet.prototype._set = function (data) {
    this.clear();
    this.add(data);
};

/**
 * clear data.
 */
DataSet.prototype.clear = function (args) {
    this._data = []; // map with data indexed by id
};

/**
 * remove data.
 */
DataSet.prototype.remove = function (args) {};

/**
 * update data.
 */
DataSet.prototype.update = function (cbk, condition) {

    var data = this._data;

    var item = null;
    for (var i = 0; i < data.length; i++) {
        if (condition) {
            var flag = true;
            for (var key in condition) {
                if (data[i][key] != condition[key]) {
                    flag = false;
                }
            }
            if (flag) {
                cbk && cbk(data[i]);
            }
        } else {
            cbk && cbk(data[i]);
        }
    }

    this._dataCache = JSON.parse(JSON.stringify(this._data));

    this._trigger('change');
};

/**
 * transfer coordinate.
 */
DataSet.prototype.transferCoordinate = function (data, transferFn, fromColumn, toColumnName) {

    toColumnName = toColumnName || '_coordinates';
    fromColumn = fromColumn || 'coordinates';

    for (var i = 0; i < data.length; i++) {

        var geometry = data[i].geometry;
        var coordinates = geometry[fromColumn];
        switch (geometry.type) {
            case 'Point':
                geometry[toColumnName] = transferFn(coordinates);
                break;
            case 'LineString':
                var newCoordinates = [];
                for (var j = 0; j < coordinates.length; j++) {
                    newCoordinates.push(transferFn(coordinates[j]));
                }
                geometry[toColumnName] = newCoordinates;
                break;
            case 'Polygon':
                var newCoordinates = getPolygon(coordinates);
                geometry[toColumnName] = newCoordinates;
                break;
            case 'MultiPolygon':
                var newCoordinates = [];
                for (var c = 0; c < coordinates.length; c++) {
                    var polygon = coordinates[c];
                    var polygon = getPolygon(polygon);
                    newCoordinates.push(polygon);
                }

                geometry[toColumnName] = newCoordinates;
                break;
        }
    }

    function getPolygon(coordinates) {
        var newCoordinates = [];
        for (var c = 0; c < coordinates.length; c++) {
            var coordinate = coordinates[c];
            var newcoordinate = [];
            for (var j = 0; j < coordinate.length; j++) {
                newcoordinate.push(transferFn(coordinate[j]));
            }
            newCoordinates.push(newcoordinate);
        }
        return newCoordinates;
    }

    return data;
};

DataSet.prototype.initGeometry = function (transferFn) {

    if (transferFn) {

        this._data.forEach(function (item) {
            item.geometry = transferFn(item);
        });
    } else {

        this._data.forEach(function (item) {
            if (!item.geometry) {
                if (item.lng && item.lat) {
                    item.geometry = {
                        type: 'Point',
                        coordinates: [item.lng, item.lat]
                    };
                } else if (item.city) {
                    var center = cityCenter.getCenterByCityName(item.city);
                    if (center) {
                        item.geometry = {
                            type: 'Point',
                            coordinates: [center.lng, center.lat]
                        };
                    }
                }
            }
        });
    }
};

/**
 * 获取当前列的最大值
 */
DataSet.prototype.getMax = function (columnName) {
    var data = this._data;

    if (!data || data.length <= 0) {
        return;
    }

    var max = parseFloat(data[0][columnName]);

    for (var i = 1; i < data.length; i++) {
        var value = parseFloat(data[i][columnName]);
        if (value > max) {
            max = value;
        }
    }

    return max;
};

/**
 * 获取当前列的总和
 */
DataSet.prototype.getSum = function (columnName) {
    var data = this._data;

    if (!data || data.length <= 0) {
        return;
    }

    var sum = 0;

    for (var i = 0; i < data.length; i++) {
        if (data[i][columnName]) {
            sum += parseFloat(data[i][columnName]);
        }
    }

    return sum;
};

/**
 * 获取当前列的最小值
 */
DataSet.prototype.getMin = function (columnName) {
    var data = this._data;

    if (!data || data.length <= 0) {
        return;
    }

    var min = parseFloat(data[0][columnName]);

    for (var i = 1; i < data.length; i++) {
        var value = parseFloat(data[i][columnName]);
        if (value < min) {
            min = value;
        }
    }

    return min;
};

/**
 * 获取去重的数据
 */
DataSet.prototype.getUnique = function (columnName) {
    var data = this._data;

    if (!data || data.length <= 0) {
        return;
    }

    var maps = {};

    for (var i = 1; i < data.length; i++) {
        maps[data[i][columnName]] = true;
    }

    var data = [];
    for (var key in maps) {
        data.push(key);
    }

    return data;
};

function hex_corner(center, size, i) {
    var angle_deg = 60 * i + 30;
    var angle_rad = Math.PI / 180 * angle_deg;
    return [center.x + size * Math.cos(angle_rad), center.y + size * Math.sin(angle_rad)];
}

function draw(context, x, y, size) {

    for (var j = 0; j < 6; j++) {

        var result = hex_corner({
            x: x,
            y: y
        }, size, j);

        context.lineTo(result[0], result[1]);
    }
}
function Canvas(width, height) {

    var canvas;

    if (typeof document === 'undefined') {

        // var Canvas = require('canvas');
        // canvas = new Canvas(width, height);

    } else {

        var canvas = document.createElement('canvas');

        if (width) {
            canvas.width = width;
        }

        if (height) {
            canvas.height = height;
        }
    }

    return canvas;
}
/**
 * @author kyle / http://nikai.us/
 */

/**
 * Category
 * @param {Object} [options]   Available options:
 *                             {Object} gradient: { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)"}
 */
function Intensity(options) {

    options = options || {};
    this.gradient = options.gradient || {
        0.25: "rgba(0, 0, 255, 1)",
        0.55: "rgba(0, 255, 0, 1)",
        0.85: "rgba(255, 255, 0, 1)",
        1.0: "rgba(255, 0, 0, 1)"
    };
    this.maxSize = options.maxSize || 35;
    this.minSize = options.minSize || 0;
    this.max = options.max || 100;
    this.min = options.min || 0;
    this.initPalette();
}

Intensity.prototype.setMax = function (value) {
    this.max = value || 100;
};

Intensity.prototype.setMin = function (value) {
    this.min = value || 0;
};

Intensity.prototype.setMaxSize = function (maxSize) {
    this.maxSize = maxSize || 35;
};

Intensity.prototype.setMinSize = function (minSize) {
    this.minSize = minSize || 0;
};

Intensity.prototype.initPalette = function () {

    var gradient = this.gradient;

    var canvas = new Canvas(256, 1);

    var paletteCtx = this.paletteCtx = canvas.getContext('2d');

    var lineGradient = paletteCtx.createLinearGradient(0, 0, 256, 1);

    for (var key in gradient) {
        lineGradient.addColorStop(parseFloat(key), gradient[key]);
    }

    paletteCtx.fillStyle = lineGradient;
    paletteCtx.fillRect(0, 0, 256, 1);
};

Intensity.prototype.getColor = function (value) {

    var imageData = this.getImageData(value);

    return "rgba(" + imageData[0] + ", " + imageData[1] + ", " + imageData[2] + ", " + imageData[3] / 256 + ")";
};

Intensity.prototype.getImageData = function (value) {

    var imageData = this.paletteCtx.getImageData(0, 0, 256, 1).data;

    if (value === undefined) {
        return imageData;
    }

    var max = this.max;
    var min = this.min;

    if (value > max) {
        value = max;
    }

    if (value < min) {
        value = min;
    }

    var index = Math.floor((value - min) / (max - min) * (256 - 1)) * 4;

    return [imageData[index], imageData[index + 1], imageData[index + 2], imageData[index + 3]];
};

/**
 * @param Number value 
 * @param Number max of value
 * @param Number max of size
 * @param Object other options
 */
Intensity.prototype.getSize = function (value) {

    var size = 0;
    var max = this.max;
    var min = this.min;
    var maxSize = this.maxSize;
    var minSize = this.minSize;

    if (value > max) {
        value = max;
    }

    if (value < min) {
        value = min;
    }

    size = minSize + (value - min) / (max - min) * (maxSize - minSize);

    return size;
};

Intensity.prototype.getLegend = function (options) {
    var gradient = this.gradient;

    var width = options.width || 20;
    var height = options.height || 180;

    var canvas = new Canvas(width, height);

    var paletteCtx = canvas.getContext('2d');

    var lineGradient = paletteCtx.createLinearGradient(0, height, 0, 0);

    for (var key in gradient) {
        lineGradient.addColorStop(parseFloat(key), gradient[key]);
    }

    paletteCtx.fillStyle = lineGradient;
    paletteCtx.fillRect(0, 0, width, height);

    return canvas;
};
/**
 * @author kyle / http://nikai.us/
 */
var drawGrid = {
    draw: function draw(context, dataSet, options) {
        console.log(dataSet);
        // context.save();
        var data = dataSet instanceof DataSet ? dataSet.get() : dataSet;
        console.log(data);
        var grids = {};
        var size = options._size || options.size || 50;
        var offset = options.offset || {
            x: 0,
            y: 0
        };
        for (var i = 0; i < data.length; i++) {
            var coordinates = data[i].geometry._coordinates || data[i].geometry.coordinates;
            var gridKey = Math.floor((coordinates[0] - offset.x) / size) + "," + Math.floor((coordinates[1] - offset.y) / size);
            if (!grids[gridKey]) {
                grids[gridKey] = 0;
            }
            grids[gridKey] += ~~(data[i].count || 1);
        }
        var intensity = new Intensity({
            max: options.max || 100,
            gradient: options.gradient
        });
        for (var gridKey in grids) {
            gridKey = gridKey.split(",");
            context.beginPath();
            context.rect(gridKey[0] * size + .5 + offset.x, gridKey[1] * size + .5 + offset.y, size, size);
            context.fillStyle = intensity.getColor(grids[gridKey]);
            context.fill();
            if (options.strokeStyle && options.lineWidth) {
                context.stroke();
            }
        }
        if (options.label && options.label.show !== false) {
            context.fillStyle = options.label.fillStyle || 'white';
            if (options.label.font) {
                context.font = options.label.font;
            }
            if (options.label.shadowColor) {
                context.shadowColor = options.label.shadowColor;
            }
            if (options.label.shadowBlur) {
                context.shadowBlur = options.label.shadowBlur;
            }
            for (var gridKey in grids) {
                gridKey = gridKey.split(",");
                var text = grids[gridKey];
                var textWidth = context.measureText(text).width;
                context.fillText(text, gridKey[0] * size + .5 + offset.x + size / 2 - textWidth / 2, gridKey[1] * size + .5 + offset.y + size / 2 + 5);
            }
        }
        context.restore();
    }
};