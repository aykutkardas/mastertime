interface RegexStorage {
    [name: string]: RegExp
}

interface TimeObj {
    'Y'?: number | string,
    'M'?: number | string,
    'W'?: number | string,
    'D'?: number | string,
    'h'?: number | string,
    'm'?: number | string,
    's'?: number | string,
    'u'?: number | string
}

namespace HTMLSelect {
    export interface Raw {
        'mtDate':    string | null,
        'mtStart':      string | null,
        'mtEnd':        string | null,
        'mtOnStart':    string | null,
        'mtOnInterval': string | null,
        'mtOnEnd':      string | null,
        'mtName':       string | null,
        'mtTemplate':   string | null,
        'mtWay':        string | null,
        'mtAgo':        string | null,
        'mtTarget':     HTMLElement | null,   
    }

    export interface Format {
        'mtDate':    string   | null,
        'mtStart':      number   | null,
        'mtEnd':        number   | null,
        'mtOnStart':    Function | null,
        'mtOnInterval': Function | null,
        'mtOnEnd':      Function | null,
        'mtName':       string   | null,
        'mtTemplate':   string   | null,
        'mtWay':        string   | null,
        'mtAgo':        boolean  | null,
        'mtTarget':     HTMLElement | null
    }

    export interface Timer extends Format {
        [name: string]: any
    }
}

namespace Option {
    export interface Format {
        leftPad: boolean | string
    }
}


class MasterTime {

    activeGroupIndex: number | boolean;
    storage: HTMLSelect.Timer[][];
    getRegex: Function;

