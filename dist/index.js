;
var MT = /** @class */ (function () {
    function MT(x) {
        this.regexStorage = {
            fullDateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})\ ([\d]{2}\:[\d]{2}\:[\d]{2})/,
            dateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})/,
            timeRegex: /([\d]{2}\:[\d]{2}\:[\d]{2})/
        };
    }
    MT.prototype.msToSecond = function (ms) {
        return Math.floor(ms / 1000);
    };
    MT.prototype.msToMinute = function (ms) {
        return Math.floor(ms / 1000 / 60);
    };
    MT.prototype.msToHour = function (ms) {
        return Math.floor(ms / 1000 / 60 / 60);
    };
    MT.prototype.msToDay = function (ms) {
        return Math.floor(ms / 1000 / 60 / 60 / 24);
    };
    MT.prototype.msToWeek = function (ms) {
        return Math.floor(ms / 1000 / 60 / 60 / 24 / 7);
    };
    MT.prototype.msToMonth = function (ms) {
        return Math.floor(ms / 1000 / 60 / 60 / 24 / 7 / 4);
    };
    MT.prototype.msToYear = function (ms) {
        return Math.floor(ms / 1000 / 60 / 60 / 24 / 7 / 4 / 12);
    };
    MT.prototype.dateCompletion = function (inputDate) {
        var fullDateRegexResult = this.regexStorage.fullDateRegex.exec(inputDate);
        if (fullDateRegexResult)
            return fullDateRegexResult[0];
        var dateRegexResult = this.regexStorage.dateRegex.exec(inputDate);
        if (dateRegexResult)
            return dateRegexResult[0] + ' 00:00:00';
        var timeRegexResult = this.regexStorage.timeRegex.exec(inputDate);
        if (timeRegexResult)
            return (new Date()).toLocaleDateString() + ' ' + timeRegexResult[0];
        return false;
    };
    MT.prototype.dateFormatTransform = function (inputDate) {
        if (!this.regexStorage.fullDateRegex.exec(inputDate))
            return false;
        var month = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];
        var date, explodeDate = inputDate.split(' '), activeMonth;
        if (!explodeDate[1])
            explodeDate[1] = '';
        date = explodeDate[0].split('.');
        activeMonth = month[Number(date[1]) - 1];
        return activeMonth + " " + date[0] + ", " + date[2] + " " + explodeDate[1];
    };
    MT.prototype.getTimeDiff = function (firstTime, secondTime) {
        var firstTimeMs, secondTimeMs;
        if (!firstTime)
            return false;
        firstTimeMs = (new Date(firstTime)).getTime();
        if (!secondTime)
            secondTimeMs = (new Date()).getTime();
        else
            secondTimeMs = (new Date(secondTime)).getTime();
        return firstTimeMs - secondTimeMs;
    };
    MT.prototype.msToCustom = function (ms, option) {
        if (!ms)
            return false;
        var oneYearMs = 31556926000, oneMonthMs = 2629743830, oneWeekMs = 604800000, oneDayMs = 86400000, oneHourMs = 3600000, oneMinuteMs = 60000, oneSecondMs = 1000;
        var ruler = {
            'Y': oneYearMs,
            'M': oneMonthMs,
            'W': oneWeekMs,
            'D': oneDayMs,
            'h': oneHourMs,
            'm': oneMinuteMs,
            's': oneSecondMs,
            'u': 1
        };
        var selectedFormat;
        if (!option)
            selectedFormat = ['Y', 'M', 'W', 'D', 'h', 'm', 's', 'u'];
        else
            selectedFormat = option.split(':');
        var i;
        var output = {};
        for (i in ruler) {
            if (i === 'u' && selectedFormat.indexOf(i) > -1) {
                output[i] = Math.floor(ms);
                continue;
            }
            if (selectedFormat.indexOf(i) > -1) {
                output[i] = Math.floor(ms / ruler[i]);
                ms %= ruler[i];
            }
        }
        return output;
    };
    MT.prototype.dateIsGreater = function (firstTime, secondTime) {
        if (!firstTime || !secondTime)
            return false;
        var firstTimeTransform = this.dateFormatTransform(firstTime);
        if (typeof firstTimeTransform !== 'string')
            return false;
        var secondTimeTransform = this.dateFormatTransform(secondTime);
        if (typeof secondTimeTransform !== 'string')
            return false;
        var firstTimeMs = (new Date(firstTimeTransform)).getTime();
        var secondTimeMs = (new Date(secondTimeTransform)).getTime();
        if (firstTime > secondTime)
            return true;
        return false;
    };
    MT.prototype.dateIsLess = function (firstTime, secondTime) {
        if (!firstTime || !secondTime)
            return false;
        var firstTimeTransform = this.dateFormatTransform(firstTime);
        if (typeof firstTimeTransform !== 'string')
            return false;
        var secondTimeTransform = this.dateFormatTransform(secondTime);
        if (typeof secondTimeTransform !== 'string')
            return false;
        var firstTimeMs = (new Date(firstTimeTransform)).getTime();
        var secondTimeMs = (new Date(secondTimeTransform)).getTime();
        if (firstTime < secondTime)
            return true;
        return false;
    };
    MT.prototype.dateIsEqual = function (firstTime, secondTime) {
        if (!firstTime || !secondTime)
            return false;
        var firstTimeTransform = this.dateFormatTransform(firstTime);
        if (typeof firstTimeTransform !== 'string')
            return false;
        var secondTimeTransform = this.dateFormatTransform(secondTime);
        if (typeof secondTimeTransform !== 'string')
            return false;
        var firstTimeMs = (new Date(firstTimeTransform)).getTime();
        var secondTimeMs = (new Date(secondTimeTransform)).getTime();
        if (firstTime === secondTime)
            return true;
        return false;
    };
    MT.prototype.leftPad = function (timeObj, option) {
        if (!option)
            return timeObj;
        var selectedOption;
        if (option === true)
            selectedOption = ['Y', 'M', 'W', 'D', 'h', 'm', 's', 'u'];
        else
            selectedOption = option.split(':');
        var i, newTimeObj = {};
        for (i in timeObj) {
            if (selectedOption.indexOf(i) > -1)
                newTimeObj[i] = parseInt(timeObj[i]) < 10 ? '0' + timeObj[i] : timeObj[i];
        }
        Object.assign(timeObj, newTimeObj);
        return timeObj;
    };
    MT.prototype.formatApply = function (format, timeObj, option) {
        if (!format)
            return false;
        var bracket = '\\/(\\[[^\\!&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])';
        var bracketDbl = '\\/\\[(\\[[^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])\\]';
        var bracketInner = '[^\\/&^\\[]{0}\\[([^\\&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\/]*)\\]';
        if (option && option.leftPad)
            timeObj = this.leftPad(timeObj, option.leftPad);
        var i, bracketRegex, bracketDblRegex, bracketInnerRegex, bracketRegexMatch, bracketDblRegexMatch, bracketInnerRegexMatch;
        for (i in timeObj) {
            bracketInnerRegex = new RegExp(bracketInner.replace('.', i));
            bracketInnerRegexMatch = bracketInnerRegex.exec(format);
            if (bracketInnerRegexMatch) {
                if (!parseInt(timeObj[i]))
                    format = format.replace(bracketInnerRegex, '');
                else
                    format = format.replace(bracketInnerRegex, "$1" + timeObj[i] + "$3");
                continue;
            }
            bracketRegex = new RegExp(bracket.replace('.', i));
            bracketRegexMatch = bracketRegex.exec(format);
            if (bracketRegexMatch) {
                if (!parseInt(timeObj[i]))
                    format = format.replace(bracketRegex, '');
                else
                    format = format.replace(bracketRegex, "$1" + timeObj[i] + "$3$4");
                continue;
            }
            bracketDblRegex = new RegExp(bracketDbl.replace(".", i));
            bracketDblRegexMatch = bracketDblRegex.exec(format);
            if (bracketDblRegexMatch) {
                format = format.replace(bracketDblRegex, "$1" + timeObj[i] + "$3$4");
                continue;
            }
            format = format.replace('{' + i + '}', timeObj[i]);
        }
        return format;
    };
    MT.prototype.htmlSelect = function (el) {
        if (typeof el !== 'object')
            return false;
        var htmlObj = {
            'mtStartDate': null,
            'mtEndDate': null,
            'mtStart': null,
            'mtEnd': null,
            'mtOnStart': null,
            'mtOnInterval': null,
            'mtOnEnd': null,
            'mtName': null,
            'mtTemplate': null,
            'mtWay': null,
            'mtAgo': null
        };
        var i;
        for (i in htmlObj)
            htmlObj[i] = el.getAttribute(i);
        return htmlObj;
    };
    MT.prototype.htmlSelectFormatter = function (htmlObj) {
        var output = {
            'mtStartDate': null,
            'mtEndDate': null,
            'mtStart': null,
            'mtEnd': null,
            'mtOnStart': null,
            'mtOnInterval': null,
            'mtOnEnd': null,
            'mtName': null,
            'mtTemplate': null,
            'mtWay': null,
            'mtAgo': null
        };
        output.mtStartDate = htmlObj.mtStartDate;
        output.mtEndDate = htmlObj.mtEndDate;
        output.mtName = htmlObj.mtName;
        output.mtTemplate = htmlObj.mtTemplate;
        output.mtWay = htmlObj.mtWay;
        if (htmlObj.mtStart)
            output.mtStart = parseInt(htmlObj.mtStart);
        if (htmlObj.mtEnd)
            output.mtEnd = parseInt(htmlObj.mtEnd);
        if (htmlObj.mtOnStart)
            output.mtOnStart = new Function(htmlObj.mtOnStart);
        if (htmlObj.mtOnInterval)
            output.mtOnInterval = new Function(htmlObj.mtOnInterval);
        if (htmlObj.mtOnEnd)
            output.mtOnEnd = new Function(htmlObj.mtOnEnd);
        output.mtAgo = Boolean(htmlObj.mtEnd);
        return output;
    };
    MT.prototype.htmlRemoveAttr = function (el) {
        if (!el)
            return false;
        var attrList = [
            'mtStartDate',
            'mtEndDate',
            'mtStart',
            'mtEnd',
            'mtOnStart',
            'mtOnInterval',
            'mtOnEnd',
            'mtName',
            'mtTemplate',
            'mtWay',
            'mtAgo'
        ];
        var i;
        for (i in attrList)
            el.removeAttribute(attrList[i]);
        return true;
    };
    return MT;
}());
