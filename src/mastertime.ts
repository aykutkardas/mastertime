namespace Storage {
  export interface Event {
    onStart?: Function;
    onInterval?: Function;
    onEnd?: Function;
  }

  export interface Format {
    Y?: string;
    M?: string;
    W?: string;
    D?: string;
    h?: string;
    m?: string;
    s?: string;
  }

  export interface Build {
    date?: string;
    start?: string;
    end?: string;
    onStart?: string;
    onInterval?: string;
    onEnd?: string;
    name?: string;
    template?: string;
    way?: string;
    ago?: string;
  }

  export interface Timer {
    date?: string;
    start?: number;
    end?: number;
    onStart?: Function;
    onInterval?: Function;
    onEnd?: Function;
    name?: string;
    template?: string;
    way?: string;
    ago?: boolean;
    target?: Node | string;
    [name: string]: any;
  }

  export interface Config {
        timeFormat?: string;
        leftPad?: string | boolean;
  }

  export interface Regex {
    fullDateRegex: RegExp;
    dateRegex: RegExp;
    timeRegex: RegExp;
  }

}



class Mastertime {
    _getTimeBase: Function;
    _createTimeBaseRoom: Function;
    _putTimeBaseRoom: Function;
    _getLastRoomIndex: Function;
    _setLastRoomIndex: Function;
    _resetLastRoomIndex: Function;
    _wayDetector: Function;
    _leftPad: Function;
    _getRegex: Function;
    _dateComplete: Function;
    _dateFormat: Function;
    _dateDiff: Function;
    _timeFormat: Function;
    _templateApply: Function;
    _machine: Function;
    _attrToProp: Function;

