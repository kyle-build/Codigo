import { makeAutoObservable } from "mobx";

export type DeviceType = "mobile" | "pc";
export type CodeFramework = "react" | "vue";

interface IStorePage {
  title: string;
  description: string;
  tdk: string;
  deviceType: DeviceType;
  canvasWidth: number;
  canvasHeight: number;
  codeFramework: CodeFramework;
}

export function createStorePage() {
  return makeAutoObservable<IStorePage>({
    title: "Codigo低代码平台",
    description: "Codigo低代码开发页面详情",
    tdk: "lowcode platform, lowcode development, lowcode page details",
    deviceType: "mobile",
    canvasWidth: 380,
    canvasHeight: 700,
    codeFramework: "react",
  });
}

export type TStorePage = ReturnType<typeof createStorePage>;












