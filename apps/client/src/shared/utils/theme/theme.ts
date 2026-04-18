export const isDark = () => {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
};

export enum ThemeName {
  light = "light",
  dark = "dark",
}

export enum ThemeNameGroup {
  light = "light",
  dark = "dark",
  auto = "auto",
}

export type Theme = {
  name: ThemeName;
  providerName: string;
};

export const lightTheme: Theme = {
  name: ThemeName.light,
  providerName: "theme-light",
};

export const darkTheme: Theme = {
  name: ThemeName.dark,
  providerName: "theme-dark",
};

export type ThemeGroupMap = Record<
  ThemeNameGroup,
  { light: Theme; dark: Theme }
>;

export const themeGroupMap: ThemeGroupMap = {
  auto: {
    light: lightTheme,
    dark: darkTheme,
  },
  light: {
    light: lightTheme,
    dark: lightTheme,
  },
  dark: {
    light: darkTheme,
    dark: darkTheme,
  },
};
