"use strict";
exports.__esModule = true;
var MasterTime = /** @class */ (function () {
    function MasterTime() {
        this.regexStore = {
            fullDateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})\ ([\d]{2}\:[\d]{2}\:[\d]{2})/,
            dateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})/,
            timeRegex: /([\d]{2}\:[\d]{2}\:[\d]{2})/
        };
        this.storage = [];
        this.lastRoomIndex = -1;
    }
    MasterTime.prototype.createTimeBaseRoom = function () {
        var index = this.storage.length;
        this.storage[index] = [];
        this.lastRoomIndex = index;
        return index;
    };
    MasterTime.prototype.putTimeBaseRoom = function (roomIndex, payload) {
        var storage = this.storage;
        if (storage[roomIndex] && payload) {
            this.storage[roomIndex].push(payload);
        }
    };
    MasterTime.prototype.build = function (payload) {
        var _this = this;
        if (!payload) {
            return this;
        }
        if (Array.isArray(payload) && !payload.length) {
            return this;
        }
        if (!Array.isArray(payload)) {
            payload = [payload];
        }
        var activeRoomIndex = this.createTimeBaseRoom();
        payload.forEach(function (item) {
            _this.putTimeBaseRoom(activeRoomIndex, item);
        });
        return this;
    };
    MasterTime.prototype.run = function (roomIndex) {
        var _this = this;
        if (!roomIndex) {
            roomIndex = this.lastRoomIndex;
        }
        if (roomIndex === -1) {
            return false;
        }
        var payload = this.storage[roomIndex];
        payload.forEach(function (item, index) {
            if (item.onStart) {
                item.onStart(item);
            }
            _this.__machine__(item);
            item.process = setInterval(function () { return _this.__machine__(item); }, 1000);
        });
    };
    MasterTime.prototype.__machine__ = function (payload) {
        if (typeof payload.start !== "number") {
            clearInterval(payload.process);
        }
        if (typeof payload.start !== "number" && !payload.date) {
            clearInterval(payload.process);
        }
        if (payload.onInterval) {
            payload.onInterval(payload);
        }
        var content = this.__templateApply__(payload.template, this._timeFormat(payload.start, payload.config), payload.config);
        payload.value = content || "";
        if (payload.start === payload.end) {
            clearInterval(payload.process);
            if (payload.onEnd) {
                payload.onEnd(payload);
                return;
            }
        }
        if (payload.way === "up") {
            payload.start++;
        }
        else {
            payload.start--;
        }
        return;
    };
    MasterTime.prototype._leftPad = function (payload) {
        var selectedOption = ["Y", "M", "W", "D", "h", "m", "s"];
        var timeType, newPayload = {};
        for (timeType in payload) {
            if (selectedOption.indexOf(timeType) > -1)
                newPayload[timeType] =
                    parseInt(payload[timeType]) < 10
                        ? "0" + payload[timeType]
                        : payload[timeType];
        }
        Object.assign(payload, newPayload);
        return payload;
    };
    MasterTime.prototype._timeFormat = function (second, option) {
        if ("number" !== typeof second)
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
        if (!option || !option.timeFormat)
            selectedFormat = ["Y", "M", "W", "D", "h", "m", "s"];
        else
            selectedFormat = option.timeFormat.split(":");
        var timeType;
        var payload = {};
        for (timeType in ruler) {
            if (selectedFormat.indexOf(timeType) > -1) {
                payload[timeType] = Math.floor(second / ruler[timeType]).toString();
                second %= ruler[timeType];
            }
        }
        return payload;
    };
    MasterTime.prototype.__templateApply__ = function (template, payload, option) {
        var defaultTemplate = "{h}:{m}:{s}";
        if (typeof template !== "string" || template.trim().length < 1) {
            template = defaultTemplate;
        }
        var bracketInner = "\\/(\\[[^\\!&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])";
        var bracketPass = "[^\\/&^\\[]{0}\\[([^\\&^\\[&^\\]]*)\\{(.)\\}([^\\[]*)[^\\/]\\]";
        if (option && option.leftPad) {
            payload = this._leftPad(payload);
        }
        var timeType;
        var bracketPassRegex;
        var bracketInnerRegex;
        var bracketInnerRegexMatch;
        var bracketPassRegexMatch;
        for (timeType in payload) {
            bracketInnerRegex = new RegExp(bracketInner.replace(".", timeType), "gmi");
            bracketInnerRegexMatch = bracketInnerRegex.exec(template);
            if (bracketInnerRegexMatch) {
                if (parseInt(payload[timeType]) === 0)
                    template = template.replace(bracketInnerRegex, "");
                else
                    template = template.replace(bracketInnerRegex, "$1" + payload[timeType] + "$3");
                continue;
            }
            bracketPassRegex = new RegExp(bracketPass.replace(".", timeType), "gmi");
            bracketPassRegexMatch = bracketPassRegex.exec(template);
            if (bracketPassRegexMatch) {
                template = template.replace(bracketPassRegex, "$1" + payload[timeType] + "$3$4");
                continue;
            }
            template = template.replace("{" + timeType + "}", payload[timeType]);
        }
        return template;
    };
    return MasterTime;
}());
exports["default"] = MasterTime;
