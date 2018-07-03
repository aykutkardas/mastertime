// milisecond to <year|month|week|day|hour|minute|second>

function miliSecondToSecond(ms){
    return ms / 1000;
}

function miliSecondToMinute(ms){
    return Math.floor(ms / 1000  / 60);
}

function miliSecondToHour(ms){
    return Math.floor(ms / 1000  / 60 / 60);
}

function miliSecondToDay(ms){
    return Math.floor(ms / 1000  / 60 / 60 / 24);
}

function miliSecondToWeek(ms){
    return Math.floor(ms / 1000  / 60 / 60 / 24 / 7);
}

function miliSecondToMonth(ms) {
    return Math.floor(ms / 1000  / 60 / 60 / 24 / 7 / 4);
}

function miliSecondToYear(ms) {
    return Math.floor(ms / 1000 / 60 / 60 / 24 / 7 / 4 / 12);
}

// "13.10.2014 11:13:00" to "October 13, 2014 11:13:00"

function dateFormatTransform(inputDate, option){
    const month = [
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
    ]

    var date, 
        time, 
        inputDate;
        

    if(option && option.completion)
        inputDate = dateCompletion(inputDate).split(' ')
    else
        inputDate = inputDate.split(' ');

    if(!inputDate[1])
        inputDate[1] = '';

    date = inputDate[0].split('.')
    
    activeMonth = month[Number(date[1])-1]
    newDate = activeMonth + " " + date[0] + ", " + date[2] + " " + inputDate[1];

    return newDate
}

// date completion

function dateCompletion(inputDate) {
    if(inputDate.indexOf(' ') > -1)
        return inputDate;

    let date,
        time,
        compare,
        now = new Date();
        
    if(inputDate.indexOf('.') > -1) {
        time = dateIsEqual(inputDate, now.toLocaleDateString()) ? now.toLocaleTimeString() : '00:00:00';
        date = inputDate
    } else if(inputDate.indexOf(':') > -1) {
        time = inputDate
        date = now.toLocaleDateString()
    }

    return date + ' ' + time;

}

// time difference
// return miliseconds

function timeDiff(firstTime, secondTime) {
    if(!firstTime) 
        return false;

    if(!secondTime) 
        secondTime = new Date().getTime();
    else
        secondTime = new Date(dateFormatTransform(secondTime, {completion: true})).getTime();

    firstTime = new Date(dateFormatTransform(firstTime, {completion: true})).getTime();

    return firstTime - secondTime;
}

// time diff formatter
// give ms
// miliSecondToCustom(152654343, "Y:M:W:D:h:m:s:u")

function miliSecondToCustom(timeDiff, option) {
    var oneYearMs   = 31556926000;
    var oneMonthMs  = 2629743830;
    var oneWeekMs   = 604800000;
    var oneDayMs    = 86400000;
    var oneHourMs   = 3600000;
    var oneMinuteMs = 60000;
    var oneSecondMs = 1000;

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

    var i,
        output = {};

    if(!option)
        option = "Y:M:W:D:h:m:s:u";
    
    option = option.split(':');
    
    for(i in ruler) {
        if(i === 'u'){
            output[i] = Math.floor(timeDiff);
            continue;
        }

        if(option.indexOf(i) > -1) {
            output[i] = Math.floor(timeDiff / ruler[i]);
            timeDiff %= ruler[i];
        }
    }

    return output;
}

// date compare "10:05:2017" > "06:06:2013"
// first is (greather|equal|less) than second

function dateIsGreater(firstDate, secondDate) {
    if(!firstDate || !secondDate)
        return false;

    firstDate  = new Date(dateFormatTransform(firstDate)).getTime();
    secondDate = new Date(dateFormatTransform(secondDate)).getTime();

    if(firstDate > secondDate)
        return true;

    return false;
}

function dateIsLess(firstDate, secondDate) {
    if(!firstDate || !secondDate)
        return false;

    firstDate  = new Date(dateFormatTransform(firstDate)).getTime();
    secondDate = new Date(dateFormatTransform(secondDate)).getTime();

    if (firstDate < secondDate)
        return true;

    return false;
}

function dateIsEqual(firstDate, secondDate) {
    if(!firstDate || !secondDate)
        return false;

    firstDate  = new Date(dateFormatTransform(firstDate)).getTime();
    secondDate = new Date(dateFormatTransform(secondDate)).getTime();

    if (firstDate === secondDate)
        return true;

    return false;
}


// template apply
// give timeObj @Object <Ouput: miliSecondToCustom(t, o)>
// give format @String <"{Y} year *({M} month),">
// /[[{Y} year/]] ![{M} month] ![{W} week] ![{D} day] {h} hour /[{m} minute/] {s} second {u} milisecond

function formatApply(timeObj, format, option) {

    if(option) {
        if(option.leftPad)
            timeObj = leftPad(timeObj, option.leftPad);
    }

    var bracketsRegExp = "\\/(\\[[^\\!&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])";
    var bracketsDblRegExp = "\\/\\[(\\[[^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])\\]";
    var bracketsInnerRegExp = "[^\\/&^\\[]\\[([^\\&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\]";
    var i,
        re1,
        re2,
        re3,
        result1,
        result2,
        result3;

    for(i in timeObj) {

        re1 = new RegExp(bracketsInnerRegExp.replace('.', i));
        result1 = re1.exec(format)
        if(result1) {
            if(!parseInt(timeObj[i]))
                format = format.replace(re1, '');
            else
                format = format.replace(re1, '$1'+timeObj[i]+'$3');
            continue;
        }
        
        re2 = new RegExp(bracketsRegExp.replace(".", i));
        result2 = re2.exec(format);
        if(result2) {
            if(!parseInt(timeObj[i]))
                format = format.replace(re2, '');
            else
                format = format.replace(re2, '$1'+timeObj[i]+'$3$4');
            continue;
        }

        re3 = new RegExp(bracketsDblRegExp.replace(".", i));
        result3 = re3.exec(format);
        if(result3){
            format = format.replace(re3, '$1'+timeObj[i]+'$3$4');
            continue;
        }

        format = format.replace('{' + i + '}', timeObj[i]);

    }
    
    return format;

}

// left pad

function leftPad(timeObj, option) {
    if(!option)
        return timeObj;

    var i;
        option = Array.isArray(option) ? option : ["Y","M","W","D","h","m","s","u"];

    var newTimeObj = {};
    for(i in timeObj) {
        if(option.indexOf(i) > -1)
            newTimeObj[i] = parseInt(timeObj[i]) < 10 ? "0" + timeObj[i] : timeObj[i];
    }
    Object.assign(timeObj, newTimeObj);

    return timeObj;
}