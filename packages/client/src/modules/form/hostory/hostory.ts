export class History<T> {
  private stack: string[] = [];
  private cursor = 0;
  private paused = false;
  private limit = 50;

  constructor(initial: T) {
    this.stack = [JSON.stringify(initial)];
  }

  snapshot(state: T) {
    if (this.paused) return;

    this.stack = this.stack.slice(0, this.cursor + 1);
    this.stack.push(JSON.stringify(state));
    this.cursor = this.stack.length - 1;

    if (this.stack.length > this.limit) {
      this.stack.shift();
      this.cursor--;
    }
  }

  undo(): T | null {
    if (this.cursor <= 0) return null;

    this.paused = true;
    this.cursor--;
    const state = JSON.parse(this.stack[this.cursor]);
    this.paused = false;

    return state;
  }

  redo(): T | null {
    if (this.cursor >= this.stack.length - 1) return null;

    this.paused = true;
    this.cursor++;
    const state = JSON.parse(this.stack[this.cursor]);
    this.paused = false;

    return state;
  }

  canUndo() {
    return this.cursor > 0;
  }

  canRedo() {
    return this.cursor < this.stack.length - 1;
  }
}












