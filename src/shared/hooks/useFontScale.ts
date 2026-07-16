import { useEffect, useState } from "react";
import { AppState, Dimensions, PixelRatio } from "react-native";
import { clampFontScale } from "@theme/a11y";

function readFontScale(): number {
  return clampFontScale(PixelRatio.getFontScale());
}

export function useFontScale(): number {
  const [fontScale, setFontScale] = useState(readFontScale);

  useEffect(() => {
    const onChange = () => setFontScale(readFontScale());
    const dimSub = Dimensions.addEventListener("change", onChange);
    const appSub = AppState.addEventListener("change", (state) => {
      if (state === "active") onChange();
    });
    return () => {
      dimSub.remove();
      appSub.remove();
    };
  }, []);

  return fontScale;
}
