// https://github.com/petkaantonov/deque for speed
// an alternative to using push and unshift on an Array as a que

const DEQUE_MAX_CAPACITY = (1 << 30) | 0;
const DEQUE_MIN_CAPACITY = 16;

export default class Deque<T> {
  private _capacity;
  private _length = 0;
  private _front = 0;
  constructor(capacity: number);
  constructor(source: T[]);
  constructor(capacityOrSource: T[]|number = 0) {
    this._capacity = getCapacity(capacityOrSource);
    if (isArray(capacityOrSource)) {
      const len = capacityOrSource.length;
      for (let i = 0; i < len; ++i) {
          this[i] = capacityOrSource[i];
      }
      this._length = len;
    }
  }
  toArray() {
    const len = this._length;
    const ret = new Array<T>(len);
    const front = this._front;
    const capacity = this._capacity;
    for (let i = 0; i < len; ++i) {
        ret[i] = this[(front + i) & (capacity - 1)];
    }
    return ret;
  }
  push(...items: T[]) {
    const numItems = items.length;
    let length = this._length;
    if (numItems > 1) {
        const capacity = this._capacity;
        if (length + numItems > capacity) {
            for (let i = 0; i < numItems; ++i) {
                this.checkCapacity(length + 1);
                const j = (this._front + length) & (this._capacity - 1);
                this[j] = items[i];
                ++length;
                this._length = length;
            }
            return length;
        } else {
            let front = this._front;
            for (let i = 0; i < numItems; ++i) {
                this[(front + length) & (capacity - 1)] = items[i];
                ++front;
            }
            this._length = length + numItems;
            return length + numItems;
        }

    } else if (numItems === 0) {
      return length;
    } else {
      this.checkCapacity(length + 1);
      const i = (this._front + length) & (this._capacity - 1);
      this[i] = items[0];
      this._length = length + 1;
      return length + 1;  
    }
  }
  pop(): T {
    const length = this._length;
    if (length === 0) {
        return undefined;
    }
    const i = (this._front + length - 1) & (this._capacity - 1);
    const ret = this[i];
    this[i] = undefined;
    this._length = length - 1;
    return ret;
  }
  shift(): T {
    const length = this._length;
    if (length === 0) {
        return undefined;
    }
    const front = this._front;
    const ret = this[front];
    this[front] = undefined;
    this._front = (front + 1) & (this._capacity - 1);
    this._length = length - 1;
    return ret;
  }
  unshift(...items: T[]) {
    let length = this._length;
    const numItems = items.length;


    if (numItems > 1) {
        const capacity = this._capacity;
        if (length + numItems > capacity) {
            for (let i = numItems - 1; i >= 0; --i) {
                this.checkCapacity(length + 1);
                const capacity = this._capacity;
                const j = (((( this._front - 1 ) & ( capacity - 1) ) ^ capacity ) - capacity );
                this[j] = arguments[i];
                ++length;
                this._length = length;
                this._front = j;
            }
            return length;
        }
        else {
            let front = this._front;
            for (let i = numItems - 1; i >= 0; --i) {
                const j = (((( front - 1 ) & ( capacity - 1) ) ^ capacity ) - capacity );
                this[j] = arguments[i];
                front = j;
            }
            this._front = front;
            this._length = length + numItems;
            return length + numItems;
        }
    } else if (numItems === 0) {
      return length;
    } else {
      this.checkCapacity(length + 1);
      const capacity = this._capacity;
      const i = (((( this._front - 1 ) & ( capacity - 1) ) ^ capacity ) - capacity );
      this[i] = items[0];
      this._length = length + 1;
      this._front = i;
      return length + 1;
    }
  }
  peekBack(): T {
    const length = this._length;
    if (length === 0) {
      return undefined;
    }
    const index = (this._front + length - 1) & (this._capacity - 1);
    return this[index];
  }
  peekFront(): T {
    if (this._length === 0) {
      return undefined;
    }
    return this[this._front];
  }
  get(index: number): T {
    let i = index;
    if ((i !== (i | 0))) {
      return undefined;
    }
    const len = this._length;
    if (i < 0) {
      i = i + len;
    }
    if (i < 0 || i >= len) {
      return undefined;
    }
    return this[(this._front + i) & (this._capacity - 1)];
  }
  isEmpty() {
    return this._length === 0;
  }
  clear() {
    const len = this._length;
    const front = this._front;
    const capacity = this._capacity;
    for (let i = 0; i < len; ++i) {
      this[(front + i) & (capacity - 1)] = undefined;
    }
    this._length = 0;
    this._front = 0;
  }
  toString() {
    return this.toArray().toString();
  }
  valueOf = toString;
  removeFront = this.shift;
  removeBack = this.pop;
  insertFront = this.unshift;
  insertBack = this.push;
  enqueue = this.push;
  dequeue = this.shift;
  toJSON = this.toArray;
  get length() {
    return this._length;
  }
  private checkCapacity(size: number) {
    if (this._capacity < size) {
      this.resizeTo(getCapacity(this._capacity * 1.5 + 16));
    }
  };

  private resizeTo(capacity: number) {
    const oldCapacity = this._capacity;
    this._capacity = capacity;
    const front = this._front;
    const length = this._length;
    if (front + length > oldCapacity) {
      const moveItemsCount = (front + length) & (oldCapacity - 1);
      arrayMove(this, 0, this, oldCapacity, moveItemsCount);
    }
  };

}

const isArray = Array.isArray;

function arrayMove<T>(src: any, srcIndex: number, dst: any, dstIndex: number, len: number) {
  for (let i = 0; i < len; ++i) {
    dst[i + dstIndex] = src[i + srcIndex];
    src[i + srcIndex] = undefined;
  }
}

function pow2AtLeast(n: number) {
  n = n >>> 0;
  n = n - 1;
  n = n | (n >> 1);
  n = n | (n >> 2);
  n = n | (n >> 4);
  n = n | (n >> 8);
  n = n | (n >> 16);
  return n + 1;
}

function getCapacity(capacityOrSource: any[]|number) {
  if (typeof capacityOrSource !== "number") {
    if (isArray(capacityOrSource)) {
      capacityOrSource = capacityOrSource.length;
    }
    else {
      return DEQUE_MIN_CAPACITY;
    }
  }
  return pow2AtLeast(
    Math.min(Math.max(DEQUE_MIN_CAPACITY, capacityOrSource), DEQUE_MAX_CAPACITY)
  );
}