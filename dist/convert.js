var TimeConvert = /** @class */ (function () {
    function TimeConvert() {
    }
    TimeConvert.prototype.msToSecond = function (ms) {
        return Math.floor(ms / 1000);
    };
    TimeConvert.prototype.msToMinute = function (ms) {
        return Math.floor(ms / 1000 / 60);
    };
    TimeConvert.prototype.msToHour = function (ms) {
        return Math.floor(ms / 1000 / 60 / 60);
    };
    TimeConvert.prototype.msToDay = function (ms) {
        return Math.floor(ms / 1000 / 60 / 60 / 24);
    };
    TimeConvert.prototype.msToWeek = function (ms) {
        return Math.floor(ms / 1000 / 60 / 60 / 24 / 7);
    };
    TimeConvert.prototype.msToMonth = function (ms) {
        return Math.floor(ms / 1000 / 60 / 60 / 24 / 7 / 4);
    };
    TimeConvert.prototype.msToYear = function (ms) {
        return Math.floor(ms / 1000 / 60 / 60 / 24 / 7 / 4 / 12);
    };
    return TimeConvert;
}());