    constructor() {

        this.activeGroupIndex = false;
        this.storage = [];
        var _regexStorage: RegexStorage = {
            fullDateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})\ ([\d]{2}\:[\d]{2}\:[\d]{2})/,
            dateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})/,
            timeRegex: /([\d]{2}\:[\d]{2}\:[\d]{2})/
        };
        this.getRegex = ()=> _regexStorage;
    }

    dateCompletion(inputDate: string): string | boolean {

        let fullDateRegexResult: RegExpExecArray = this.getRegex().fullDateRegex.exec(inputDate);
        if(fullDateRegexResult)
            return fullDateRegexResult[0];
        
        let dateRegexResult: RegExpExecArray = this.getRegex().dateRegex.exec(inputDate);
        if(dateRegexResult)
            return dateRegexResult[0] + ' 00:00:00';
    
        let timeRegexResult: RegExpExecArray = this.getRegex().timeRegex.exec(inputDate);
        if(timeRegexResult)
            return (new Date()).toLocaleDateString() + ' ' + timeRegexResult[0];
    
        return false;
    }

    dateFormatTransform(inputDate: string): string | boolean {

        if(!this.getRegex().fullDateRegex.exec(inputDate))
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

    getTimeDiff(firstTime: string, secondTime?: string): number | boolean {
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

    msToCustom(ms: number, option: string): TimeObj | boolean {

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
            if(i === 'u' && selectedFormat.indexOf(i) > -1) {
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

    dateIsGreater(firstTime: string, secondTime: string): boolean {

        if(!firstTime || !secondTime)
            return false;
    
        let firstTimeTransform = this.dateFormatTransform(firstTime);
    
        if(typeof firstTimeTransform !== 'string')
            return false;
    
        let secondTimeTransform = this.dateFormatTransform(secondTime);
    
        if(typeof secondTimeTransform !== 'string')
            return false;
    
        let firstTimeMs:  number = (new Date(firstTimeTransform)).getTime();
        let secondTimeMs: number = (new Date(secondTimeTransform)).getTime();
    
        if(firstTime > secondTime)
            return true;
    
        return false;
    
    }
    
    dateIsLess(firstTime: string, secondTime: string): boolean {
    
        if(!firstTime || !secondTime)
            return false;
    
        let firstTimeTransform = this.dateFormatTransform(firstTime);
    
        if(typeof firstTimeTransform !== 'string')
            return false;
    
        let secondTimeTransform = this.dateFormatTransform(secondTime);
    
        if(typeof secondTimeTransform !== 'string')
            return false;
    
        let firstTimeMs:  number = (new Date(firstTimeTransform)).getTime();
        let secondTimeMs: number = (new Date(secondTimeTransform)).getTime();
    
        if(firstTime < secondTime)
            return true;
    
        return false;
    
    }
    
    dateIsEqual(firstTime: string, secondTime: string): boolean {
    
        if(!firstTime || !secondTime)
            return false;
    
        let firstTimeTransform = this.dateFormatTransform(firstTime);
    
        if(typeof firstTimeTransform !== 'string')
            return false;
    
        let secondTimeTransform = this.dateFormatTransform(secondTime);
    
        if(typeof secondTimeTransform !== 'string')
            return false;
    
        let firstTimeMs:  number = (new Date(firstTimeTransform)).getTime();
        let secondTimeMs: number = (new Date(secondTimeTransform)).getTime();
    
        if(firstTime === secondTime)
            return true;
    
        return false;
    
    }
    
    leftPad(timeObj: TimeObj, option: string | boolean): TimeObj {
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

    templateApply(template: string, timeObj: TimeObj, option: Option.Format): string | boolean {

        if(!template)
            return false;
            
        // passive
        const bracket:      string = '\\/(\\[[^\\!&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])';
        const bracketPass:  string = '\\/\\[(\\[[^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])\\]';
        // const bracketInner: string = '[^\\/&^\\[]{0}\\[([^\\&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\/]*)\\]';
        const bracketInner: string = '[^\\/&^\\[]{0}\\[([^\\&^\\[&^\\]]*)\\{(.)\\}([^\\[]*)[^\\/]\\]';
    
        if(option && option.leftPad)
            timeObj = this.leftPad(timeObj, option.leftPad);
    
        let i: string,
            bracketRegex: RegExp,
            bracketPassRegex: RegExp,
            bracketInnerRegex: RegExp,
            bracketRegexMatch: RegExpExecArray,
            bracketPassRegexMatch: RegExpExecArray,
            bracketInnerRegexMatch: RegExpExecArray;
    
        for(i in timeObj) {
            bracketInnerRegex = new RegExp(bracketInner.replace('.', i), 'gmi');
            bracketInnerRegexMatch = bracketInnerRegex.exec(template);
            if(bracketInnerRegexMatch) {
                if(!parseInt(timeObj[i]))
                    template = template.replace(bracketInnerRegex, '');
                else
                    template = template.replace(bracketInnerRegex, `$1${timeObj[i]}$3`);
                continue;
            }
    
            bracketRegex = new RegExp(bracket.replace('.', i), 'gmi');
            bracketRegexMatch = bracketRegex.exec(template);
            if (bracketRegexMatch) {
                template = template.replace(bracketRegex, `$1${timeObj[i]}$3$4`);
                continue;
            }
    
            bracketPassRegex = new RegExp(bracketPass.replace(".", i), 'gmi');
            bracketPassRegexMatch = bracketPassRegex.exec(template);
            if (bracketPassRegexMatch) {
                if(!parseInt(timeObj[i]))
                    template = template.replace(bracketPassRegex, '');
                else
                    template = template.replace(bracketPassRegex, `$1${timeObj[i]}$3$4`);
                continue;
            }
    
            template = template.replace('{'+i+'}', timeObj[i]);
        }
    
        return template;
    
    }


    htmlSelect(el: HTMLElement): HTMLSelect.Format | boolean {
        if(typeof el !== 'object')
            return false;
    
        const htmlObj: HTMLSelect.Raw = {
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
    
        let i: string;
    
        for(i in htmlObj)
            htmlObj[i] = el.getAttribute(i);
    
        htmlObj.mtTarget = el;
        
        return this.htmlSelectFormatter(htmlObj);
    }


    htmlSelectFormatter(htmlObj: HTMLSelect.Raw): HTMLSelect.Format {
    
        const output: HTMLSelect.Format = {
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
    
        output.mtDate      = htmlObj.mtDate;
        output.mtName      = htmlObj.mtName;
        output.mtTemplate  = htmlObj.mtTemplate;
        output.mtWay       = htmlObj.mtWay;
        output.mtTarget    = htmlObj.mtTarget;
    
        if(htmlObj.mtStart)
            output.mtStart = parseInt(htmlObj.mtStart);
    
        if(htmlObj.mtEnd)
            output.mtEnd = parseInt(htmlObj.mtEnd);
    
        if(htmlObj.mtOnStart)
            output.mtOnStart = new Function('$MT', htmlObj.mtOnStart);
            
        if(htmlObj.mtOnInterval)
            output.mtOnInterval = new Function('$MT', htmlObj.mtOnInterval);
            
        if(htmlObj.mtOnEnd)
            output.mtOnEnd= new Function(htmlObj.mtOnEnd);
            
        output.mtAgo = Boolean(htmlObj.mtEnd);
    
      return output;
    }

    htmlRemoveAttr(el: HTMLElement): boolean {

        if(!el)
            return false;

        const attrList: string[] = [
            'mtDate',
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

        let i: string;

        for(i in attrList)
            el.removeAttribute(attrList[i]);

        return true;
    }

    craft(timer: HTMLSelect.Timer): HTMLSelect.Timer | boolean {
        if(!timer)
            return false;

        if(timer.mtStart) {
            if(timer.mtEnd) {
                if(timer.mtStart > timer.mtEnd)
                    timer.mtWay = 'down';
                else if(timer.mtStart < timer.mtEnd)
                    timer.mtWay = 'up';
                else
                    timer.mtWay = (timer.mtStart > 0) ? 'down' : 'up';
            } else {
                if(!timer.mtWay){
                    timer.mtEnd = (timer.mtStart > 0) ? 0 : Infinity;
                    timer.mtWay = (timer.mtStart > 0) ? 'down' : 'up';
                }
            }
        } else if(timer.mtEnd) {
            timer.mtStart = 0;
            timer.mtWay = (timer.mtEnd > 0) ? 'up' : 'down';
        } else if(timer.mtDate) {
            let selectDate = this.dateCompletion(timer.mtDate);
            let diff;
            if(typeof selectDate === 'string') {
                selectDate = this.dateFormatTransform(selectDate);
                if(typeof selectDate === 'string') {
                    diff = this.getTimeDiff(selectDate);
                    if(typeof diff === 'number')
                        diff = diff / 1000;
                }
            }
            if(diff > 0) {
                timer.mtStart = diff;
                timer.mtWay = 'down';
            } else {
                timer.mtStart = -diff;
                timer.mtWay = 'up';
            }
        }
        return timer;
    }


    addTimer(timer: HTMLSelect.Timer | HTMLSelect.Timer[]): number | boolean {

        if(!timer)
            return false;

        let groupIndex = this.storage.length;

        if(!this.storage[groupIndex])
            this.storage[groupIndex] = [];
        
        if(Array.isArray(timer)) {
            let i: number = 0;
            let len: number = timer.length;
            for(; i < len; i++){
                let craftTimer = this.craft(timer[i]);
                if(craftTimer && typeof craftTimer !== 'boolean')
                    this.storage[groupIndex].push(craftTimer);
            }
        } else {
            let craftTimer = this.craft(timer);
            if(craftTimer && typeof craftTimer !== 'boolean')
                this.storage[groupIndex].push(timer);
        }
        return groupIndex;
    }

    machine(groupIndex, index) {
        let timeObj = this.storage[groupIndex][index];
        if(!timeObj)
            return false;
        
        if(timeObj.mtStart === timeObj.mtEnd)
            return false;

        if(timeObj.mtWay === 'up')
            timeObj.mtStart++;
        else
            timeObj.mtStart--;

        let custom = this.msToCustom(timeObj.mtStart * 1000, 'h:m:s');
        if(
            custom && 
            typeof custom === 'object' && 
            timeObj.mtTarget && 
            timeObj.mtTarget.tagName
         ){
             let result = this.templateApply('{h}:{m}:{s}', custom,  {leftPad: true});
             if(result && typeof result === 'string')
                timeObj.mtTarget.innerHTML = result;
        }

    }

    build(selector: string) {
        
        if(!selector || typeof selector !== 'string')
            return false;

        let nodeList = document.querySelectorAll(selector);
        let elems = [];
        let j: number = 0;
        let nodeLen: number = nodeList.length;
        for(; j < nodeLen; j++)
            elems.push(nodeList[j]);


        let i: number = 0;
        let len: number = elems.length;
        let timeObj:HTMLSelect.Timer[] = [];

        for(; i < len; i++) {
            var obj = this.htmlSelect(elems[i]);
            if(obj && typeof obj === 'object')
                timeObj.push(obj);
        }

        this.activeGroupIndex = this.addTimer(timeObj);
        return this;        
    }

    add(obj) {
        this.activeGroupIndex = this.addTimer(obj)
        return this;
    }

    run() {
        if(typeof this.activeGroupIndex === 'boolean')
            return false;

        let timeObjList: HTMLSelect.Timer[] = this.storage[this.activeGroupIndex];
        let groupIndex = this.activeGroupIndex;
        let i: number = 0;
        let len: number = timeObjList.length;
        let activeObj;
        for(; i < len; i++) {
            let index = i;
            activeObj = timeObjList[index];
            setInterval(
                ()=>{this.machine(groupIndex, index)},
                1000
            )
        }

        this.activeGroupIndex = false;
    }




}