namespace Storage {
  // export interface Storage {
  //   [index: number]: Storage.TimerObj[];
  // }

  export interface Event {
    onStart?: Function;
    onInterval?: Function;
    onEnd?: Function;
  }

  export interface Format {
    Y?: number | string;
    M?: number | string;
    W?: number | string;
    D?: number | string;
    h?: number | string;
    m?: number | string;
    s?: number | string;
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

  export interface TimerObj {
    date?: string;
    start?: number;
    end?: number;
    onStart?: Function | string;
    onInterval?: Function | string;
    onEnd?: Function | string;
    name?: string;
    template?: string;
    way?: string;
    ago?: boolean;
    target?: Node | string;
    [name: string]: any;
  }
}

interface RegexStorage {
  fullDateRegex: RegExp;
  dateRegex: RegExp;
  timeRegex: RegExp;
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
  _firstLetterToLowerCase: Function;

  constructor() {
    let _lastRoomIndex = -1;
    const _storage: Storage.TimerObj[][] = [];
    const _regexStorage: RegexStorage = {
      fullDateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})\ ([\d]{2}\:[\d]{2}\:[\d]{2})/,
      dateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})/,
      timeRegex: /([\d]{2}\:[\d]{2}\:[\d]{2})/
    };

    this._getRegex = (key?: string): RegexStorage | RegExp =>
      key ? _regexStorage[key] : _regexStorage;

    this._getTimeBase = () => _storage;

    this._createTimeBaseRoom = (): number => {
      let index = _storage.length;
      _storage[index] = [];
      return index;
    };

    this._putTimeBaseRoom = (index: number, obj: Storage.TimerObj): void => {
      _storage[index].push(obj);
    };

    this._getLastRoomIndex = (): number => _lastRoomIndex;

    this._setLastRoomIndex = (index: number): void => {
      _lastRoomIndex = index;
    };

    this._resetLastRoomIndex = (): void => {
      _lastRoomIndex = -1;
    };

    this._firstLetterToLowerCase = (str: string): string => {
      let strArr = str.split("");
      strArr[0] = strArr[0].toLowerCase();
      return strArr.join("");
    };

    this._wayDetector = (obj: Storage.TimerObj): Storage.TimerObj => {
      if (typeof obj.start === "number") {
        if (typeof obj.end === "number") {
          if (obj.start > obj.end) obj.way = "down";
          else obj.way = "up";
        } else {
          if (!obj.way) {
            obj.end = obj.start > 0 ? 0 : Infinity;
            obj.way = obj.start > 0 ? "down" : "up";
          }
        }
      } else if (obj.date) {
        let diff =
          this._dateDiff(obj.date) < 0
            ? -this._dateDiff(obj.date)
            : this._dateDiff(obj.date);
        if (this._dateDiff(obj.date) < 0) obj.way = "up";
        else obj.way = "down";

        delete obj.date;
        obj.start = Math.floor(diff);
      }

      return obj;
    };

    this._leftPad = (obj: Storage.TimerObj, option?): Storage.TimerObj => {
      if (!option || !option.leftPad) return obj;
      let selectedOption: string[];
      if (option.leftPad === true)
        selectedOption = ["Y", "M", "W", "D", "h", "m", "s"];
      else selectedOption = option.leftPad.split(":");

      let i: string,
        newObj: Storage.TimerObj = {};

      for (i in obj) {
        if (selectedOption.indexOf(i) > -1)
          newObj[i] = parseInt(obj[i]) < 10 ? "0" + obj[i] : obj[i];
      }

      (<any>Object).assign(obj, newObj);
      return obj;
    };

    this._dateComplete = (date: string): string => {
      let fullDateRegexResult: RegExpExecArray = this._getRegex(
        "fullDateRegex"
      ).exec(date);
      if (fullDateRegexResult) return fullDateRegexResult[0];

      let dateRegexResult: RegExpExecArray = this._getRegex("dateRegex").exec(
        date
      );
      if (dateRegexResult) return dateRegexResult[0] + " 00:00:00";

      let timeRegexResult: RegExpExecArray = this._getRegex("timeRegex").exec(
        date
      );
      if (timeRegexResult)
        return new Date().toLocaleDateString() + " " + timeRegexResult[0];

      return new Date().toLocaleString();
    };

    this._dateFormat = (date: string): string => {
      if (!this._getRegex("fullDateRegex").exec(date)) return date;

      const month: string[] = [
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

      let dateArr: string[],
        explodeDate: string[] = date.split(" "),
        activeMonth: string;
      if (!explodeDate[1]) explodeDate[1] = "";

      dateArr = explodeDate[0].split(".");
      activeMonth = month[Number(dateArr[1]) - 1];

      return `${activeMonth} ${dateArr[0]}, ${dateArr[2]} ${explodeDate[1]}`;
    };

    this._dateDiff = (date: string): number => {
      let dateMs: number, nowDateMs: number;

      if (!date) return 0;

      date = this._dateFormat(this._dateComplete(date));
      dateMs = new Date(date).getTime();
      nowDateMs = new Date().getTime();

      return (dateMs - nowDateMs) / 1000;
    };

    this._templateApply = (
      template: string,
      timeObj: Storage.TimerObj,
      option?
    ): string => {
      if (!template) template = "{h}:{m}:{s}";

      // passive
      const bracket: string =
        "\\/(\\[[^\\!&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])";
      const bracketPass: string =
        "\\/\\[(\\[[^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])\\]";
      const bracketInner: string =
        "[^\\/&^\\[]{0}\\[([^\\&^\\[&^\\]]*)\\{(.)\\}([^\\[]*)[^\\/]\\]";

      if (option && option.leftPad) timeObj = this._leftPad(timeObj, option);

      let i: string,
        bracketRegex: RegExp,
        bracketPassRegex: RegExp,
        bracketInnerRegex: RegExp,
        bracketRegexMatch: RegExpExecArray,
        bracketPassRegexMatch: RegExpExecArray,
        bracketInnerRegexMatch: RegExpExecArray;

      for (i in timeObj) {
        bracketInnerRegex = new RegExp(bracketInner.replace(".", i), "gmi");
        bracketInnerRegexMatch = bracketInnerRegex.exec(template);
        if (bracketInnerRegexMatch) {
          if (!parseInt(timeObj[i]))
            template = template.replace(bracketInnerRegex, "");
          else
            template = template.replace(bracketInnerRegex, `$1${timeObj[i]}$3`);
          continue;
        }

        bracketRegex = new RegExp(bracket.replace(".", i), "gmi");
        bracketRegexMatch = bracketRegex.exec(template);
        if (bracketRegexMatch) {
          template = template.replace(bracketRegex, `$1${timeObj[i]}$3$4`);
          continue;
        }

        bracketPassRegex = new RegExp(bracketPass.replace(".", i), "gmi");
        bracketPassRegexMatch = bracketPassRegex.exec(template);
        if (bracketPassRegexMatch) {
          if (!parseInt(timeObj[i]))
            template = template.replace(bracketPassRegex, "");
          else
            template = template.replace(
              bracketPassRegex,
              `$1${timeObj[i]}$3$4`
            );
          continue;
        }

        template = template.replace("{" + i + "}", timeObj[i]);
      }

      return template;
    };

    this._timeFormat = (
      second: number | string,
      option?
    ): Storage.Format | boolean => {
      second = parseInt(second.toString());
      if (isNaN(second)) second = 0;

      let ms: number = second * 1000;

      const oneYearMs: number = 31556926000,
        oneMonthMs: number = 2629743830,
        oneWeekMs: number = 604800000,
        oneDayMs: number = 86400000,
        oneHourMs: number = 3600000,
        oneMinuteMs: number = 60000,
        oneSecondMs: number = 1000;

      const ruler: Storage.TimerObj = {
        Y: oneYearMs,
        M: oneMonthMs,
        W: oneWeekMs,
        D: oneDayMs,
        h: oneHourMs,
        m: oneMinuteMs,
        s: oneSecondMs
      };

      let selectedFormat: string[];
      if (!option) selectedFormat = ["Y", "M", "W", "D", "h", "m", "s"];
      else selectedFormat = option.timeFormat.split(":");

      let i: string;
      let output: Storage.Format = {};

      for (i in ruler) {
        if (selectedFormat.indexOf(i) > -1) {
          output[i] = Math.floor(ms / ruler[i]);
          ms %= ruler[i];
        }
      }

      return output;
    };

    this._machine = (obj: Storage.TimerObj) => {
      if (typeof obj.start !== "number" && !obj.date)
        clearInterval(obj.process);

      let defaultConfig: object = {
        timeFormat: "h:m:s",
        leftPad: "h:m:s"
      };

      obj.config = (<any>Object).assign(defaultConfig, obj.config);

      if (obj.onInterval) {
        //@ts-ignore
        obj.onInterval(obj);
      }

      if (obj.target) {
        let content: string = this._templateApply(
          obj.template,
          this._timeFormat(obj.start, obj.config),
          obj.config
        );

        let prevContent: string = (<HTMLElement>obj.target).innerHTML;
        if (prevContent !== content)
          (<HTMLElement>obj.target).innerHTML = content;
      }
      if (obj.way === "up") obj.start++;
      else obj.start--;
      if (obj.start === obj.end - 1) {
        clearInterval(obj.process);
        if (obj.onEnd) {
          //@ts-ignore
          obj.onEnd(obj);
        }
        return false;
      }
    };
  }

  add(obj: Storage.TimerObj | Storage.TimerObj[]): Mastertime {
    if (!obj) return this;

    let roomIndex: number = this._createTimeBaseRoom();
    let objs: Storage.TimerObj;

    if (!Array.isArray(obj)) objs = [obj];
    else objs = obj;

    let i: number = 0;
    let len: number = objs.length;

    for (; i < len; i++) {
      let activeObj = this._wayDetector(objs[i]);

      if (!activeObj.start && !activeObj.date) continue;

      if (activeObj.target) {
        let elems: NodeList = document.querySelectorAll(objs[i].target);
        let j: number = 0;
        let elemLen: number = elems.length;

        for (; j < elemLen; j++) {
          let uniqueObj = (<any>Object).assign({}, activeObj);
          uniqueObj.target = elems[j];
          uniqueObj.onStart = (function(uniqueObj) {
            uniqueObj.onStart(uniqueObj);
          })(uniqueObj);
          // @ts-ignore
          uniqueObj.template = uniqueObj.template || elems[j].innerHTML;

          this._putTimeBaseRoom(roomIndex, uniqueObj);
        }
      } else {
        this._putTimeBaseRoom(roomIndex, (<any>Object).assign({}, activeObj));
      }
    }

    this._setLastRoomIndex(roomIndex);
    return this;
  }

  build(selector: string, option?): Mastertime {
    if (!selector) return this;

    let elems: NodeList = document.querySelectorAll(selector);

    if (elems.length === 0) return this;

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
    let len: number = elems.length;

    for (; i < len; i++) {
      let activeElement: HTMLElement = <HTMLElement>elems[i];
      let rawObj: Storage.Build = {};
      let j: number = 0;
      let attrListLen: number = attrList.length;

      for (; j < attrListLen; j++) {
        let val: string = activeElement.getAttribute(attrList[j]);
        if (val) {
          activeElement.removeAttribute(attrList[j]);
          let key: string = this._firstLetterToLowerCase(
            attrList[j].substr(2, 10)
          );
          rawObj[key] = val;
        }
      }

      if (!rawObj.start && !rawObj.date) continue;

      let eventObj: Storage.Event = {};

      if (rawObj.onStart && typeof rawObj.onStart === "string")
        eventObj.onStart = new Function("event", rawObj.onStart);
      if (rawObj.onInterval && typeof rawObj.onInterval === "string")
        eventObj.onInterval = new Function("event", rawObj.onInterval);
      if (rawObj.onEnd && typeof rawObj.onEnd === "string")
        eventObj.onEnd = new Function("event", rawObj.onEnd);

      let timerObj: Storage.TimerObj = (<any>Object).assign(
        {},
        this._wayDetector(rawObj),
        eventObj,
        { target: activeElement, config: option }
      );

      this._putTimeBaseRoom(roomIndex, timerObj);
    }

    this._setLastRoomIndex(roomIndex);
    return this;
  }

  run() {
    let roomIndex: number = this._getLastRoomIndex();
    if (roomIndex === -1) return false;

    let timerObjList: Storage.TimerObj[] = this._getTimeBase()[roomIndex];
    let i: number = 0;
    let len: number = timerObjList.length;

    for (; i < len; i++) {
      let activeObj: Storage.TimerObj = timerObjList[i];
      if (activeObj.onStart) {
        //@ts-ignore
        activeObj.onStart(activeObj);
      }
      this._machine(activeObj);
      activeObj.process = setInterval(() => {
        this._machine(activeObj);
      }, 1000);
    }

    this._resetLastRoomIndex();
  }
}
