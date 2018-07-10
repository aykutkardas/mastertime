var Mastertime = /** @class */ (function () {
    function Mastertime() {
        var _this = this;
        var _lastRoomIndex = -1;
        var _storage = [];
        var _regexStorage = {
            fullDateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})\ ([\d]{2}\:[\d]{2}\:[\d]{2})/,
            dateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})/,
            timeRegex: /([\d]{2}\:[\d]{2}\:[\d]{2})/
        };
        this._getRegex = function (key) {
            return key ? _regexStorage[key] : _regexStorage;
        };
        this._getTimeBase = function () { return _storage; };
        this._createTimeBaseRoom = function () {
            var index = _storage.length;
            _storage[index] = [];
            return index;
        };
        this._putTimeBaseRoom = function (index, obj) {
            _storage[index].push(obj);
        };
        this._getLastRoomIndex = function () { return _lastRoomIndex; };
        this._setLastRoomIndex = function (index) {
            _lastRoomIndex = index;
        };
        this._resetLastRoomIndex = function () {
            _lastRoomIndex = -1;
        };
        this._attrToProp = function (str) {
            str = str.substr(2, str.length);
            return (str = str[0].toLowerCase() + str.slice(1, str.length));
        };
        this._wayDetector = function (obj) {
            if ('string' === typeof (obj.start) && !isNaN(parseInt(obj.start)))
                obj.start = parseInt(obj.start);
            if ('string' === typeof (obj.end) && !isNaN(parseInt(obj.end)))
                obj.end = parseInt(obj.end);
            if (Number.isInteger(obj.start)) {
                if (Number.isInteger(obj.end)) {
                    if (obj.start > obj.end)
                        obj.way = 'down';
                    else
                        obj.way = 'up';
                }
                else {
                    if (!obj.way) {
                        obj.end = obj.start > 0 ? 0 : Infinity;
                        obj.way = obj.start > 0 ? 'down' : 'up';
                    }
                }
            }
            else if (obj.date) {
                var diff = _this._dateDiff(obj.date);
                diff = (diff < 0) ? -diff : diff;
                if (_this._dateDiff(obj.date) < 0)
                    obj.way = 'up';
                else
                    obj.way = 'down';
                obj.start = Math.floor(diff);
            }
            return obj;
        };
        this._leftPad = function (obj, option) {
            if (!option || !option.leftPad)
                return obj;
            var selectedOption;
            if (option.leftPad === true)
                selectedOption = ["Y", "M", "W", "D", "h", "m", "s"];
            else
                selectedOption = option.leftPad.split(":");
            var timeType, newObj = {};
            for (timeType in obj) {
                if (selectedOption.indexOf(timeType) > -1)
                    newObj[timeType] = parseInt(obj[timeType]) < 10 ? "0" + obj[timeType] : obj[timeType];
            }
            Object.assign(obj, newObj);
            return obj;
        };
        this._dateComplete = function (date) {
            var fullDateRegex;
            fullDateRegex = _this._getRegex('fullDateRegex').exec(date);
            if (fullDateRegex)
                return fullDateRegex[0];
            var dateRegex;
            dateRegex = _this._getRegex('dateRegex').exec(date);
            if (dateRegex)
                return dateRegex[0] + ' 00:00:00';
            var timeRegex;
            timeRegex = _this._getRegex('timeRegex').exec(date);
            if (timeRegex)
                return new Date().toLocaleDateString() + ' ' + timeRegex[0];
            return new Date().toLocaleString();
        };
        this._dateFormat = function (date) {
            if (!_this._getRegex("fullDateRegex").exec(date))
                return date;
            var months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
            ];
            var _a = date.split(" "), dateStr = _a[0], timeStr = _a[1];
            var _b = dateStr.split("."), day = _b[0], month = _b[1], year = _b[2];
            month = months[Number(month) - 1];
            return month + " " + day + ", " + year + " " + timeStr;
        };
        this._dateDiff = function (date) {
            if (!date)
                return 0;
            var dateMs, nowDateMs;
            date = _this._dateFormat(_this._dateComplete(date));
            dateMs = new Date(date).getTime();
            nowDateMs = new Date().getTime();
            return (dateMs - nowDateMs) / 1000;
        };
        this._templateApply = function (template, timeObj, option) {
            var defaultTemplate = '{h}:{m}:{s}';
            if ('string' === typeof (template) && template.trim().length < 1)
                template = defaultTemplate;
            else if (!template)
                template = defaultTemplate;
            var bracketInner = '\\/(\\[[^\\!&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])';
            var bracketPass = '[^\\/&^\\[]{0}\\[([^\\&^\\[&^\\]]*)\\{(.)\\}([^\\[]*)[^\\/]\\]';
            if (option && option.leftPad)
                timeObj = _this._leftPad(timeObj, option);
            var timeType;
            var bracketPassRegex;
            var bracketInnerRegex;
            var bracketInnerRegexMatch;
            var bracketPassRegexMatch;
            for (timeType in timeObj) {
                bracketInnerRegex = new RegExp(bracketInner.replace('.', timeType), 'gmi');
                bracketInnerRegexMatch = bracketInnerRegex.exec(template);
                if (bracketInnerRegexMatch) {
                    if (parseInt(timeObj[timeType]) === 0)
                        template = template.replace(bracketInnerRegex, '');
                    else
                        template = template.replace(bracketInnerRegex, "$1" + timeObj[timeType] + "$3");
                    continue;
                }
                bracketPassRegex = new RegExp(bracketPass.replace('.', timeType), 'gmi');
                bracketPassRegexMatch = bracketPassRegex.exec(template);
                if (bracketPassRegexMatch) {
                    template = template.replace(bracketPassRegex, "$1" + timeObj[timeType] + "$3$4");
                    continue;
                }
                template = template.replace("{" + timeType + "}", timeObj[timeType]);
            }
            return template;
        };
        this._timeFormat = function (second, option) {
            if ('number' !== typeof (second))
                second = parseInt(second);
            if (isNaN(second))
                second = 0;
            var ruler = {
                Y: 31556926,
                M: 2629743.83,
                W: 604800,
                D: 86400,
                h: 3600,
                m: 60,
                s: 1
            };
            var selectedFormat;
            if (!option)
                selectedFormat = ['Y', 'M', 'W', 'D', 'h', 'm', 's'];
            else
                selectedFormat = option.timeFormat.split(':');
            var timeType;
            var timerObj = {};
            for (timeType in ruler) {
                if (selectedFormat.indexOf(timeType) > -1) {
                    timerObj[timeType] = Math.floor(second / ruler[timeType]).toString();
                    second %= ruler[timeType];
                }
            }
            return timerObj;
        };
        this._machine = function (obj) {
            if ('number' !== typeof (obj.start))
                clearInterval(obj.process);
            if (typeof obj.start !== "number" && !obj.date)
                clearInterval(obj.process);
            var config = {
                timeFormat: obj.date ? 'Y:M:W:D:h:m:s' : 'h:m:s',
                leftPad: obj.date ? 'h:m:s' : false
            };
            obj.config = Object.assign({}, config, obj.config);
            if (obj.onInterval)
                obj.onInterval(obj);
            if (obj.target) {
                var target = obj.target;
                if (!obj.template) {
                    //@ts-ignore
                    obj.template = target.tagName === 'INPUT' ? target.value : target.innerHTML;
                }
                var content = _this._templateApply(obj.template, _this._timeFormat(obj.start, obj.config), obj.config);
                if (target.tagName === 'INPUT') {
                    //@ts-ignore
                    if (target.value !== content)
                        target.value = content;
                }
                else {
                    if (target.innerHTML !== content)
                        target.innerHTML = content;
                }
            }
            if (obj.start === obj.end) {
                clearInterval(obj.process);
                if (obj.onEnd)
                    obj.onEnd(obj);
                return true;
            }
            if (obj.way === 'up')
                obj.start++;
            else
                obj.start--;
        };
    }
    Mastertime.prototype.add = function (timerObj) {
        if (!timerObj)
            return this;
        var roomIndex = this._createTimeBaseRoom();
        var timerObjList;
        if (!Array.isArray(timerObj))
            timerObjList = [timerObj];
        else
            timerObjList = timerObj;
        var i = 0;
        var len = timerObjList.length;
        for (; i < len; i++) {
            var activeObj = this._wayDetector(timerObjList[i]);
            if (!activeObj.start && !activeObj.date)
                continue;
            if (activeObj.target) {
                var elements = document.querySelectorAll(activeObj.target);
                var j = 0;
                var elementSize = elements.length;
                for (; j < elementSize; j++) {
                    var activeElement = elements[j];
                    var uniqueTimerObj = Object.assign({}, activeObj, {
                        target: activeElement,
                        template: activeObj.template
                    });
                    this._putTimeBaseRoom(roomIndex, uniqueTimerObj);
                }
            }
            else {
                this._putTimeBaseRoom(roomIndex, Object.assign({}, activeObj));
            }
            this._setLastRoomIndex(roomIndex);
            return this;
        }
    };
    Mastertime.prototype.build = function (selector, config) {
        if (!selector)
            return this;
        var elements;
        if ('string' === typeof (selector))
            elements = document.querySelectorAll(selector);
        else if (selector.tagName)
            elements = [selector];
        else if (selector.length)
            elements = selector;
        else
            return this;
        if (!elements.length)
            return this;
        var roomIndex = this._createTimeBaseRoom();
        var attrList = [
            "mtDate",
            "mtStart",
            "mtEnd",
            "mtOnStart",
            "mtOnInterval",
            "mtOnEnd",
            "mtName",
            "mtTemplate",
            "mtWay",
            "mtAgo"
        ];
        var i = 0;
        var len = elements.length;
        for (; i < len; i++) {
            var activeElement = elements[i];
            var rawTimerObj = {};
            var j = 0;
            var attrListLen = attrList.length;
            for (; j < attrListLen; j++) {
                var attrValue = activeElement.getAttribute(attrList[j]);
                if (attrValue) {
                    activeElement.removeAttribute(attrList[j]);
                    var attrKey = this._attrToProp(attrList[j]);
                    rawTimerObj[attrKey] = attrValue;
                }
            }
            if (!rawTimerObj.start && !rawTimerObj.date)
                continue;
            var events = {};
            if (rawTimerObj.onStart && 'string' === typeof (rawTimerObj.onStart))
                events.onStart = new Function('event', rawTimerObj.onStart);
            if (rawTimerObj.onInterval && 'string' === typeof (rawTimerObj.onInterval))
                events.onInterval = new Function('event', rawTimerObj.onInterval);
            if (rawTimerObj.onEnd && 'string' === typeof (rawTimerObj.onEnd))
                events.onEnd = new Function('event', rawTimerObj.onEnd);
            var timerObj = Object.assign({}, this._wayDetector(rawTimerObj), events, {
                target: activeElement,
                config: config
            });
            this._putTimeBaseRoom(roomIndex, timerObj);
        }
        this._setLastRoomIndex(roomIndex);
        return this;
    };
    Mastertime.prototype.run = function () {
        var _this = this;
        var roomIndex = this._getLastRoomIndex();
        if (roomIndex === -1)
            return false;
        var timerObjList = this._getTimeBase()[roomIndex];
        var i = 0;
        var len = timerObjList.length;
        var _loop_1 = function () {
            var activeObj = timerObjList[i];
            if (activeObj.onStart)
                activeObj.onStart(activeObj);
            this_1._machine(activeObj);
            activeObj.process = setInterval(function () { return _this._machine(activeObj); }, 1000);
        };
        var this_1 = this;
        for (; i < len; i++) {
            _loop_1();
        }
        this._resetLastRoomIndex();
    };
    Mastertime.prototype.destroy = function (name) {
        if (!name || 'string' !== typeof (name))
            return false;
        var _storage = this._getTimeBase();
        if (!_storage || !Array.isArray(_storage) || !_storage.length)
            return false;
        var i = 0;
        var len = _storage.length;
        for (; i < len; i++) {
            var j = 0;
            var roomSize = _storage[i].length;
            var timerObjList = _storage[i];
            if (!timerObjList || !roomSize)
                continue;
            for (; j < roomSize; j++) {
                var activeObj = timerObjList[j];
                if (activeObj.hasOwnProperty('name') && name === activeObj.name)
                    clearInterval(activeObj.process);
            }
        }
    };
    return Mastertime;
}());
