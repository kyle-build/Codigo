import type { TBasicComponentConfig } from "@codigo/schema";

export interface IComponentPlugin<
  T extends string = string,
  P extends Record<string, any> = any,
  R = any
> {
  type: T;
  name: string;
  description?: string;
  defaultConfig: TBasicComponentConfig<T, P>;
  render: R;
  propsPanel?: any; // 可以是设置面板组件
}

class ComponentRegistry {
  private plugins = new Map<string, IComponentPlugin>();

  public register<T extends string, P extends Record<string, any>, R>(
    plugin: IComponentPlugin<T, P, R>
  ) {
    if (this.plugins.has(plugin.type)) {
      console.warn(`[plugin-system] Plugin with type "${plugin.type}" is already registered. It will be overwritten.`);
    }
    this.plugins.set(plugin.type, plugin as IComponentPlugin);
  }

  public getPlugin(type: string): IComponentPlugin | undefined {
    return this.plugins.get(type);
  }

  public getAllPlugins(): IComponentPlugin[] {
    return Array.from(this.plugins.values());
  }

  public getDefaultConfigs(): Record<string, TBasicComponentConfig> {
    const configs: Record<string, TBasicComponentConfig> = {};
    this.plugins.forEach((plugin, key) => {
      configs[key] = plugin.defaultConfig;
    });
    return configs;
  }
}

export const registry = new ComponentRegistry();
export const registerComponent = registry.register.bind(registry);
export const getComponentPlugin = registry.getPlugin.bind(registry);
export const getAllComponentPlugins = registry.getAllPlugins.bind(registry);
export const getComponentDefaultConfigs = registry.getDefaultConfigs.bind(registry);