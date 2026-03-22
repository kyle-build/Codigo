import { ulid } from "ulid";
import { action, computed, toJS } from "mobx";
import type {
  TBasicComponentConfig,
  TComponentPropsUnion,
  TComponentTypes,
} from "@codigo/share";
import { calcValueByString } from "@codigo/share";
import { createStoreComponents } from "@/shared/stores";
import { arrayMove } from "@dnd-kit/sortable";
import { trackUndo } from "mobx-shallow-undo";
import { message } from "antd";
import type { TStoreComponents } from "@/shared/stores";
import { getLowCodePage } from "@/modules/editor/api/low-code";
import { useStorePage } from ".";
import { useStorePermission } from "./useStorePermission";

const storeComponents = createStoreComponents();
const codeSupportedTypes: TComponentTypes[] = [
  "video",
  "swiper",
  "qrcode",
  "card",
  "list",
  "image",
  "titleText",
  "split",
  "richText",
  "input",
  "textArea",
  "radio",
  "checkbox",
  "empty",
  "alert",
];

const layoutGapX = 380;
const layoutGapY = 200;
const layoutStartX = 32;
const layoutStartY = 24;

function getDefaultWidthByType(type: TComponentTypes): string {
  switch (type) {
    case "card":
    case "list":
    case "image":
    case "video":
    case "swiper":
    case "richText":
      return "420px";
    case "input":
    case "textArea":
    case "radio":
    case "checkbox":
      return "360px";
    case "split":
      return "520px";
    default:
      return "320px";
  }
}

function getDefaultPosition(index: number) {
  return {
    left: `${layoutStartX + (index % 3) * layoutGapX}px`,
    top: `${layoutStartY + Math.floor(index / 3) * layoutGapY}px`,
  };
}

function normalizeLayout(
  compConfigs: Record<string, TComponentPropsUnion>,
  order: string[],
) {
  order.forEach((id, index) => {
    const comp = compConfigs[id];
    if (!comp) return;
    const nextStyles = { ...(comp.styles ?? {}) };
    const hasPosition =
      nextStyles.left !== undefined && nextStyles.top !== undefined;
    const fallbackPosition = getDefaultPosition(index);

    nextStyles.position = "absolute";
    nextStyles.left = hasPosition ? nextStyles.left : fallbackPosition.left;
    nextStyles.top = hasPosition ? nextStyles.top : fallbackPosition.top;
    nextStyles.width =
      nextStyles.width === "100%" && !hasPosition
        ? getDefaultWidthByType(comp.type)
        : (nextStyles.width ?? getDefaultWidthByType(comp.type));

    comp.styles = nextStyles;
  });
}

// 撤销前进的插件
const sotreComponentsUndoer = trackUndo(
  () => toJS(storeComponents),
  (value) => {
    const { _replace } = useStoreComponents();
    _replace(value);
  },
);

