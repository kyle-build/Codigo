import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  LEFT_PANEL_DEFAULT_WIDTH,
  LEFT_PANEL_STORAGE_KEY,
  RIGHT_PANEL_DEFAULT_WIDTH,
  RIGHT_PANEL_STORAGE_KEY,
  clampWidth,
  getPanelBounds,
  normalizePanelWidths,
  readStoredWidth,
  type ResizeSide,
} from "./layout";

interface ResizeState {
  side: ResizeSide;
  startX: number;
  startWidth: number;
  oppositeWidth: number;
}

export function useEditorPanelLayout() {
  const resizeStateRef = useRef<ResizeState | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(() =>
    readStoredWidth(LEFT_PANEL_STORAGE_KEY, LEFT_PANEL_DEFAULT_WIDTH),
  );
  const [rightPanelWidth, setRightPanelWidth] = useState(() =>
    readStoredWidth(RIGHT_PANEL_STORAGE_KEY, RIGHT_PANEL_DEFAULT_WIDTH),
  );

  const applyPanelWidths = useCallback(
    (nextLeftWidth: number, nextRightWidth: number) => {
      const normalized = normalizePanelWidths(
        window.innerWidth,
        nextLeftWidth,
        nextRightWidth,
      );
      setLeftPanelWidth(normalized.leftWidth);
      setRightPanelWidth(normalized.rightWidth);
      window.localStorage.setItem(
        LEFT_PANEL_STORAGE_KEY,
        String(Math.round(normalized.leftWidth)),
      );
      window.localStorage.setItem(
        RIGHT_PANEL_STORAGE_KEY,
        String(Math.round(normalized.rightWidth)),
      );
    },
    [],
  );

  useEffect(() => {
    const normalized = normalizePanelWidths(
      window.innerWidth,
      leftPanelWidth,
      rightPanelWidth,
    );

    if (
      normalized.leftWidth !== leftPanelWidth ||
      normalized.rightWidth !== rightPanelWidth
    ) {
      setLeftPanelWidth(normalized.leftWidth);
      setRightPanelWidth(normalized.rightWidth);
    }
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const resizeState = resizeStateRef.current;
      if (!resizeState) {
        return;
      }

      const deltaX = event.clientX - resizeState.startX;

      if (resizeState.side === "left") {
        const bounds = getPanelBounds(
          "left",
          window.innerWidth,
          resizeState.oppositeWidth,
        );
        setLeftPanelWidth(
          clampWidth(
            resizeState.startWidth + deltaX,
            bounds.minWidth,
            bounds.maxWidth,
          ),
        );
        return;
      }

      const bounds = getPanelBounds(
        "right",
        window.innerWidth,
        resizeState.oppositeWidth,
      );
      setRightPanelWidth(
        clampWidth(
          resizeState.startWidth - deltaX,
          bounds.minWidth,
          bounds.maxWidth,
        ),
      );
    };

    const finishResize = () => {
      if (!resizeStateRef.current) {
        return;
      }

      resizeStateRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      applyPanelWidths(leftPanelWidth, rightPanelWidth);
    };

    const handleWindowResize = () => {
      applyPanelWidths(leftPanelWidth, rightPanelWidth);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishResize);
    window.addEventListener("pointercancel", finishResize);
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishResize);
      window.removeEventListener("pointercancel", finishResize);
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [applyPanelWidths, leftPanelWidth, rightPanelWidth]);

  const startResize = useCallback(
    (side: ResizeSide) => (event: ReactPointerEvent<HTMLDivElement>) => {
      resizeStateRef.current = {
        side,
        startX: event.clientX,
        startWidth: side === "left" ? leftPanelWidth : rightPanelWidth,
        oppositeWidth: side === "left" ? rightPanelWidth : leftPanelWidth,
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [leftPanelWidth, rightPanelWidth],
  );

  return {
    leftPanelWidth,
    rightPanelWidth,
    startResize,
  };
}
