interface TimeObj {
    'Y'?: number | string,
    'M'?: number | string,
    'W'?: number | string,
    'D'?: number | string,
    'h'?: number | string,
    'm'?: number | string,
    's'?: number | string,
    'u'?: number | string
};

namespace HTMLSelecting {
    export interface raw {
        'mtStartDate':  string | null,
        'mtEndDate':    string | null,
        'mtStart':      string | null,
        'mtEnd':        string | null,
        'mtOnStart':    string | null,
        'mtOnInterval': string | null,
        'mtOnEnd':      string | null,
        'mtName':       string | null,
        'mtTemplate':   string | null,
        'mtWay':        string | null,
        'mtAgo':        string | null
    }

    export interface format {
        'mtStartDate':  string   | null,
        'mtEndDate':    string   | null,
        'mtStart':      number   | null,
        'mtEnd':        number   | null,
        'mtOnStart':    Function | null,
        'mtOnInterval': Function | null,
        'mtOnEnd':      Function | null,
        'mtName':       string   | null,
        'mtTemplate':   string   | null,
        'mtWay':        string   | null,
        'mtAgo':        boolean  | null
    }
}
namespace Option {
    export interface Format {
        leftPad: boolean | string
    }
}

const fullDateRegex: RegExp = /([\d]{2}\.[\d]{2}\.[\d]{4})\ ([\d]{2}\:[\d]{2}\:[\d]{2})/;
const dateRegex:     RegExp = /([\d]{2}\.[\d]{2}\.[\d]{4})/;
const timeRegex:     RegExp = /([\d]{2}\:[\d]{2}\:[\d]{2})/;

function msToSecond(ms: number): number {
    return Math.floor(ms / 1000);
}

function msToMinute(ms: number): number {
    return Math.floor(ms / 1000 / 60);
}

function msToHour(ms: number): number {
    return Math.floor(ms / 1000 / 60 / 60);
}

function msToDay(ms: number): number {
    return Math.floor(ms / 1000 / 60 / 60 / 24);
}

function msToWeek(ms: number): number {
    return Math.floor(ms / 1000 / 60 / 60 / 24 / 7);
}

function msToMonth(ms: number): number {
    return Math.floor(ms / 1000  / 60 / 60 / 24 / 7 / 4);
}

function msToYear(ms: number): number {
    return Math.floor(ms / 1000 / 60 / 60 / 24 / 7 / 4 / 12);
}

function dateCompletion(inputDate: string): string | boolean {

    let fullDateRegexResult: RegExpExecArray = fullDateRegex.exec(inputDate);
    if(fullDateRegexResult)
        return fullDateRegexResult[0];
    
    let dateRegexResult: RegExpExecArray = dateRegex.exec(inputDate);
    if(dateRegexResult)
        return dateRegexResult[0] + ' 00:00:00';

    let timeRegexResult: RegExpExecArray = timeRegex.exec(inputDate);
    if(timeRegexResult)
        return (new Date()).toLocaleDateString() + ' ' + timeRegexResult[0];

    return false;
}

