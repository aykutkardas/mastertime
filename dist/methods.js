;
var fullDateRegex = /([\d]{2}\.[\d]{2}\.[\d]{4})\ ([\d]{2}\:[\d]{2}\:[\d]{2})/;
var dateRegex = /([\d]{2}\.[\d]{2}\.[\d]{4})/;
var timeRegex = /([\d]{2}\:[\d]{2}\:[\d]{2})/;
function msToSecond(ms) {
    return Math.floor(ms / 1000);
}
function msToMinute(ms) {
    return Math.floor(ms / 1000 / 60);
}
function msToHour(ms) {
    return Math.floor(ms / 1000 / 60 / 60);
}
function msToDay(ms) {
    return Math.floor(ms / 1000 / 60 / 60 / 24);
}
function msToWeek(ms) {
    return Math.floor(ms / 1000 / 60 / 60 / 24 / 7);
}
function msToMonth(ms) {
    return Math.floor(ms / 1000 / 60 / 60 / 24 / 7 / 4);
}
function msToYear(ms) {
    return Math.floor(ms / 1000 / 60 / 60 / 24 / 7 / 4 / 12);
}
function dateCompletion(inputDate) {
    var fullDateRegexResult = fullDateRegex.exec(inputDate);
    if (fullDateRegexResult)
        return fullDateRegexResult[0];
    var dateRegexResult = dateRegex.exec(inputDate);
    if (dateRegexResult)
        return dateRegexResult[0] + ' 00:00:00';
    var timeRegexResult = timeRegex.exec(inputDate);
    if (timeRegexResult)
        return (new Date()).toLocaleDateString() + ' ' + timeRegexResult[0];
    return false;
}
function dateFormatTransform(inputDate) {
    if (!fullDateRegex.exec(inputDate))
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
}
function getTimeDiff(firstTime, secondTime) {
    var firstTimeMs, secondTimeMs;
    if (!firstTime)
        return false;
    firstTimeMs = (new Date(firstTime)).getTime();
    if (!secondTime)
        secondTimeMs = (new Date()).getTime();
    else
        secondTimeMs = (new Date(secondTime)).getTime();
    return firstTimeMs - secondTimeMs;
}
function msToCustom(ms, option) {
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
        if (i === 'u') {
            output[i] = Math.floor(ms);
            continue;
        }
        if (selectedFormat.indexOf(i) > -1) {
            output[i] = Math.floor(ms / ruler[i]);
            ms %= ruler[i];
        }
    }
    return output;
}
function dateIsGreater(firstTime, secondTime) {
    if (!firstTime || !secondTime)
        return false;
    var firstTimeTransform = dateFormatTransform(firstTime);
    if (typeof firstTimeTransform !== 'string')
        return false;
    var secondTimeTransform = dateFormatTransform(secondTime);
    if (typeof secondTimeTransform !== 'string')
        return false;
    var firstTimeMs = (new Date(firstTimeTransform)).getTime();
    var secondTimeMs = (new Date(secondTimeTransform)).getTime();
    if (firstTime > secondTime)
        return true;
    return false;
}
function dateIsLess(firstTime, secondTime) {
    if (!firstTime || !secondTime)
        return false;
    var firstTimeTransform = dateFormatTransform(firstTime);
    if (typeof firstTimeTransform !== 'string')
        return false;
    var secondTimeTransform = dateFormatTransform(secondTime);
    if (typeof secondTimeTransform !== 'string')
        return false;
    var firstTimeMs = (new Date(firstTimeTransform)).getTime();
    var secondTimeMs = (new Date(secondTimeTransform)).getTime();
    if (firstTime < secondTime)
        return true;
    return false;
}
function dateIsEqual(firstTime, secondTime) {
    if (!firstTime || !secondTime)
        return false;
    var firstTimeTransform = dateFormatTransform(firstTime);
    if (typeof firstTimeTransform !== 'string')
        return false;
    var secondTimeTransform = dateFormatTransform(secondTime);
    if (typeof secondTimeTransform !== 'string')
        return false;
    var firstTimeMs = (new Date(firstTimeTransform)).getTime();
    var secondTimeMs = (new Date(secondTimeTransform)).getTime();
    if (firstTime === secondTime)
        return true;
    return false;
}
function leftPad(timeObj, option) {
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
}
function formatApply(format, timeObj, option) {
    if (!format)
        return false;
    var bracket = '\\/(\\[[^\\!&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])';
    var bracketDbl = '\\/\\[(\\[[^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])\\]';
    var bracketInner = '[^\\/&^\\[]{0}\\[([^\\&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\/]*)\\]';
    if (option && option.leftPad)
        timeObj = leftPad(timeObj, option.leftPad);
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
}
function htmlSelecting(el) {
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
}
function htmlSelectingFormatter(htmlObj) {
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
}
