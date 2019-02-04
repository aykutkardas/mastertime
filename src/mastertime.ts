export default class MasterTime {
  regexStore = {
    fullDateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})\ ([\d]{2}\:[\d]{2}\:[\d]{2})/,
    dateRegex: /([\d]{2}\.[\d]{2}\.[\d]{4})/,
    timeRegex: /([\d]{2}\:[\d]{2}\:[\d]{2})/
  };

  storage = [];

  lastRoomIndex = -1;

  createTimeBaseRoom(): number {
    let index = this.storage.length;
    this.storage[index] = [];
    this.lastRoomIndex = index;
    return index;
  }

  putTimeBaseRoom(roomIndex: number, payload: Object): void {
    const { storage } = this;
    if (storage[roomIndex] && payload) {
      this.storage[roomIndex].push(payload);
    }
  }

  build(payload: Object | Object[]) {
    if (!payload) {
      return this;
    }

    if (Array.isArray(payload) && !payload.length) {
      return this;
    }

    if (!Array.isArray(payload)) {
      payload = [payload];
    }

    let activeRoomIndex = this.createTimeBaseRoom();

    (<Object[]>payload).forEach(item => {
      this.putTimeBaseRoom(activeRoomIndex, item);
    });

    return this;
  }

  run(roomIndex?: number) {
    if (!roomIndex) {
      roomIndex = this.lastRoomIndex;
    }

    if (roomIndex === -1) {
      return false;
    }

    const payload: PayloadType[] = this.storage[roomIndex];

    payload.forEach((item, index) => {
      if (item.onStart) {
        item.onStart(item);
      }

      this.__machine__(item);
      item.process = setInterval(() => this.__machine__(item), 1000);
    });
  }

  __machine__(payload: PayloadType): void {
    if (typeof payload.start !== "number") {
      clearInterval(payload.process);
    }

    if (typeof payload.start !== "number" && !payload.date) {
      clearInterval(payload.process);
    }

    if (payload.onInterval) {
      payload.onInterval(payload);
    }

    let content: string = this.__templateApply__(
      payload.template,
      this._timeFormat(payload.start, payload.config),
      payload.config
    );

    payload.value = content || "";

    if (payload.start === payload.end) {
      clearInterval(payload.process);
      if (payload.onEnd) {
        payload.onEnd(payload);
        return;
      }
    }

    if (payload.way === "up") {
      payload.start++;
    } else {
      payload.start--;
    }

    return;
  }

  _leftPad(payload: PayloadType) {
    let selectedOption = ["Y", "M", "W", "D", "h", "m", "s"];

    let timeType: string,
      newPayload = {};

    for (timeType in payload) {
      if (selectedOption.indexOf(timeType) > -1)
        newPayload[timeType] =
          parseInt(payload[timeType]) < 10
            ? "0" + payload[timeType]
            : payload[timeType];
    }

    (<any>Object).assign(payload, newPayload);

    return payload;
  }

  _timeFormat(second: number, option?: TemplateOptionType) {
    if ("number" !== typeof second) second = parseInt(second);

    if (isNaN(second)) second = 0;

    const ruler = {
      Y: 31556926,
      M: 2629743.83,
      W: 604800,
      D: 86400,
      h: 3600,
      m: 60,
      s: 1
    };

    let selectedFormat: string[];

    if (!option || !option.timeFormat)
      selectedFormat = ["Y", "M", "W", "D", "h", "m", "s"];
    else selectedFormat = option.timeFormat.split(":");

    let timeType: string;
    let payload = {};

    for (timeType in ruler) {
      if (selectedFormat.indexOf(timeType) > -1) {
        payload[timeType] = Math.floor(second / ruler[timeType]).toString();
        second %= ruler[timeType];
      }
    }

    return payload;
  }

  __templateApply__(
    template: string,
    payload: PayloadType,
    option?: TemplateOptionType
  ) {
    const defaultTemplate = "{h}:{m}:{s}";

    if (typeof template !== "string" || template.trim().length < 1) {
      template = defaultTemplate;
    }

    const bracketInner: string =
      "\\/(\\[[^\\!&^\\[&^\\]]*)\\{(.)\\}([^\\[&^\\]]*)\\/(\\])";
    const bracketPass: string =
      "[^\\/&^\\[]{0}\\[([^\\&^\\[&^\\]]*)\\{(.)\\}([^\\[]*)[^\\/]\\]";

    if (option && option.leftPad) {
      payload = this._leftPad(payload);
    }

    let timeType: string;
    let bracketPassRegex: RegExp;
    let bracketInnerRegex: RegExp;
    let bracketInnerRegexMatch: RegExpExecArray;
    let bracketPassRegexMatch: RegExpExecArray;

    for (timeType in payload) {
      bracketInnerRegex = new RegExp(
        bracketInner.replace(".", timeType),
        "gmi"
      );
      bracketInnerRegexMatch = bracketInnerRegex.exec(template);
      if (bracketInnerRegexMatch) {
        if (parseInt(payload[timeType]) === 0)
          template = template.replace(bracketInnerRegex, "");
        else
          template = template.replace(
            bracketInnerRegex,
            `$1${payload[timeType]}$3`
          );

        continue;
      }

      bracketPassRegex = new RegExp(bracketPass.replace(".", timeType), "gmi");
      bracketPassRegexMatch = bracketPassRegex.exec(template);

      if (bracketPassRegexMatch) {
        template = template.replace(
          bracketPassRegex,
          `$1${payload[timeType]}$3$4`
        );
        continue;
      }

      template = template.replace("{" + timeType + "}", payload[timeType]);
    }

    return template;
  }
}

type PayloadType = {
  start?: number;
  end?: number;
  time?: number;
  way?: string;
  date?: string;
  template?: string;
  ago?: string;
  name?: string;
  onStart?: (payload: PayloadType) => {};
  onInterval?: (payload: PayloadType) => {};
  onEnd?: (payload: PayloadType) => {};
  process?: number;
  value?: string;
  config?: TemplateOptionType;
};

type TemplateOptionType = {
  leftPad?: boolean;
  timeFormat?: string;
};
