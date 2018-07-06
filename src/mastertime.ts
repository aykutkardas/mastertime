namespace Storage {
  export interface Storage {
    [index: number]: Storage.TimerObj[];
  }

  export interface TimerObj {
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
}

class Mastertime {
  _getTimeBase: Function;
  _createTimeBaseRoom: Function;
  _putTimeBaseRoom: Function;
  _getLastRoomIndex: Function;
  _setLastRoomIndex: Function;
  _resetLastRoomIndex: Function;
  _wayDetector: Function;

  constructor() {
    const _storage:Storage.TimerObj[][] = [];
    let _lastRoomIndex = -1;

    this._getTimeBase = () => _storage;

    // Create timebase room and return room index.
    this._createTimeBaseRoom = (): number => {
      let index = _storage.length;
      _storage[index] = [];
      return index;
    };

    this._putTimeBaseRoom = (index: number, obj: Storage.TimerObj): void => {
      _storage[index].push(obj);
    };

    this._getLastRoomIndex = (): number => _lastRoomIndex;

    this._setLastRoomIndex = (index: number): void => { _lastRoomIndex = index };

    this._resetLastRoomIndex = (): void => { _lastRoomIndex = -1 };

    this._wayDetector = (obj: Storage.TimerObj): Storage.TimerObj => {
      if(obj.start) {
        if(obj.end) {
          if(obj.start > obj.end) obj.way = 'down';
          else obj.way = 'up';
        } else {
          if(!obj.way) {
            obj.end = (obj.start > 0) ? 0 : Infinity;
            obj.way = (obj.start > 0) ? 'down' : 'up'; 
          }
        }
      } else if(obj.end) {
        obj.start = 0;
        obj.way = (obj.end > 0) ? 'up' : 'down';
      }
      
      return obj;
    }

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
      
      if(!activeObj.start && !activeObj.end && !activeObj.way) continue;

      if (activeObj.target) {
    
        let elems: NodeList = document.querySelectorAll(objs[i].target);
        let j: number = 0;
        let elemLen: number = elems.length;

        for (; j < elemLen; j++) {
          activeObj.target = elems[j];
          this._putTimeBaseRoom(roomIndex, activeObj);
        }

      } else {
        this._putTimeBaseRoom(roomIndex, activeObj);
      }

    }

    this._setLastRoomIndex(roomIndex);
    return this;
  }

  run() {
    let roomIndex: number = this._getLastRoomIndex();
    let objs: Storage.TimerObj[] = this._getTimeBase()[roomIndex];
    let i:number = 0;
    let len: number = objs.length;

    for(; i < len; i++) {
      console.log(objs, i, objs[i], objs[i].start)
      setInterval(
        () => {console.log(objs[i]); /*  objs[i].start++; (<HTMLElement>objs[i].target).innerHTML = (objs[i].start).toString(); */},
        1000
      )
    }
    
    this._resetLastRoomIndex();
  }
}
