var MasterTime = /** @class */ (function () {
    function MasterTime() {
        var _storage = [];
        var _activeGroupIndex = -1;
        var _regexStorage = {
            fullDateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})\ ([\d]{2}\:[\d]{2}\:[\d]{2})/,
            dateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})/,
            timeRegex: /([\d]{2}\:[\d]{2}\:[\d]{2})/
        };
        var _scheme = {
            'mtDate': null,
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
        this.getRegex = function () { return _regexStorage; };
        this.getScheme = function () { return _scheme; };
        this.getStorage = function () { return _storage; };
        this.setStorage = function (groupIndex) { _storage[groupIndex] = []; };
    }
    MasterTime.prototype.dateCompletion = function (inputDate) {
        var fullDateRegexResult = this.getRegex().fullDateRegex.exec(inputDate);
        if (fullDateRegexResult)
            return fullDateRegexResult[0];
        var dateRegexResult = this.getRegex().dateRegex.exec(inputDate);
        if (dateRegexResult)
            return dateRegexResult[0] + ' 00:00:00';
        var timeRegexResult = this.getRegex().timeRegex.exec(inputDate);
        if (timeRegexResult)
            return (new Date()).toLocaleDateString() + ' ' + timeRegexResult[0];
        return false;
    };
    MasterTime.prototype.dateFormatTransform = function (inputDate) {
        if (!this.getRegex().fullDateRegex.exec(inputDate))
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
        if (!el || !el.tagName)
            return false;
        var htmlObj = Object.assign({}, this.getScheme());
        var attrName;
        for (attrName in htmlObj) {
            htmlObj[attrName] = el.getAttribute(attrName);
            el.removeAttribute(attrName);
        }
        htmlObj.mtTarget = el;
        return this.htmlSelectFormatter(htmlObj);
    };
    MasterTime.prototype.htmlSelectFormatter = function (htmlObj) {
        var output = Object.assign({}, this.getScheme());
        output.mtDate = htmlObj.mtDate;
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
    MasterTime.prototype.mtWayCalc = function (timer) {
        if (!timer || typeof timer !== 'object')
            return false;
        if (timer.mtStart) {
            if (timer.mtEnd) {
                if (timer.mtStart > timer.mtEnd)
                    timer.mtWay = 'down';
                else if (timer.mtStart < timer.mtEnd)
                    timer.mtWay = 'up';
                else
                    timer.mtWay = (timer.mtStart > 0) ? 'down' : 'up';
            }
            else {
                if (!timer.mtWay) {
                    timer.mtEnd = (timer.mtStart > 0) ? 0 : Infinity;
                    timer.mtWay = (timer.mtStart > 0) ? 'down' : 'up';
                }
            }
        }
        else if (timer.mtEnd) {
            timer.mtStart = 0;
            timer.mtWay = (timer.mtEnd > 0) ? 'up' : 'down';
        }
        else if (timer.mtDate) {
            var selectDate = this.dateCompletion(timer.mtDate);
            var diff = void 0;
            if (typeof selectDate === 'string') {
                selectDate = this.dateFormatTransform(selectDate);
                if (typeof selectDate === 'string') {
                    diff = this.getTimeDiff(selectDate);
                    if (typeof diff === 'number')
                        diff = diff / 1000;
                }
            }
            if (diff > 0) {
                timer.mtStart = diff;
                timer.mtWay = 'down';
            }
            else {
                timer.mtStart = -diff;
                timer.mtWay = 'up';
            }
        }
        return timer;
    };
    MasterTime.prototype.addTimer = function (timer) {
        if (!timer)
            return false;
        var groupIndex = this.storage.length;
        // if(!this.storage[groupIndex])
        // this.storage[groupIndex] = [];
        if (Array.isArray(timer)) {
            var i = 0;
            var len = timer.length;
            for (; i < len; i++) {
                var timeObj = Object.assign({}, this.getScheme(), timer[i]);
                var craftTimer = this.mtWayCalc(timeObj);
                if (craftTimer && typeof craftTimer !== 'boolean')
                    this.storage[groupIndex].push(craftTimer);
                console.log(craftTimer);
            }
        }
        else {
            var timeObj = Object.assign({}, this.getScheme(), timer);
            var craftTimer = this.mtWayCalc(timeObj);
            if (craftTimer && typeof craftTimer !== 'boolean')
                this.storage[groupIndex].push(craftTimer);
            console.log(craftTimer);
        }
        return groupIndex;
    };
    MasterTime.prototype.machine = function (groupIndex, index) {
        var timeObj = this.storage[groupIndex][index];
        if (!timeObj)
            return false;
        if (timeObj.mtStart === timeObj.mtEnd)
            return false;
        var custom = this.msToCustom(timeObj.mtStart * 1000, 'h:m:s');
        if (custom &&
            typeof custom === 'object' &&
            timeObj.mtTarget &&
            timeObj.mtTarget.tagName) {
            var result = this.templateApply('{h}:{m}:{s}', custom);
            if (result && typeof result === 'string') {
                timeObj.mtTarget.innerHTML = result;
                // @ts-ignore
                timeObj.mtTarget.value = result;
            }
        }
        if (timeObj.mtWay === 'up')
            timeObj.mtStart++;
        else
            timeObj.mtStart--;
    };
    MasterTime.prototype.build = function (selector) {
        if (!selector || typeof selector !== 'string')
            return false;
        var nodeList = document.querySelectorAll(selector);
        var elems = [];
        var j = 0;
        var nodeLen = nodeList.length;
        for (; j < nodeLen; j++)
            elems.push(nodeList[j]);
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
    MasterTime.prototype.add = function (obj) {
        if (!obj)
            return false;
        var elems;
        elems = document.querySelectorAll(obj.mtTarget);
        var i = 0;
        var len = elems.length;
        var timeObjList = [];
        for (; i < len; i++) {
            obj.target = elems[i];
            timeObjList.push(obj);
        }
        this.activeGroupIndex = this.addTimer(timeObjList);
        return this;
    };
    MasterTime.prototype.run = function () {
        var _this = this;
        if (typeof this.activeGroupIndex === 'boolean')
            return false;
        var timeObjList = this.storage[this.activeGroupIndex];
        var groupIndex = this.activeGroupIndex;
        var i = 0;
        var len = timeObjList.length;
        var activeObj;
        var _loop_1 = function () {
            var index = i;
            activeObj = timeObjList[index];
            this_1.machine(groupIndex, index);
            setInterval(function () { _this.machine(groupIndex, index); }, 1000);
        };
        var this_1 = this;
        for (; i < len; i++) {
            _loop_1();
        }
        this.activeGroupIndex = false;
    };
    return MasterTime;
}());