function dateFormatTransform(inputDate: string): string | boolean {

    if(!fullDateRegex.exec(inputDate))
        return false;

    const month: string[] = [
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

    let date: string[],
        explodeDate: string[] = inputDate.split(' '),
        activeMonth: string;

    if(!explodeDate[1])
        explodeDate[1] = '';

    date = explodeDate[0].split('.');
    activeMonth = month[Number(date[1])-1];

    return `${activeMonth} ${date[0]}, ${date[2]} ${explodeDate[1]}`;

}

function getTimeDiff(firstTime: string, secondTime: string): number | boolean {
    let firstTimeMs: number, 
        secondTimeMs: number;
    
    if(!firstTime)
        return false;

    firstTimeMs = (new Date(firstTime)).getTime();

    if(!secondTime)
        secondTimeMs = (new Date()).getTime();
    else
        secondTimeMs = (new Date(secondTime)).getTime();

    return firstTimeMs - secondTimeMs;
    
}

function msToCustom(ms: number, option: string): TimeObj | boolean {

    if(!ms)
        return false;

    const oneYearMs:   number = 31556926000,
          oneMonthMs:  number = 2629743830,
          oneWeekMs:   number = 604800000,
          oneDayMs:    number = 86400000,
          oneHourMs:   number = 3600000,
          oneMinuteMs: number = 60000,
          oneSecondMs: number = 1000;

    const ruler: TimeObj = {
        'Y': oneYearMs,
        'M': oneMonthMs,
        'W': oneWeekMs,
        'D': oneDayMs,
        'h': oneHourMs,
        'm': oneMinuteMs,
        's': oneSecondMs,
        'u': 1   
    };

    let selectedFormat: string[];
    if(!option)
        selectedFormat = ['Y', 'M', 'W', 'D', 'h', 'm', 's', 'u'];
    else
        selectedFormat = option.split(':');

    let i: string;
    let output: TimeObj = {};

    for(i in ruler) {
        if(i === 'u') {
            output[i] = Math.floor(ms);
            continue;
        }

        if(selectedFormat.indexOf(i) > -1) {
            output[i] = Math.floor(ms / ruler[i]);
            ms %= ruler[i];
        }
    }
    
    return output;
}

function dateIsGreater(firstTime: string, secondTime: string): boolean {

    if(!firstTime || !secondTime)
        return false;

    let firstTimeTransform = dateFormatTransform(firstTime);

    if(typeof firstTimeTransform !== 'string')
        return false;

    let secondTimeTransform = dateFormatTransform(secondTime);

    if(typeof secondTimeTransform !== 'string')
        return false;

    let firstTimeMs:  number = (new Date(firstTimeTransform)).getTime();
    let secondTimeMs: number = (new Date(secondTimeTransform)).getTime();

    if(firstTime > secondTime)
        return true;

    return false;

}

function dateIsLess(firstTime: string, secondTime: string): boolean {

    if(!firstTime || !secondTime)
        return false;

    let firstTimeTransform = dateFormatTransform(firstTime);

    if(typeof firstTimeTransform !== 'string')
        return false;

    let secondTimeTransform = dateFormatTransform(secondTime);

    if(typeof secondTimeTransform !== 'string')
        return false;

    let firstTimeMs:  number = (new Date(firstTimeTransform)).getTime();
    let secondTimeMs: number = (new Date(secondTimeTransform)).getTime();

    if(firstTime < secondTime)
        return true;

    return false;

}

function dateIsEqual(firstTime: string, secondTime: string): boolean {

    if(!firstTime || !secondTime)
        return false;

    let firstTimeTransform = dateFormatTransform(firstTime);

    if(typeof firstTimeTransform !== 'string')
        return false;

    let secondTimeTransform = dateFormatTransform(secondTime);

    if(typeof secondTimeTransform !== 'string')
        return false;

    let firstTimeMs:  number = (new Date(firstTimeTransform)).getTime();
    let secondTimeMs: number = (new Date(secondTimeTransform)).getTime();

    if(firstTime === secondTime)
        return true;

    return false;

}

function leftPad(timeObj: TimeObj, option: string | boolean): TimeObj {
    if(!option)
        return timeObj;

    let selectedOption: string[];
    if(option === true)
        selectedOption = ['Y', 'M', 'W', 'D', 'h', 'm', 's', 'u'];
    else
        selectedOption = option.split(':');

    let i: string,
        newTimeObj: TimeObj = {};
    
    for(i in timeObj) {
        if(selectedOption.indexOf(i) > -1)
            newTimeObj[i] = parseInt(timeObj[i]) < 10 ? '0' + timeObj[i] : timeObj[i];
    }

    (<any>Object).assign(timeObj, newTimeObj);

    return timeObj;

}

function formatApply(format: string, timeObj: TimeObj, option: Option.Format): string | boolean {

    if(!format)
        return false;

    const bracket:      string = '\\/(\\[[^\\!&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])';
    const bracketDbl:   string = '\\/\\[(\\[[^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])\\]';
    const bracketInner: string = '[^\\/&^\\[]{0}\\[([^\\&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\/]*)\\]';

    if(option && option.leftPad)
        timeObj = leftPad(timeObj, option.leftPad);

    let i: string,
        bracketRegex: RegExp,
        bracketDblRegex: RegExp,
        bracketInnerRegex: RegExp,
        bracketRegexMatch: RegExpExecArray,
        bracketDblRegexMatch: RegExpExecArray,
        bracketInnerRegexMatch: RegExpExecArray;

    for(i in timeObj) {

        bracketInnerRegex = new RegExp(bracketInner.replace('.', i));
        bracketInnerRegexMatch = bracketInnerRegex.exec(format);
        if(bracketInnerRegexMatch) {
            if(!parseInt(timeObj[i]))
                format = format.replace(bracketInnerRegex, '');
            else
                format = format.replace(bracketInnerRegex, `$1${timeObj[i]}$3`);
            continue;
        }

        bracketRegex = new RegExp(bracket.replace('.', i));
        bracketRegexMatch = bracketRegex.exec(format);
        if (bracketRegexMatch) {
            if(!parseInt(timeObj[i]))
                format = format.replace(bracketRegex, '');
            else
                format = format.replace(bracketRegex, `$1${timeObj[i]}$3$4`);
            continue;
        }

        bracketDblRegex = new RegExp(bracketDbl.replace(".", i));
        bracketDblRegexMatch = bracketDblRegex.exec(format);
        if (bracketDblRegexMatch) {
            format = format.replace(bracketDblRegex, `$1${timeObj[i]}$3$4`);
            continue;
        }

        format = format.replace('{'+i+'}', timeObj[i]);
    }

    return format;

}

function htmlSelecting(el: HTMLElement): HTMLSelecting.raw | boolean {
    if(typeof el !== 'object')
        return false;

    const htmlObj: HTMLSelecting.raw = {
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

    let i: string;

    for(i in htmlObj)
        htmlObj[i] = el.getAttribute(i);

    return htmlObj;
}

function htmlSelectingFormatter(htmlObj: HTMLSelecting.raw): HTMLSelecting.format {
    
    const output: HTMLSelecting.format = {
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
    output.mtEndDate   = htmlObj.mtEndDate;
    output.mtName      = htmlObj.mtName;
    output.mtTemplate  = htmlObj.mtTemplate;
    output.mtWay       = htmlObj.mtWay;

    if(htmlObj.mtStart)
        output.mtStart = parseInt(htmlObj.mtStart);

    if(htmlObj.mtEnd)
        output.mtEnd = parseInt(htmlObj.mtEnd);

    if(htmlObj.mtOnStart)
        output.mtOnStart = new Function(htmlObj.mtOnStart);
        
    if(htmlObj.mtOnInterval)
        output.mtOnInterval = new Function(htmlObj.mtOnInterval);
        
    if(htmlObj.mtOnEnd)
        output.mtOnEnd= new Function(htmlObj.mtOnEnd);
        
    output.mtAgo = Boolean(htmlObj.mtEnd);

  return output;
}