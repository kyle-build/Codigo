import { makeAutoObservable } from "mobx";

export function createStoreAuth() {
  return makeAutoObservable({
    token: localStorage.getItem("token") ?? "",
    details: null,
  });
}












