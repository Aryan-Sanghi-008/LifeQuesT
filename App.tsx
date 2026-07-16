import "react-native-gesture-handler";
import { useEffect, useCallback } from "react";
import {
  StatusBar,
  Platform,
  UIManager,
  InteractionManager,
  AppState,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  PlayfairDisplay_900Black,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
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
import { NavigationSync } from "@navigation/NavigationSync";
import { navigationRef } from "@navigation/navigationRef";
import { ToastManager } from "@components";
import { useGameStore } from "@store/gameStore";
import { initAuth, subscribeAuth } from "@features/auth/services/auth";
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
import { hydrateSettingsStore } from "@store/settingsStore";
import { useTheme } from "@theme";
import { incrementAppSessionCount } from "@services/persistence";
import { isCloudUser } from "@store/storeHelpers";
import { preloadAvatarStyleAssets } from "@shared/utils/preloadAssets";

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
  const isHydrated = useGameStore((s) => s.isHydrated);
  const characterId = useGameStore((s) => s.character?.id);
  const { isDark, colors } = useTheme();

  const [fontsLoaded, fontError] = useFonts({
    "PlayfairDisplay-Black": PlayfairDisplay_900Black,
    "PlayfairDisplay-Bold": PlayfairDisplay_700Bold,
    "PlayfairDisplay-Italic": PlayfairDisplay_400Regular_Italic,
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

  useEffect(() => {
    if (!isHydrated) return;
    const state = useGameStore.getState();
    void import("@services/notificationSync").then((m) =>
      m.syncGameRetentionNotifications({
        character: state.character,
        dailyQuests: state.dailyQuests,
      }),
    );
  }, [isHydrated, characterId]);

  useEffect(() => {
    if (!isHydrated) return;
    incrementAppSessionCount();
    const game = useGameStore.getState();
    if (game.character?.isPremium) {
      game.ensurePlusMonthlyState();
      game.grantPlusMonthlyCosmetic();
    }
  }, [isHydrated]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        const game = useGameStore.getState();
        game.checkAbsenceBonus();
        void import('@services/liveOpsConfig').then((m) => m.fetchLiveOpsConfig());
        if (game.character?.isPremium) {
          game.ensurePlusMonthlyState();
          game.grantPlusMonthlyCosmetic();
          if (isCloudUser(game.user?.uid)) {
            void game._persist();
          }
        }
        void import("@services/notificationSync").then((m) =>
          m.syncGameRetentionNotifications({
            character: game.character,
            dailyQuests: game.dailyQuests,
          }),
        );
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!isHydrated || (!fontsLoaded && !fontError)) return;
    if (__DEV__) {
      console.log("[perf] cold_start:interactive", Date.now());
    }
  }, [isHydrated, fontsLoaded, fontError]);

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
      void (async () => {
        const hydrateStart = performance.now();
        const { hydratePersistence } = await import("@services/persistence");
        await Promise.all([hydrateSettingsStore(), hydratePersistence()]);
        if (__DEV__) {
          console.log(
            `[perf] cold_start:hydrate=${Math.round(performance.now() - hydrateStart)}ms`,
          );
        }

        preloadAvatarStyleAssets();

        const postStart = performance.now();
        const { initRemoteConfig } = await import("@services/remoteConfig");
        const { fetchLiveOpsConfig } = await import("@services/liveOpsConfig");
        await Promise.all([
          initAudio(),
          initRemoteConfig(),
          fetchLiveOpsConfig(),
        ]);
        if (__DEV__) {
          console.log(
            `[perf] cold_start:post_hydrate=${Math.round(performance.now() - postStart)}ms`,
          );
        }
      })();
      void initAds();
      void initCrashReporting();
      void initNotifications();
      void initIAP(onPurchaseSuccess);
      cleanupIAP = setupPurchaseListeners(onPurchaseSuccess, (err) =>
        console.warn("[iap]", err.message),
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
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={colors.bg}
          translucent={false}
        />
        <NavigationContainer ref={navigationRef}>
          <NavigationSync />
          <RootNavigator />
        </NavigationContainer>
        <ToastManager />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
