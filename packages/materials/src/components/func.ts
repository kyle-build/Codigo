import { calcValueByString } from "..";
import type {
  TBasicComponentConfig,
  TransformedComponentConfig,
} from "@codigo/schema";
import { getComponentPlugin, type IComponentSlotDefinition } from "@codigo/plugin-system";
import { getBuiltinComponentDefinitionByType } from "./registry";

/**
 * 按组件类型获取最终渲染入口，优先返回插件注册组件，其次回退到内置物料。
 */
export function getComponentByType(type: TBasicComponentConfig["type"]) {
  return (
    getComponentPlugin(type)?.render ??
    getBuiltinComponentDefinitionByType(type)?.render
  );
}

/**
 * 获取组件是否为容器以及可用插槽定义，供编辑器布局与拖拽能力使用。
 */
export function getComponentContainerMeta(type: TBasicComponentConfig["type"]) {
  const plugin =
    getComponentPlugin(type) ?? getBuiltinComponentDefinitionByType(type);
  return {
    isContainer: Boolean(plugin?.isContainer),
    slots: (plugin?.slots ?? []) as IComponentSlotDefinition[],
  };
}

/**
 * 将物料配置中的包装结构拍平成普通属性对象，只保留各字段的默认值。
 */
export function getDefaultValueByConfig(
  componentPropsWrapper: TransformedComponentConfig<Record<string, any>>,
) {
  return Object.entries(componentPropsWrapper).reduce(
    (acc, [key, value]) => {
      acc[key] = value.defaultValue;
      return acc;
    },
    {} as Record<string, any>,
  );
}

/**
 * 将普通属性值重新填充回配置包装结构，便于编辑器统一处理显隐、默认值与当前值。
 */
export function fillComponentPropsByConfig<
  T extends TransformedComponentConfig<Record<string, any>>,
>(props: Record<string, any>, componentPropsWrapper: T): T {
  const result = {} as unknown as any;

  for (const [key, value] of Object.entries(componentPropsWrapper)) {
    result[key] = {
      isHidden: value.isHidden,
      defaultValue: value.defaultValue,
      value:
        props?.[key] !== undefined
          ? calcValueByString(props[key])
          : value.defaultValue,
    };
  }
  return result;
}
