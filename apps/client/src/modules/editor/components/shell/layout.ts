export const LEFT_PANEL_RAIL_WIDTH = 72;
export const LEFT_PANEL_CONTENT_WIDTH = 248;
export const OUTLINE_PANEL_DEFAULT_WIDTH = 192;
export const OUTLINE_PANEL_MIN_WIDTH = 160;
export const OUTLINE_PANEL_MAX_WIDTH = 300;
export const LEFT_PANEL_DEFAULT_WIDTH =
  LEFT_PANEL_RAIL_WIDTH +
  LEFT_PANEL_CONTENT_WIDTH +
  OUTLINE_PANEL_DEFAULT_WIDTH;
export const RIGHT_PANEL_DEFAULT_WIDTH = 320;
export const LEFT_PANEL_MIN_WIDTH =
  LEFT_PANEL_RAIL_WIDTH +
  LEFT_PANEL_CONTENT_WIDTH +
  OUTLINE_PANEL_MIN_WIDTH;
export const RIGHT_PANEL_MIN_WIDTH = 288;
export const LEFT_PANEL_MAX_WIDTH =
  LEFT_PANEL_RAIL_WIDTH +
  LEFT_PANEL_CONTENT_WIDTH +
  OUTLINE_PANEL_MAX_WIDTH;
export const RIGHT_PANEL_MAX_WIDTH = 460;
export const CENTER_MIN_WIDTH = 420;
export const LEFT_PANEL_STORAGE_KEY = "codigo:editor:left-panel-width:v4";
export const RIGHT_PANEL_STORAGE_KEY = "codigo:editor:right-panel-width:v2";

export type ResizeSide = "left" | "right";

export function readStoredWidth(key: string, fallback: number) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const stored = Number(window.localStorage.getItem(key));
  return Number.isFinite(stored) ? stored : fallback;
}

export function clampWidth(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getPanelBounds(
  side: ResizeSide,
  viewportWidth: number,
  oppositeWidth: number,
) {
  const minWidth =
    side === "left" ? LEFT_PANEL_MIN_WIDTH : RIGHT_PANEL_MIN_WIDTH;
  const maxWidth =
    side === "left" ? LEFT_PANEL_MAX_WIDTH : RIGHT_PANEL_MAX_WIDTH;
  const remainingWidth = Math.max(
    minWidth,
    viewportWidth - CENTER_MIN_WIDTH - oppositeWidth,
  );

  return {
    minWidth,
    maxWidth: Math.max(minWidth, Math.min(maxWidth, remainingWidth)),
  };
}

export function normalizePanelWidths(
  viewportWidth: number,
  leftWidth: number,
  rightWidth: number,
) {
  const leftBounds = getPanelBounds("left", viewportWidth, rightWidth);
  const nextLeftWidth = clampWidth(
    leftWidth,
    leftBounds.minWidth,
    leftBounds.maxWidth,
  );
  const rightBounds = getPanelBounds("right", viewportWidth, nextLeftWidth);
  const nextRightWidth = clampWidth(
    rightWidth,
    rightBounds.minWidth,
    rightBounds.maxWidth,
  );
  const finalLeftBounds = getPanelBounds("left", viewportWidth, nextRightWidth);

  return {
    leftWidth: clampWidth(
      nextLeftWidth,
      finalLeftBounds.minWidth,
      finalLeftBounds.maxWidth,
    ),
    rightWidth: nextRightWidth,
  };
}
