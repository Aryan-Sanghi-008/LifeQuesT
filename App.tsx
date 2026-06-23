import "react-native-gesture-handler";
import { useEffect, useCallback } from "react";
import {
  StatusBar,
  Platform,
  UIManager,
  InteractionManager,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  PlayfairDisplay_900Black,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
} from "@expo-google-fonts/jetbrains-mono";
import RootNavigator from "@navigation/RootNavigator";
import { useGameStore } from "@store/gameStore";
import { initAuth, subscribeAuth } from "./src/services/auth";
import { initAds } from "./src/services/ads";
import {
  initIAP,
  setupPurchaseListeners,
  applyPurchaseToStore,
  verifyPurchaseOnServer,
} from "./src/services/iap";
import { logEvent } from "./src/services/analytics";
import "./global.css";

void SplashScreen.preventAutoHideAsync().catch(() => {
  /* splash plugin unavailable in some builds */
});

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  const loadGame = useGameStore((s) => s.loadGame);
  const setUser = useGameStore((s) => s.setUser);

  const [fontsLoaded, fontError] = useFonts({
    "PlayfairDisplay-Black": PlayfairDisplay_900Black,
    "PlayfairDisplay-Bold": PlayfairDisplay_700Bold,
    "DMSans-Regular": DMSans_400Regular,
    "DMSans-Medium": DMSans_500Medium,
    "DMSans-SemiBold": DMSans_600SemiBold,
    "DMSans-Bold": DMSans_700Bold,
    "JetBrainsMono-Regular": JetBrainsMono_400Regular,
    "JetBrainsMono-SemiBold": JetBrainsMono_600SemiBold,
  });

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Critical path: auth + save hydration (must run before first screen).
  useEffect(() => {
    initAuth();
    const unsubAuth = subscribeAuth((user) => {
      setUser(user);
    });
    void loadGame();
    return () => {
      unsubAuth();
    };
  }, [loadGame, setUser]);

  // Defer native monetization SDKs until UI is ready (avoids launch-time native crashes).
  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    let cancelled = false;
    let cleanupIAP = () => {};

    const onPurchaseSuccess = async (purchase: { productId: string }) => {
      const state = useGameStore.getState();
      const uid = state.user?.uid ?? "local_guest";
      const verified = await verifyPurchaseOnServer(uid, purchase as never);
      if (!verified && !uid.startsWith("local_guest_")) {
        console.warn("[iap] server verification failed — granting locally in dev");
      }
      applyPurchaseToStore(purchase.productId, state);
      void logEvent("purchase", { productId: purchase.productId });
      void state._persist();
    };

    const task = InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;
      void initAds();
      void initIAP(onPurchaseSuccess);
      cleanupIAP = setupPurchaseListeners(
        onPurchaseSuccess,
        (err) => console.warn("[iap]", err.message),
      );
    });

    return () => {
      cancelled = true;
      task.cancel();
      cleanupIAP();
    };
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        {/* Light status bar for bright theme */}
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F4F6F9"
          translucent={false}
        />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
