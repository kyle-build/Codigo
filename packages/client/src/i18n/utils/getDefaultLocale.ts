export function getDefaultLocale() {
  const saved = localStorage.getItem("user-locale");
  if (saved) return saved;

  const browserLang = navigator.language;

  const supported = ["zh-CN", "en-US", "ja-JP", "ko-KR", "ar-SA"];

  if (supported.includes(browserLang)) {
    return browserLang;
  }

  const prefix = browserLang.split("-")[0];

  const matched = supported.find((l) => l.startsWith(prefix));

  return matched || "zh-CN";
}












