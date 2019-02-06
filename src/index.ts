class MasterTime {
  timeStorage = new MasterTimeStorage();

  create(item: MTInputObject | MTInputObject[]) {
    if (this._checkValue(item)) {
      return false;
    }

    if (!Array.isArray(item)) {
      item = [item];
    }

    const newItems = this._enchantment(item);
    const roomIndex = this.timeStorage.createRoom();

    this.timeStorage.setItemsToRoom(roomIndex, newItems);
  }

  run(roomIndex?: number) {
    if (!roomIndex) {
      roomIndex = this.timeStorage.lastIndex();
    }

    if (roomIndex < 0) {
      return false;
    }

    const payload: MTStorageObject[] = this.timeStorage.storage[roomIndex];

    if (!Array.isArray(payload)) {
      return false;
    }

    payload.forEach((item, index) => {
      item.onStart && item.onStart(item);
      this._mechanic(item);
      item.process = setInterval(() => this._mechanic(item), 1000);
    });
  }

  _mechanic(item: MTStorageObject) {
    item.onInterval && item.onInterval(item);


    const formattedTime = this._timeFormat(item.time, item.config);
    const templatedValue = this._templateApply(
      item.template,
      formattedTime,
      item.config
    );

    if (templatedValue) {
      item.value = templatedValue;
    }

    if (item.time === item.end) {
      clearInterval(item.process);
      item.onEnd && item.onEnd(item);
      return;
    }

    if (!item.direction) {
      if (item.start > item.end) {
        item.direction = "down";
      } else {
        item.direction = "up";
      }
    }

    if (item.direction === "up") {
      item.time++;
      return;
    }
    item.time--;
  }

  _enchantment(items: MTInputObject[]): MTStorageObject[] {
    const enchantedItems: MTStorageObject[] = items.map(item => {
      const enchantedItem = {
        start: 0,
        end: Infinity,
        time: item.start || 0,
        value: "",
        process: 0,
        direction: "",
        template: "",
        config: {},
        ...item
      };

      return enchantedItem;
    });

    return enchantedItems;
  }

  _checkValue(item: any) {
    const isObject = toString.call(item) !== "[Object object]";
    const isArray = Array.isArray(item);

    if (!item || (!isObject && !isArray)) {
      return false;
    }
  }

  _templateApply(template: string, payload: Object, option?: MTOptions) {
    if (!payload) {
      return false;
    }

    if (typeof template !== "string" || !template.trim.length) {
      template = "{h}:{m}:{s}";
    }

    if (option && option.leftPad) {
      payload = this._leftPad(payload);
    }

    const parserRegex = {
      inner: "\\/(\\[[^\\!&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])",
      pass: "[^\\/&^\\[]{0}\\[([^\\&^\\[&^\\]]*)\\{(.)\\}([^\\[]*)[^\\/]\\]"
    };

    Object.keys(payload).forEach(key => {
      const parseInner = new RegExp(parserRegex.inner.replace(".", key), "gmi");

      if (parseInner.exec(template)) {
        if (parseInt(payload[key]) === 0) {
          template = template.replace(parseInner, "");
        } else {
          template = template.replace(parseInner, `$1${payload[key]}$3`);
        }

        return;
      }

      const parsePass = new RegExp(parserRegex.pass.replace(".", key), "gmi");

      if (parsePass.exec(template)) {
        template = template.replace(parsePass, `$1${payload[key]}$3`);
        return;
      }

      template = template.replace(`{${key}}`, payload[key]);
    });

    return template;
  }

  _timeFormat(second: number, option?: MTOptions) {
    if (typeof second !== "number" || isNaN(second)) {
      second = 0;
    }

    const timeRuler = {
      Y: 31556926,
      M: 2629743.83,
      W: 604800,
      D: 86400,
      h: 3600,
      m: 60,
      s: 1
    };

    let selectedFormat = ["Y", "M", "W", "D", "h", "m", "s"];

    if (option && option.timeFormat) {
      selectedFormat = option.timeFormat.split(":");
    }

    const formattedTime = {};

    Object.keys(timeRuler).forEach(activeTime => {
      if (selectedFormat.includes(activeTime)) {
        formattedTime[activeTime] = Math.floor(
          second / timeRuler[activeTime]
        ).toString();

        second %= timeRuler[activeTime];
      }
    });

    return formattedTime;
  }

  _leftPad(payload: Object) {
    const selectedTimeOptions = ["Y", "M", "W", "D", "h", "m", "s"];

    const newPayload = {};

    Object.keys(payload).forEach(optionKey => {
      if (selectedTimeOptions.includes(optionKey)) {
        let value = payload[optionKey];

        if (parseInt(payload[optionKey]) < 10) {
          value = `0${payload[optionKey]}`;
        }

        newPayload[optionKey] = value;
      }
    });

    return { ...payload, ...newPayload };
  }
}

type MTOptions = {
  leftPad?: boolean;
  timeFormat?: string;
};

type MTInputObject = {
  name?: string;
  start?: number;
  end?: number;
  direction?: string;
  template?: string;
  onStart?: (obj: MTInputObject) => any;
  onInterval?: (obj: MTInputObject) => any;
  onEnd?: (obj: MTInputObject) => any;
};

type MTStorageObject = {
  start: number;
  end: number;
  time: number;
  value: string;
  direction: string;
  template: string;
  process: number;
  config: MTOptions;
  onStart?: (obj: MTInputObject) => any;
  onInterval?: (obj: MTInputObject) => any;
  onEnd?: (obj: MTInputObject) => any;
};

class MasterTimeStorage {
  storage: MTStorageObject[][] = [];


  lastIndex() {
    return this.storage.length - 1;
  }

  setItemsToRoom(index: number, items: MTStorageObject[]) {
    this.storage[index] = items;
  }

  createRoom() {
    const index = this.lastIndex() + 1;
    this.storage[index] = [];
    return index;
  }

  putItemToRoom(index: number, object: MTStorageObject) {
    this.storage[index].push(object);
  }
}

export default new MasterTime();
