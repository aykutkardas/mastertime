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
      roomIndex = this.timeStorage.lastIndex;
    }

    if (roomIndex < 0) {
      return false;
    }

    const payload: MTStorageObject[] = this.timeStorage[roomIndex];

    payload.forEach((item, index) => {
      item.onStart && item.onStart(item);
      this._mechanic(item);
      item.process = setInterval(() => this._mechanic(item), 1000);
    });
  }

  _mechanic(item: MTStorageObject) {
    item.onInterval && item.onInterval(item);

    const value = "";

    item.value = value;

    if (item.time === item.end) {
      clearInterval(item.process);
      item.onEnd && item.onEnd(item);
      return;
    }

    if (!item.direction) {
      if (item.start > item.end) {
        item.direction = "up";
      } else {
        item.direction = "down";
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
}

type MTInputObject = {
  name?: string;
  start?: number;
  end?: number;
  direction?: string;
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
  process: number;
  onStart?: (obj: MTInputObject) => any;
  onInterval?: (obj: MTInputObject) => any;
  onEnd?: (obj: MTInputObject) => any;
};

class MasterTimeStorage {
  _storage: MTStorageObject[][] = [];

  get storage() {
    return this.storage;
  }

  get lastIndex() {
    return this.storage.length - 1;
  }

  setItemsToRoom(index: number, items: MTStorageObject[]) {
    this.storage[index] = items;
  }

  createRoom() {
    const index = this.lastIndex + 1;
    this._storage[index] = [];
    return index;
  }

  putItemToRoom(index: number, object: MTStorageObject) {
    this._storage[index].push(object);
  }
}

export default new MasterTime;