export function useStoreComponents() {
  const { ensurePermission, addOperationLog } = useStorePermission();

  // 默认选中的组件
  const setCurrentComponent = action((id: string) => {
    storeComponents.currentCompConfig = id;
  });

  // 定义添加组件的函数
  const push = action(
    (type: TComponentTypes, position?: { left: number; top: number }) => {
      if (!ensurePermission("edit_structure", "当前角色不能新增组件")) return;
      if (!storeComponents.compConfigs) {
        storeComponents.compConfigs = {};
      }

      const defaultPosition = getDefaultPosition(
        storeComponents.sortableCompConfig.length,
      );
      const comp: TComponentPropsUnion = {
        id: ulid(),
        type,
        props: {},
        styles: {
          position: "absolute",
          left:
            position?.left !== undefined
              ? `${Math.max(0, Math.round(position.left))}px`
              : defaultPosition.left,
          top:
            position?.top !== undefined
              ? `${Math.max(0, Math.round(position.top))}px`
              : defaultPosition.top,
          width: getDefaultWidthByType(type),
        },
      };

      storeComponents.compConfigs[comp.id] = comp;
      storeComponents.sortableCompConfig.push(comp.id);

      setCurrentComponent(comp.id);
      addOperationLog("add_component", type);
    },
  );

  // 定义根据id获取组件配置的函数
  const getComponentById = action((id: string) => {
    return storeComponents.compConfigs[id];
  });

  // 判断是否为当前组件
  const isCurrentComponent = action((compConfig: TComponentPropsUnion) => {
    return getCurrentComponentConfig.get()?.id === compConfig.id;
  });

  // 返回默认选中组件属性信息
  const getCurrentComponentConfig = computed(() => {
    return storeComponents.currentCompConfig
      ? storeComponents.compConfigs[storeComponents.currentCompConfig]
      : null;
  });

  // 定义根据props更新当前组件的函数
  const updateCurrentComponent = action(
    (compConfig: TComponentPropsUnion["props"]) => {
      if (!ensurePermission("edit_content", "当前角色不能修改组件内容")) return;
      // 遍历传入的compConfig对象，更新当前组件配置的props属性
      const curCompConfig = getCurrentComponentConfig.get();
      if (!curCompConfig) return;

      for (const [key, value] of Object.entries(compConfig)) {
        // 更新当前组件配置的props属性
        // @ts-expect-error ignore type
        curCompConfig.props[key] = calcValueByString(value);
      }
      addOperationLog("update_component", curCompConfig.type);
    },
  );

  // 定义更新当前组件样式的函数
  const updateCurrentComponentStyles = action((styles: Record<string, any>) => {
    if (!ensurePermission("edit_content", "当前角色不能修改组件样式")) return;
    const curCompConfig = getCurrentComponentConfig.get();
    if (!curCompConfig) return;

    if (!curCompConfig.styles) {
      curCompConfig.styles = {};
    }

    for (const [key, value] of Object.entries(styles)) {
      // @ts-expect-error ignore type
      curCompConfig.styles[key] = calcValueByString(value);
    }
    addOperationLog("update_style", curCompConfig.type);
  });

  const updateComponentPosition = action(
    (id: string, left: number, top: number, silent: boolean = false) => {
      if (!ensurePermission("edit_structure", "当前角色不能拖拽组件")) return;
      const curCompConfig = storeComponents.compConfigs[id];
      if (!curCompConfig) return;

      if (!curCompConfig.styles) {
        curCompConfig.styles = {};
      }

      curCompConfig.styles.position = "absolute";
      curCompConfig.styles.left = `${Math.max(0, Math.round(left))}px`;
      curCompConfig.styles.top = `${Math.max(0, Math.round(top))}px`;
      curCompConfig.styles.width =
        curCompConfig.styles.width ?? getDefaultWidthByType(curCompConfig.type);

      if (!silent) {
        addOperationLog("move_component", curCompConfig.type);
      }
    },
  );

  // 定义带有数组参数的更新当前组件配置的函数
  type TUpdateCurrentCompConfigWithArray = (args: {
    key: string;
    index: number;
    field: string;
    value: string;
  }) => void;
  const updateCurrentCompConfigWithArray: TUpdateCurrentCompConfigWithArray =
    action(({ key, index, field, value }) => {
      if (!ensurePermission("edit_content", "当前角色不能修改组件内容")) return;
      // 获取当前组件配置
      const curCompConfig = getCurrentComponentConfig.get();
      if (!curCompConfig) return;

      // 更新当前组件配置的props属性
      // @ts-expect-error typescript无法正确推断可选类型
      curCompConfig.props[key][index][field] = value;
      addOperationLog("update_component", curCompConfig.type);
    });

  // 定义展开或者折叠组件列表的函数
  const setItemsExpandIndex = action((index: number) => {
    storeComponents.itemsExpandIndex = index;
  });

  // 定义撤销操作的函数
  const undo = action(() => {
    if (!ensurePermission("edit_content", "当前角色不能撤销操作")) return;
    // 判断有无上一步
    if (!sotreComponentsUndoer.hasUndo) {
      message.warning("没有可撤销的操作");
      return;
    }
    // 执行撤销操作
    sotreComponentsUndoer.undo();
    addOperationLog("undo", "画布");
  });

  // 定义重做操作的函数
  const redo = action(() => {
    if (!ensurePermission("edit_content", "当前角色不能重做操作")) return;
    //  判断有无下一步
    if (!sotreComponentsUndoer.hasRedo) {
      message.warning("没有可重做的操作");
      return;
    }
    // 执行重做操作
    sotreComponentsUndoer.redo();
    addOperationLog("redo", "画布");
  });

  // 定义移动组件的函数
  const moveComponent: (pos: { oldIndex: number; newIndex: number }) => void =
    action(({ oldIndex, newIndex }) => {
      if (!ensurePermission("edit_structure", "当前角色不能调整组件顺序"))
        return;
      // arrayMove根据两个索引子排序数组，返回排序后的数组
      storeComponents.sortableCompConfig = arrayMove(
        storeComponents.sortableCompConfig,
        oldIndex,
        newIndex,
      );
      addOperationLog("move_component", `${oldIndex + 1} -> ${newIndex + 1}`);
    });

  // 定义向上移动组件的函数
  const moveUpComponent = action(() => {
    // 获取当前组件在数组中的旧索引
    const oldIndex = getCurrentComponentIndex.get();
    // 如果当前组件不是第一个组件，则执行移动操作
    if (getCurrentComponentIndex.get() !== 0) {
      moveComponent({
        oldIndex,
        newIndex: oldIndex - 1,
      });
    } else {
      message.warning("此组件已经是第一个了");
    }
  });

  // 定义向下移动组件的函数
  const moveDownComponent = action(() => {
    // 获取当前组件在数组中的旧索引
    const oldIndex = getCurrentComponentIndex.get();
    // 如果当前组件不是最后一个组件，则执行移动操作
    if (
      getCurrentComponentIndex.get() !==
      storeComponents.sortableCompConfig.length - 1
    ) {
      moveComponent({
        oldIndex,
        newIndex: oldIndex + 1,
      });
    } else {
      message.warning("此组件已经是最后一个了");
    }
  });

  // 定义复制当前组件的函数
  const copyCurrentComponent = action(() => {
    // 获取当前组件配置，在复制前先转换为JS对象
    const curCompConfig = getCurrentComponentConfig.get();
    if (!curCompConfig) return;

    // 复制当前组件配置，并保存到storeComponents.copyedCompConig中
    storeComponents.copyedCompConig = toJS(curCompConfig);
  });

  // 定义粘贴组件的函数
  const pasteCopyedComponent = action(() => {
    if (!ensurePermission("edit_structure", "当前角色不能粘贴组件")) return;
    // 如果不存在复制的组件配置，则返回
    if (!storeComponents.copyedCompConig) return;

    // 创建新的组件配置，深拷贝复制的对象，重新分配 id，否3则 id 跟复制前的yi'zhi
    const comp = {
      ...JSON.parse(JSON.stringify(storeComponents.copyedCompConig)),
      id: ulid(),
    };

    const left = Number.parseInt(String(comp.styles?.left ?? "0"), 10);
    const top = Number.parseInt(String(comp.styles?.top ?? "0"), 10);
    comp.styles = {
      ...(comp.styles ?? {}),
      position: "absolute",
      left: `${Number.isNaN(left) ? 24 : left + 24}px`,
      top: `${Number.isNaN(top) ? 24 : top + 24}px`,
      width: comp.styles?.width ?? getDefaultWidthByType(comp.type),
    };

    // 将新的组件配置添加到storeComponents.compConfigs中
    storeComponents.compConfigs[comp.id] = comp;
    // 将新的组件配置id添加到storeComponents.sortableCompConfig中
    storeComponents.sortableCompConfig.push(comp.id);
    // 设置当前组件配置为新添加的组件配置
    setCurrentComponent(comp.id);
    addOperationLog("add_component", "粘贴组件");
  });

  // 定义删除当前组件的函数
  const removeCurrentComponent = action(() => {
    if (!ensurePermission("edit_structure", "当前角色不能删除组件")) return;
    // 获取当前组件配置的id在storeComponents.sortableCompConfig中的索引
    const curCompConfig = getCurrentComponentConfig.get();
    if (!curCompConfig) return;

    const index = getCurrentComponentIndex.get();
    // 从storeComponents.sortableCompConfig中删除当前组件
    storeComponents.sortableCompConfig.splice(index, 1);
    // 从storeComponents.compConfigs中删除当前组件配置
    delete storeComponents.compConfigs[curCompConfig.id];

    // 如果当前组件被删除，则将当前组件配置设置为上一个组件的配置，如果不存在则设置为第一个组件的配置
    const rollbackIndex = index - 1 > 0 ? index - 1 : 0;
    storeComponents.currentCompConfig =
      storeComponents.sortableCompConfig[rollbackIndex] || null;
    addOperationLog("remove_component", curCompConfig.type);
  });

  // 定义替换组件配置的函数
  const _replace = action((value: TStoreComponents) => {
    storeComponents.compConfigs = value.compConfigs;
    storeComponents.currentCompConfig = value.currentCompConfig;
    storeComponents.sortableCompConfig = value.sortableCompConfig;
    normalizeLayout(
      storeComponents.compConfigs,
      storeComponents.sortableCompConfig,
    );
  });

  const replaceByCode = action(
    (
      components: Array<{
        id?: string;
        type: string;
        props?: Record<string, unknown>;
        styles?: TBasicComponentConfig["styles"];
      }>,
    ) => {
      if (!ensurePermission("edit_structure", "当前角色不能覆盖组件结构"))
        return;
      const nextCompConfigs: Record<string, TComponentPropsUnion> = {};
      const nextSortableCompConfig: string[] = [];
      const currentId = storeComponents.currentCompConfig;

      for (const item of components) {
        if (!codeSupportedTypes.includes(item.type as TComponentTypes))
          continue;

        const nextId = item.id || ulid();
        const nextComponent = {
          id: nextId,
          type: item.type as TComponentTypes,
          props: (item.props ?? {}) as TComponentPropsUnion["props"],
          styles: item.styles,
        } as TComponentPropsUnion;

        nextCompConfigs[nextId] = nextComponent;
        nextSortableCompConfig.push(nextId);
      }

      normalizeLayout(nextCompConfigs, nextSortableCompConfig);
      storeComponents.compConfigs = nextCompConfigs;
      storeComponents.sortableCompConfig = nextSortableCompConfig;
      storeComponents.currentCompConfig =
        currentId && nextCompConfigs[currentId]
          ? currentId
          : (nextSortableCompConfig[0] ?? null);
      addOperationLog(
        "ai_replace",
        `共 ${nextSortableCompConfig.length} 个组件`,
      );
    },
  );

  // 获取当前组件在数组中的索引的 computed property
  const getCurrentComponentIndex = computed(() => {
    // 返回storeComponents.sortableCompConfig中当前组件配置的id所在的位置
    return storeComponents.sortableCompConfig.indexOf(
      getCurrentComponentConfig.get()!.id,
    );
  });

  // 定义将组件存储到本地存储的函数
  const storeInLocalStorage = action(() => {
    if (!ensurePermission("save_draft", "当前角色不能保存草稿")) return;
    // 将组件配置、可排序组件配置、当前组件配置和存储时间保存到本地存储
    const compConfig = JSON.stringify(toJS(storeComponents.compConfigs));
    const sortableCompConfig = JSON.stringify(
      toJS(storeComponents.sortableCompConfig),
    );
    const currentCompConfig = JSON.stringify(
      toJS(storeComponents.currentCompConfig),
    );

    // Get current page store state
    const { store: pageStore } = useStorePage();
    const pageSettings = JSON.stringify({
      deviceType: pageStore.deviceType,
      canvasWidth: pageStore.canvasWidth,
      canvasHeight: pageStore.canvasHeight,
      codeFramework: pageStore.codeFramework,
    });

    localStorage.setItem("compConfig", compConfig);
    localStorage.setItem("sortableCompConfig", sortableCompConfig);
    localStorage.setItem("currentCompConfig", currentCompConfig);
    localStorage.setItem("pageSettings", pageSettings);
    // 保存当前操作的时间
    localStorage.setItem("store_time", String(Date.now()));

    message.success("保存成功");
    addOperationLog("save_draft", "本地草稿");
  });

  // 定义从本地存储中读取组件的函数
  const localStorageInStore = action(async () => {
    // 从本地存储中读取组件配置相关数据
    const compConfig = localStorage.getItem("compConfig");
    const sortableCompConfig = localStorage.getItem("sortableCompConfig");
    const currentCompConfig = localStorage.getItem("currentCompConfig");
    const pageSettings = localStorage.getItem("pageSettings");

    const storeTime = localStorage.getItem("store_time");
    const releaseTime = localStorage.getItem("release_time");

    // 如果存在组件配置数据，则根据存储时间判断是否可以读取数据
    if (compConfig && compConfig !== "{}") {
      if (
        storeTime &&
        Number(storeTime) > (releaseTime ? Number(releaseTime) : 0)
      ) {
        // 从JSON字符串转换为组件配置对象
        storeComponents.compConfigs = JSON.parse(compConfig);
        storeComponents.sortableCompConfig = JSON.parse(sortableCompConfig!);
        storeComponents.currentCompConfig = JSON.parse(currentCompConfig!);
        normalizeLayout(
          storeComponents.compConfigs,
          storeComponents.sortableCompConfig,
        );

        // Restore page settings
        if (pageSettings) {
          const settings = JSON.parse(pageSettings);
          const { setDeviceType, setCanvasSize, setCodeFramework } =
            useStorePage();
          if (settings.deviceType) setDeviceType(settings.deviceType);
          if (settings.canvasWidth && settings.canvasHeight) {
            setCanvasSize(settings.canvasWidth, settings.canvasHeight);
          }
          if (settings.codeFramework) {
            setCodeFramework(settings.codeFramework);
          }
        }

        message.success("已自动从草稿中读取数据");
      } else {
        // 服务端获取页面组件
        readDataFromServer();
      }
    } else {
      // 服务端获取页面组件
      readDataFromServer();
    }
  });

  const { updatePage } = useStorePage();
  // 定义从服务器读取数据的函数
  const readDataFromServer = action(async () => {
    // 获取组件数据和页面信息，并转换为组件配置对象
    const { data } = await getLowCodePage();
    storeComponents.compConfigs = data?.components
      ?.map((comp: any) => {
        return {
          ...comp,
          id: ulid(),
        };
      })
      .reduce((acc: any, cur: any) => {
        // 将组件配置id添加到可排序组件配置中
        acc[cur.id] = {
          id: cur.id,
          type: cur.type,
          props: cur.options ?? {},
          styles: cur.styles ?? cur.options?.styles,
        };
        return acc;
      }, {});
    storeComponents.sortableCompConfig = Object.keys(
      storeComponents.compConfigs || {},
    );
    normalizeLayout(
      storeComponents.compConfigs,
      storeComponents.sortableCompConfig,
    );
    // 设置当前组件配置为可排序组件配置的第一个组件配置
    storeComponents.currentCompConfig = storeComponents.sortableCompConfig[0];
    // 更新页面信息
    updatePage({
      tdk: data?.tdk || "",
      title: data?.page_name,
      description: data?.desc,
    });

    message.success("已自动从服务器读取数据");
  });

  return {
    _replace,
    replaceByCode,
    push,
    getComponentById,
    isCurrentComponent,
    getCurrentComponentConfig,
    setCurrentComponent,
    store: storeComponents,
    updateCurrentComponent,
    updateCurrentComponentStyles,
    updateComponentPosition,
    updateCurrentCompConfigWithArray,
    setItemsExpandIndex,
    // 导出撤销操作的函数
    undo,
    // 导出重做操作的函数
    redo,
    // 导出是否有上一步
    hasUndo: sotreComponentsUndoer.hasUndo,
    // 导出是否有下一步
    hasRedo: sotreComponentsUndoer.hasRedo,
    moveComponent,
    moveUpComponent,
    moveDownComponent,
    copyCurrentComponent,
    pasteCopyedComponent,
    removeCurrentComponent,
    getCurrentComponentIndex,
    storeInLocalStorage,
    localStorageInStore,
  };
}
