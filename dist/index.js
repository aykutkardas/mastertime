var MasterTime = /** @class */ (function () {
    function MasterTime() {
        this.activeGroupIndex = false;
        this.storage = [];
        this.regexStorage = {
            fullDateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})\ ([\d]{2}\:[\d]{2}\:[\d]{2})/,
            dateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})/,
            timeRegex: /([\d]{2}\:[\d]{2}\:[\d]{2})/
        };
    }
    MasterTime.prototype.msToSecond = function (ms) {
        return Math.floor(ms / 1000);
    };
    MasterTime.prototype.msToMinute = function (ms) {
        return Math.floor(ms / 1000 / 60);
    };
    MasterTime.prototype.msToHour = function (ms) {
        return Math.floor(ms / 1000 / 60 / 60);
    };
    MasterTime.prototype.msToDay = function (ms) {
        return Math.floor(ms / 1000 / 60 / 60 / 24);
    };
    MasterTime.prototype.msToWeek = function (ms) {
        return Math.floor(ms / 1000 / 60 / 60 / 24 / 7);
    };
    MasterTime.prototype.msToMonth = function (ms) {
        return Math.floor(ms / 1000 / 60 / 60 / 24 / 7 / 4);
    };
    MasterTime.prototype.msToYear = function (ms) {
        return Math.floor(ms / 1000 / 60 / 60 / 24 / 7 / 4 / 12);
    };
    MasterTime.prototype.dateCompletion = function (inputDate) {
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
    MasterTime.prototype.dateFormatTransform = function (inputDate) {
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
    MasterTime.prototype.getTimeDiff = function (firstTime, secondTime) {
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
    MasterTime.prototype.msToCustom = function (ms, option) {
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
    MasterTime.prototype.dateIsGreater = function (firstTime, secondTime) {
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
    MasterTime.prototype.dateIsLess = function (firstTime, secondTime) {
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
    MasterTime.prototype.dateIsEqual = function (firstTime, secondTime) {
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
    MasterTime.prototype.leftPad = function (timeObj, option) {
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
    MasterTime.prototype.templateApply = function (template, timeObj, option) {
        if (!template)
            return false;
        // passive
        var bracket = '\\/(\\[[^\\!&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])';
        var bracketPass = '\\/\\[(\\[[^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])\\]';
        // const bracketInner: string = '[^\\/&^\\[]{0}\\[([^\\&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\/]*)\\]';
        var bracketInner = '[^\\/&^\\[]{0}\\[([^\\&^\\[&^\\]]*)\\{(.)\\}([^\\[]*)[^\\/]\\]';
        if (option && option.leftPad)
            timeObj = this.leftPad(timeObj, option.leftPad);
        var i, bracketRegex, bracketPassRegex, bracketInnerRegex, bracketRegexMatch, bracketPassRegexMatch, bracketInnerRegexMatch;
        for (i in timeObj) {
            bracketInnerRegex = new RegExp(bracketInner.replace('.', i), 'gmi');
            bracketInnerRegexMatch = bracketInnerRegex.exec(template);
            if (bracketInnerRegexMatch) {
                if (!parseInt(timeObj[i]))
                    template = template.replace(bracketInnerRegex, '');
                else
                    template = template.replace(bracketInnerRegex, "$1" + timeObj[i] + "$3");
                continue;
            }
            bracketRegex = new RegExp(bracket.replace('.', i), 'gmi');
            bracketRegexMatch = bracketRegex.exec(template);
            if (bracketRegexMatch) {
                template = template.replace(bracketRegex, "$1" + timeObj[i] + "$3$4");
                continue;
            }
            bracketPassRegex = new RegExp(bracketPass.replace(".", i), 'gmi');
            bracketPassRegexMatch = bracketPassRegex.exec(template);
            if (bracketPassRegexMatch) {
                if (!parseInt(timeObj[i]))
                    template = template.replace(bracketPassRegex, '');
                else
                    template = template.replace(bracketPassRegex, "$1" + timeObj[i] + "$3$4");
                continue;
            }
            template = template.replace('{' + i + '}', timeObj[i]);
        }
        return template;
    };
    MasterTime.prototype.htmlSelect = function (el) {
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
            'mtAgo': null,
            'mtTarget': null
        };
        var i;
        for (i in htmlObj)
            htmlObj[i] = el.getAttribute(i);
        htmlObj.mtTarget = el;
        return this.htmlSelectFormatter(htmlObj);
    };
    MasterTime.prototype.htmlSelectFormatter = function (htmlObj) {
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
            'mtAgo': null,
            'mtTarget': null
        };
        output.mtStartDate = htmlObj.mtStartDate;
        output.mtEndDate = htmlObj.mtEndDate;
        output.mtName = htmlObj.mtName;
        output.mtTemplate = htmlObj.mtTemplate;
        output.mtWay = htmlObj.mtWay;
        output.mtTarget = htmlObj.mtTarget;
        if (htmlObj.mtStart)
            output.mtStart = parseInt(htmlObj.mtStart);
        if (htmlObj.mtEnd)
            output.mtEnd = parseInt(htmlObj.mtEnd);
        if (htmlObj.mtOnStart)
            output.mtOnStart = new Function('$MT', htmlObj.mtOnStart);
        if (htmlObj.mtOnInterval)
            output.mtOnInterval = new Function('$MT', htmlObj.mtOnInterval);
        if (htmlObj.mtOnEnd)
            output.mtOnEnd = new Function(htmlObj.mtOnEnd);
        output.mtAgo = Boolean(htmlObj.mtEnd);
        return output;
    };
    MasterTime.prototype.htmlRemoveAttr = function (el) {
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
    MasterTime.prototype.addTimer = function (timer) {
        if (!timer)
            return false;
        var groupIndex = this.storage.length;
        if (!this.storage[groupIndex])
            this.storage[groupIndex] = [];
        if (Array.isArray(timer)) {
            var i = void 0;
            var len = timer.length;
            for (; i < len; i++)
                this.storage[groupIndex].push(timer);
        }
        else {
            this.storage[groupIndex].push(timer);
        }
        return groupIndex;
    };
    MasterTime.prototype.machine = function (timeObj) {
        var custom = this.msToCustom(timeObj.mtStart * 1000, 'h:m:s');
        timeObj.mtTarget.innerHTML = this.templateApply(custom, '{h}:{m}:{s}', { leftPad: true });
    };
    MasterTime.prototype.build = function (selector) {
        if (!selector || typeof selector !== 'string')
            return false;
        var elems = [].concat.apply([], document.querySelectorAll(selector));
        var i = 0;
        var len = elems.length;
        var timeObj = [];
        for (; i < len; i++) {
            var obj = this.htmlSelect(elems[i]);
            if (obj && typeof obj === 'object')
                timeObj.push(obj);
        }
        this.activeGroupIndex = this.addTimer(timeObj);
        return this;
    };
    MasterTime.prototype.run = function () {
        if (typeof this.activeGroupIndex === 'boolean')
            return false;
        var timeObjList = this.storage[this.activeGroupIndex];
        var i = 0;
        var len = timeObjList.length;
        for (; i < len; i++)
            this.machine(timeObjList[i]);
    };
    return MasterTime;
}());
