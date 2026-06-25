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
import { initAuth, subscribeAuth } from "@services/auth";
import { initAds } from "@services/ads";
import {
  initIAP,
  setupPurchaseListeners,
  processVerifiedPurchase,
} from "@services/iap";
import { logEvent } from "@services/analytics";
import { initCrashReporting } from "@services/crashReporting";
import { initNotifications } from "@services/notifications";
import { initAudio } from "@services/audio";
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
  const onUserChanged = useGameStore((s) => s.onUserChanged);

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
      void onUserChanged(user);
    });
    void loadGame();
    return () => {
      unsubAuth();
    };
  }, [loadGame, onUserChanged]);

  // Defer native monetization SDKs until UI is ready (avoids launch-time native crashes).
  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    let cancelled = false;
    let cleanupIAP = () => {};

    const onPurchaseSuccess = async (purchase: { productId: string }) => {
      const state = useGameStore.getState();
      const granted = await processVerifiedPurchase(purchase as never, state);
      if (!granted) {
        console.warn("[iap] purchase not granted — server verification failed");
        return;
      }
      void logEvent("purchase", { productId: purchase.productId });
    };

    const task = InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;
      void initAudio();
      void initAds();
      void initCrashReporting();
      void initNotifications();
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
