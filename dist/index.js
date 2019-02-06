"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var MasterTime = (function () {
    function MasterTime() {
        this.timeStorage = new MasterTimeStorage();
    }
    MasterTime.prototype.create = function (item) {
        if (this._checkValue(item)) {
            return false;
        }
        if (!Array.isArray(item)) {
            item = [item];
        }
        var newItems = this._enchantment(item);
        var roomIndex = this.timeStorage.createRoom();
        this.timeStorage.setItemsToRoom(roomIndex, newItems);
    };
    MasterTime.prototype.run = function (roomIndex) {
        var _this = this;
        if (!roomIndex) {
            roomIndex = this.timeStorage.lastIndex();
        }
        if (roomIndex < 0) {
            return false;
        }
        var payload = this.timeStorage.storage[roomIndex];
        if (!Array.isArray(payload)) {
            return false;
        }
        payload.forEach(function (item, index) {
            item.onStart && item.onStart(item);
            _this._mechanic(item);
            item.process = setInterval(function () { return _this._mechanic(item); }, 1000);
        });
    };
    MasterTime.prototype._mechanic = function (item) {
        item.onInterval && item.onInterval(item);
        var formattedTime = this._timeFormat(item.time, item.config);
        var templatedValue = this._templateApply(item.template, formattedTime, item.config);
        if (templatedValue) {
            item.value = templatedValue;
        }
        if (item.time === item.end) {
            clearInterval(item.process);
            item.onEnd && item.onEnd(item);
            return;
        }
        if (!item.direction) {
            if (item.start > item.end) {
                item.direction = "down";
            }
            else {
                item.direction = "up";
            }
        }
        if (item.direction === "up") {
            item.time++;
            return;
        }
        item.time--;
    };
    MasterTime.prototype._enchantment = function (items) {
        var enchantedItems = items.map(function (item) {
            var enchantedItem = __assign({ start: 0, end: Infinity, time: item.start || 0, value: "", process: 0, direction: "", template: "", config: {} }, item);
            return enchantedItem;
        });
        return enchantedItems;
    };
    MasterTime.prototype._checkValue = function (item) {
        var isObject = toString.call(item) !== "[Object object]";
        var isArray = Array.isArray(item);
        if (!item || (!isObject && !isArray)) {
            return false;
        }
    };
    MasterTime.prototype._templateApply = function (template, payload, option) {
        if (!payload) {
            return false;
        }
        if (typeof template !== "string" || !template.trim.length) {
            template = "{h}:{m}:{s}";
        }
        if (option && option.leftPad) {
            payload = this._leftPad(payload);
        }
        var parserRegex = {
            inner: "\\/(\\[[^\\!&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])",
            pass: "[^\\/&^\\[]{0}\\[([^\\&^\\[&^\\]]*)\\{(.)\\}([^\\[]*)[^\\/]\\]"
        };
        Object.keys(payload).forEach(function (key) {
            var parseInner = new RegExp(parserRegex.inner.replace(".", key), "gmi");
            if (parseInner.exec(template)) {
                if (parseInt(payload[key]) === 0) {
                    template = template.replace(parseInner, "");
                }
                else {
                    template = template.replace(parseInner, "$1" + payload[key] + "$3");
                }
                return;
            }
            var parsePass = new RegExp(parserRegex.pass.replace(".", key), "gmi");
            if (parsePass.exec(template)) {
                template = template.replace(parsePass, "$1" + payload[key] + "$3");
                return;
            }
            template = template.replace("{" + key + "}", payload[key]);
        });
        return template;
    };
    MasterTime.prototype._timeFormat = function (second, option) {
        if (typeof second !== "number" || isNaN(second)) {
            second = 0;
        }
        var timeRuler = {
            Y: 31556926,
            M: 2629743.83,
            W: 604800,
            D: 86400,
            h: 3600,
            m: 60,
            s: 1
        };
        var selectedFormat = ["Y", "M", "W", "D", "h", "m", "s"];
        if (option && option.timeFormat) {
            selectedFormat = option.timeFormat.split(":");
        }
        var formattedTime = {};
        Object.keys(timeRuler).forEach(function (activeTime) {
            if (selectedFormat.includes(activeTime)) {
                formattedTime[activeTime] = Math.floor(second / timeRuler[activeTime]).toString();
                second %= timeRuler[activeTime];
            }
        });
        return formattedTime;
    };
    MasterTime.prototype._leftPad = function (payload) {
        var selectedTimeOptions = ["Y", "M", "W", "D", "h", "m", "s"];
        var newPayload = {};
        Object.keys(payload).forEach(function (optionKey) {
            if (selectedTimeOptions.includes(optionKey)) {
                var value = payload[optionKey];
                if (parseInt(payload[optionKey]) < 10) {
                    value = "0" + payload[optionKey];
                }
                newPayload[optionKey] = value;
            }
        });
        return __assign({}, payload, newPayload);
    };
    return MasterTime;
}());
var MasterTimeStorage = (function () {
    function MasterTimeStorage() {
        this.storage = [];
    }
    MasterTimeStorage.prototype.lastIndex = function () {
        return this.storage.length - 1;
    };
    MasterTimeStorage.prototype.setItemsToRoom = function (index, items) {
        this.storage[index] = items;
    };
    MasterTimeStorage.prototype.createRoom = function () {
        var index = this.lastIndex() + 1;
        this.storage[index] = [];
        return index;
    };
    MasterTimeStorage.prototype.putItemToRoom = function (index, object) {
        this.storage[index].push(object);
    };
    return MasterTimeStorage;
}());
exports.default = new MasterTime();
