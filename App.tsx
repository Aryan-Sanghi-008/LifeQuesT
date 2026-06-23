import "./global.css";
import { useEffect } from "react";
import { StatusBar, Platform, UIManager } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  const loadGame = useGameStore((s) => s.loadGame);
  const setUser = useGameStore((s) => s.setUser);

  useEffect(() => {
    initAuth();
    void initAds();

    const unsubAuth = subscribeAuth((user) => {
      setUser(user);
    });

    void loadGame();

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

    void initIAP(onPurchaseSuccess);
    const cleanupIAP = setupPurchaseListeners(
      onPurchaseSuccess,
      (err) => console.warn("[iap]", err.message),
    );

    return () => {
      unsubAuth();
      cleanupIAP();
    };
  }, [loadGame, setUser]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
