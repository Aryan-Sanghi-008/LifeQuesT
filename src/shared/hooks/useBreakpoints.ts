import { useEffect, useState } from "react";
import { AppState, Dimensions, useWindowDimensions } from "react-native";

export const TABLET_MIN_WIDTH = 768;
export const LARGE_TABLET_MIN_WIDTH = 1024;

export function getBreakpointFlags(width: number) {
  return {
    width,
    isTablet: width >= TABLET_MIN_WIDTH,
    isLargeTablet: width >= LARGE_TABLET_MIN_WIDTH,
    contentMaxWidth:
      width >= LARGE_TABLET_MIN_WIDTH ? 720 : width >= TABLET_MIN_WIDTH ? 640 : undefined,
  };
}

export function useBreakpoints() {
  const { width } = useWindowDimensions();
  const [layoutWidth, setLayoutWidth] = useState(width);

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      setLayoutWidth(window.width);
    });
    const appSub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setLayoutWidth(Dimensions.get("window").width);
      }
    });
    return () => {
      sub.remove();
      appSub.remove();
    };
  }, []);

  return getBreakpointFlags(layoutWidth);
}
