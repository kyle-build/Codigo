export function resolveSafeRedirect(value: string | null) {
  if (!value) {
    return null;
  }
  const target = value.trim();
  if (!target.startsWith("/")) {
    return null;
  }
  if (target.startsWith("//")) {
    return null;
  }
  if (target.includes("://")) {
    return null;
  }
  return target;
}

