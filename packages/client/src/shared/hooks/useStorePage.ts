import { action } from "mobx";
import { createStorePage } from "@/shared/stores";
import type { TStorePage, DeviceType, CodeFramework } from "@/shared/stores";
import { useStorePermission } from "./useStorePermission";

const storePage = createStorePage();

export function useStorePage() {
  const { ensurePermission, addOperationLog } = useStorePermission();

  /**
   * 设置页面标题
   * @param title - 页面标题
   */
  const setPageTitle = action((title: string) => {
    if (!ensurePermission("edit_content", "当前角色不能修改页面标题")) return;
    storePage.title = title;
    addOperationLog("update_page", "页面标题");
  });

  const setDeviceType = action((type: DeviceType) => {
    if (!ensurePermission("edit_content", "当前角色不能修改画布设置")) return;
    storePage.deviceType = type;
    if (type === "mobile") {
      storePage.canvasWidth = 380;
      storePage.canvasHeight = 700;
    } else {
      storePage.canvasWidth = 1024; // Default PC width
      storePage.canvasHeight = 768; // Default PC height
    }
    addOperationLog("update_page", "终端模式");
  });

  const setCanvasSize = action((width: number, height: number) => {
    if (!ensurePermission("edit_content", "当前角色不能修改画布尺寸")) return;
    storePage.canvasWidth = width;
    storePage.canvasHeight = height;
    addOperationLog("update_page", "画布尺寸");
  });

  const setCodeFramework = action((framework: CodeFramework) => {
    if (!ensurePermission("edit_content", "当前角色不能修改源码框架")) return;
    storePage.codeFramework = framework;
    addOperationLog("update_page", "源码框架");
  });

  /**
   * 更新页面信息
   * @param page - 部分页面信息
   */
  const updatePage = action((page: Partial<TStorePage>) => {
    if (!ensurePermission("edit_content", "当前角色不能修改页面信息")) return;
    if (!page) return;
    for (const [key, value] of Object.entries(page))
      // @ts-ignore
      storePage[key as keyof TStorePage] = value;
    addOperationLog("update_page", "页面信息");
  });

  return {
    updatePage,
    setPageTitle,
    setDeviceType,
    setCanvasSize,
    setCodeFramework,
    store: storePage,
  };
}












