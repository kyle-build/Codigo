import { makeAutoObservable } from "mobx";

class StudioStore {
  currentModule: string = "form";

  constructor() {
    makeAutoObservable(this);
  }

  setModule(name: string) {
    this.currentModule = name;
  }
}

export const studioStore = new StudioStore();












