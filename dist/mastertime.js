var Mastertime = /** @class */ (function () {
    function Mastertime() {
        var _storage = [];
        var _lastRoomIndex = -1;
        this._getTimeBase = function () { return _storage; };
        // Create timebase room and return room index.
        this._createTimeBaseRoom = function () {
            var index = _storage.length;
            _storage[index] = [];
            return index;
        };
        this._putTimeBaseRoom = function (index, obj) {
            _storage[index].push(obj);
        };
        this._getLastRoomIndex = function () { return _lastRoomIndex; };
        this._setLastRoomIndex = function (index) { _lastRoomIndex = index; };
        this._resetLastRoomIndex = function () { _lastRoomIndex = -1; };
        this._wayDetector = function (obj) {
            if (obj.start) {
                if (obj.end) {
                    if (obj.start > obj.end)
                        obj.way = 'down';
                    else
                        obj.way = 'up';
                }
                else {
                    if (!obj.way) {
                        obj.end = (obj.start > 0) ? 0 : Infinity;
                        obj.way = (obj.start > 0) ? 'down' : 'up';
                    }
                }
            }
            else if (obj.end) {
                obj.start = 0;
                obj.way = (obj.end > 0) ? 'up' : 'down';
            }
            return obj;
        };
    }
    Mastertime.prototype.add = function (obj) {
        if (!obj)
            return this;
        var roomIndex = this._createTimeBaseRoom();
        var objs;
        if (!Array.isArray(obj))
            objs = [obj];
        else
            objs = obj;
        var i = 0;
        var len = objs.length;
        for (; i < len; i++) {
            var activeObj = this._wayDetector(objs[i]);
            if (!activeObj.start && !activeObj.end && !activeObj.way)
                continue;
            if (activeObj.target) {
                var elems = document.querySelectorAll(objs[i].target);
                var j = 0;
                var elemLen = elems.length;
                for (; j < elemLen; j++) {
                    activeObj.target = elems[j];
                    this._putTimeBaseRoom(roomIndex, activeObj);
                }
            }
            else {
                this._putTimeBaseRoom(roomIndex, activeObj);
            }
        }
        this._setLastRoomIndex(roomIndex);
        return this;
    };
    Mastertime.prototype.run = function () {
        var roomIndex = this._getLastRoomIndex();
        var objs = this._getTimeBase()[roomIndex];
        var i = 0;
        var len = objs.length;
        for (; i < len; i++) {
            console.log(objs, i, objs[i], objs[i].start);
            setInterval(function () { console.log(objs[i]); /*  objs[i].start++; (<HTMLElement>objs[i].target).innerHTML = (objs[i].start).toString(); */ }, 1000);
        }
        this._resetLastRoomIndex();
    };
    return Mastertime;
}());
