/**
 * 判断传入值是否为可递归合并的普通对象。
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * 深度合并基础配置与覆盖配置，数组直接替换，对象递归合并。
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override as T;
  }

  const result: Record<string, unknown> = {
    ...(base as Record<string, unknown>),
  };
  for (const [k, v] of Object.entries(override)) {
    const bv = (base as Record<string, unknown>)[k];
    if (Array.isArray(bv) || Array.isArray(v)) {
      result[k] = v;
      continue;
    }
    if (isPlainObject(bv) && isPlainObject(v)) {
      result[k] = deepMerge(bv, v);
      continue;
    }
    result[k] = v;
  }
  return result as T;
}