    constructor() {

        let _lastRoomIndex = -1;
        const _storage: Storage.Timer[][] = [];
        const _regexStorage: Storage.Regex = {
            fullDateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})\ ([\d]{2}\:[\d]{2}\:[\d]{2})/,
            dateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})/,
            timeRegex: /([\d]{2}\:[\d]{2}\:[\d]{2})/
        };

        this._getRegex = (key?: string): Storage.Regex | RegExp =>
        key ? _regexStorage[key] : _regexStorage;

        this._getTimeBase = (): Storage.Timer[][] => _storage;

        this._createTimeBaseRoom = (): number => {
        let index = _storage.length;
        _storage[index] = [];
        return index;
        };

        this._putTimeBaseRoom = (index: number, obj: Storage.Timer): void => {
        _storage[index].push(obj);
        };

        this._getLastRoomIndex = (): number => _lastRoomIndex;

        this._setLastRoomIndex = (index: number): void => {
        _lastRoomIndex = index;
        };

        this._resetLastRoomIndex = (): void => {
        _lastRoomIndex = -1;
        };

        this._attrToProp = (str: string): string => {
            str = str.substr(2, str.length);
            return (str = str[0].toLowerCase() + str.slice(1, str.length));
        };

        this._wayDetector = (obj: Storage.Timer): Storage.Timer => {

            if ('string' === typeof(obj.start) && !isNaN(parseInt(obj.start)))
                obj.start = parseInt(obj.start);

            if ('string' === typeof(obj.end) && !isNaN(parseInt(obj.end)))
                obj.end = parseInt(obj.end);

            if ((<any>Number).isInteger(obj.start)) {

                if ((<any>Number).isInteger(obj.end)) {
                    if (obj.start > obj.end)
                        obj.way = 'down';
                    else
                        obj.way = 'up';
                } else {
                    if (!obj.way) {
                        obj.end = obj.start > 0 ? 0 : Infinity;
                        obj.way = obj.start > 0 ? 'down' : 'up';
                    }
                }
                
            } else if (obj.date) {

                let diff = this._dateDiff(obj.date);
                diff =  (diff < 0) ? -diff : diff;

                if (this._dateDiff(obj.date) < 0) 
                    obj.way = 'up';
                else
                    obj.way = 'down';

                obj.start = Math.floor(diff);
            }

            return obj;
        };

        this._leftPad = (obj: Storage.Timer, option?): Storage.Timer => {

            if (!option || !option.leftPad)
                return obj;

            let selectedOption: string[];

            if (option.leftPad === true)
                selectedOption = ["Y", "M", "W", "D", "h", "m", "s"];
            else
                selectedOption = option.leftPad.split(":");

            let timeType: string,
                newObj: Storage.Timer = {};

            for (timeType in obj) {
                if (selectedOption.indexOf(timeType) > -1)
                    newObj[timeType] = parseInt(obj[timeType]) < 10 ? "0" + obj[timeType] : obj[timeType];
            }

            (<any>Object).assign(obj, newObj);

            return obj;
            
        };

        this._dateComplete = (date: string): string => {

            
            let fullDateRegex: RegExpExecArray;
            fullDateRegex = this._getRegex('fullDateRegex').exec(date);
            
            if (fullDateRegex)
                return fullDateRegex[0];
            
            let dateRegex: RegExpExecArray;
            dateRegex = this._getRegex('dateRegex').exec(date);
            
            if(dateRegex)
                return dateRegex[0] + ' 00:00:00';
            
            let timeRegex: RegExpExecArray;
            timeRegex = this._getRegex('timeRegex').exec(date);
            
            if(timeRegex)
                return new Date().toLocaleDateString() + ' ' + timeRegex[0];

            return new Date().toLocaleString();

        };

        this._dateFormat = (date: string): string => {

            if (!this._getRegex("fullDateRegex").exec(date)) 
                return date;

            const months: string[] = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
            ];

            let [dateStr, timeStr]: string[] = date.split(" ");
            let [day, month, year] = dateStr.split(".");

            month = months[Number(month) - 1];

            return `${month} ${day}, ${year} ${timeStr}`;
        };

        this._dateDiff = (date: string): number => {

            if (!date)
                return 0;

            let dateMs: number, 
                nowDateMs: number;

            date = this._dateFormat(this._dateComplete(date));

            dateMs = new Date(date).getTime();
            nowDateMs = new Date().getTime();

            return (dateMs - nowDateMs) / 1000;

        };

        this._templateApply = (template: string, timeObj: Storage.Timer, option?): string => {

            const defaultTemplate = '{h}:{m}:{s}';

            if('string' === typeof(template) && template.trim().length < 1)
                template = defaultTemplate;
            else if (!template)
                template = defaultTemplate;

            const bracketInner: string = '\\/(\\[[^\\!&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])';
            const bracketPass: string  = '[^\\/&^\\[]{0}\\[([^\\&^\\[&^\\]]*)\\{(.)\\}([^\\[]*)[^\\/]\\]';

            if(option && option.leftPad)
                timeObj = this._leftPad(timeObj, option);

            let timeType: string;
            let bracketPassRegex:  RegExp;
            let bracketInnerRegex: RegExp;
            let bracketInnerRegexMatch: RegExpExecArray;
            let bracketPassRegexMatch:  RegExpExecArray;

            for(timeType in timeObj) {
                bracketInnerRegex = new RegExp(bracketInner.replace('.', timeType), 'gmi');
                bracketInnerRegexMatch = bracketInnerRegex.exec(template);
                if(bracketInnerRegexMatch) {
                    if(parseInt(timeObj[timeType]) === 0)
                        template = template.replace(bracketInnerRegex, '');
                    else
                        template = template.replace(bracketInnerRegex, `$1${timeObj[timeType]}$3`);
                    
                    continue;
                }

                bracketPassRegex = new RegExp(bracketPass.replace('.', timeType), 'gmi');
                bracketPassRegexMatch = bracketPassRegex.exec(template);

                if(bracketPassRegexMatch) {
                    template = template.replace(bracketPassRegex, `$1${timeObj[timeType]}$3$4`);
                    continue;
                }

                template = template.replace("{" + timeType + "}", timeObj[timeType]);
            }

            return template;

        };

        this._timeFormat = (second: number, option?): Storage.Format => {
        
            if('number' !== typeof(second))
                second = parseInt(second);
            
            if(isNaN(second))
                second = 0;
            

            const ruler: Storage.Timer = {
                Y: 31556926,
                M: 2629743.83,
                W: 604800,
                D: 86400,
                h: 3600,
                m: 60,
                s: 1
            };

            let selectedFormat: string[];

            if(!option)
                selectedFormat = ['Y', 'M', 'W', 'D', 'h', 'm', 's'];
            else
                selectedFormat = option.timeFormat.split(':');


            let timeType: string;
            let timerObj: Storage.Format = {};

            for(timeType in ruler) {
                if(selectedFormat.indexOf(timeType) > -1) {
                    timerObj[timeType] = Math.floor(second / ruler[timeType]).toString();
                    second %= ruler[timeType];
                }
            }

            return timerObj;
            
        };

        this._machine = (obj: Storage.Timer) => {

            if('number' !== typeof(obj.start))
                clearInterval(obj.process);

            if (typeof obj.start !== "number" && !obj.date)
                clearInterval(obj.process);

            let config: Storage.Config = {
                timeFormat: obj.date ? 'Y:M:W:D:h:m:s' : 'h:m:s',
                leftPad: obj.date ? 'h:m:s' : false
            }

            obj.config = (<any>Object).assign({}, config, obj.config);

            if (obj.onInterval)
                obj.onInterval(obj);


            if(obj.target) {

                let target:HTMLElement = (<HTMLElement>obj.target);
                if(!obj.template) {
                    //@ts-ignore
                    obj.template = target.tagName === 'INPUT' ? target.value : target.innerHTML;
                }

                let content: string = this._templateApply(
                    obj.template,
                    this._timeFormat(obj.start, obj.config),
                    obj.config
                );

                if(target.tagName === 'INPUT') {
                    //@ts-ignore
                    if(target.value !== content) target.value = content;
                } else {
                    if(target.innerHTML !== content)
                        target.innerHTML = content;
                }

            }

            if(obj.start === obj.end) {
                clearInterval(obj.process);
                if(obj.onEnd)
                    obj.onEnd(obj);
                return true;
            }

            if(obj.way === 'up')
                obj.start++;
            else
                obj.start--;
        };
    }

    add(timerObj: Storage.Timer | Storage.Timer[]): Mastertime {
        
        if(!timerObj)
            return this;

        let roomIndex: number = this._createTimeBaseRoom();
        let timerObjList: Storage.Timer[];

        if(!Array.isArray(timerObj))
            timerObjList = [timerObj];
        else
            timerObjList = timerObj;

        let i: number = 0;
        let len: number = timerObjList.length;

        for(; i < len; i++) {
            let activeObj = this._wayDetector(timerObjList[i]);
            
            if(!activeObj.start && !activeObj.date)
                continue;

            if(activeObj.target) {
                let elements: NodeList = document.querySelectorAll(activeObj.target);
                let j: number = 0;
                let elementSize: number = elements.length;

                for(; j < elementSize; j++) {
                    let activeElement: HTMLElement = <HTMLElement>elements[j];
                    let uniqueTimerObj = (<any>Object).assign(
                        {}, 
                        activeObj,
                        {
                            target: activeElement,
                            template: activeObj.template
                        }
                    );

                    this._putTimeBaseRoom(roomIndex, uniqueTimerObj);

                }
            } else {
                this._putTimeBaseRoom(
                    roomIndex, 
                    (<any>Object).assign({}, activeObj)
                );
            }

            this._setLastRoomIndex(roomIndex);

            return this;
        }

    }

    build(selector: string | HTMLElement | NodeList, config?): Mastertime {

        if(!selector)
            return this;

        let elements;

        if('string' === typeof(selector))
            elements = document.querySelectorAll(selector);
        else if((<HTMLElement>selector).tagName)
            elements = [selector];
        else if((<NodeList>selector).length)
            elements = selector;
        else
            return this;

        if(!elements.length)
            return this;

        let roomIndex: number = this._createTimeBaseRoom();

        const attrList = [
            "mtDate",
            "mtStart",
            "mtEnd",
            "mtOnStart",
            "mtOnInterval",
            "mtOnEnd",
            "mtName",
            "mtTemplate",
            "mtWay",
            "mtAgo"
        ];

        let i: number = 0;
        let len: number = elements.length;

        for(; i < len; i++) {

            let activeElement: HTMLElement = elements[i];
            let rawTimerObj: Storage.Build = {};

            let j: number = 0;
            let attrListLen: number = attrList.length;

            for(; j < attrListLen; j++) {

                let attrValue: string = activeElement.getAttribute(attrList[j]);

                if(attrValue) {
                    activeElement.removeAttribute(attrList[j]);
                    let attrKey: string = this._attrToProp(attrList[j]);
                    rawTimerObj[attrKey] = attrValue;
                }

            }

            if(!rawTimerObj.start && !rawTimerObj.date)
                continue;

            let events : Storage.Event = {};

            if(rawTimerObj.onStart && 'string' === typeof(rawTimerObj.onStart))
                events.onStart = new Function('event', rawTimerObj.onStart);
            
            if(rawTimerObj.onInterval && 'string' === typeof(rawTimerObj.onInterval))
                events.onInterval = new Function('event', rawTimerObj.onInterval);
            
            if(rawTimerObj.onEnd && 'string' === typeof(rawTimerObj.onEnd))
                events.onEnd = new Function('event', rawTimerObj.onEnd);
            
            let timerObj: Storage.Timer = (<any>Object).assign(
                {},
                this._wayDetector(rawTimerObj),
                events,
                {
                    target: activeElement,
                    config
                }
            );

            this._putTimeBaseRoom(roomIndex, timerObj);            
        }
        
        this._setLastRoomIndex(roomIndex);
        return this;
    }

    run() {

        let roomIndex: number = this._getLastRoomIndex();

        if(roomIndex === -1)
            return false;

        let timerObjList: Storage.Timer[] = this._getTimeBase()[roomIndex];
        let i: number = 0;
        let len: number = timerObjList.length;

        for(; i < len; i++) {
            let activeObj: Storage.Timer = timerObjList[i];
            if(activeObj.onStart)
                activeObj.onStart(activeObj);

            this._machine(activeObj);
            activeObj.process = setInterval(
                () => this._machine(activeObj),
                1000
            );
        }

        this._resetLastRoomIndex();
    }

    destroy(name: string): boolean {

        if(!name || 'string' !== typeof(name))
            return false;

        const _storage = this._getTimeBase();

        if(!_storage || !Array.isArray(_storage) || !_storage.length)
            return false;

        let i: number = 0;
        let len: number = _storage.length;

        for(; i < len; i++) {
            let j: number = 0;
            let roomSize: number = _storage[i].length;
            let timerObjList: Storage.Timer = _storage[i];
            
            if(!timerObjList || !roomSize)
                continue;

            for(; j < roomSize; j++) {
                let activeObj = timerObjList[j];
                if(activeObj.hasOwnProperty('name') && name === activeObj.name)
                    clearInterval(activeObj.process);
            }
        }
    }
}
