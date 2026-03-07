import { makeAutoObservable } from "mobx";

interface IStorePage {
  title: string;
  description: string;
}

export function createStorePage() {
  return makeAutoObservable<IStorePage>({
    title: "Codigo低代码平台",
    description: "Codigo低代码开发页面详情",
  });
}

export type TStorePage = ReturnType<typeof createStorePage>;
