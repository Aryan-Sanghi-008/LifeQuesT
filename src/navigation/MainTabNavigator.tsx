import { useRef, useState } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from '../types';
import { useTheme } from '@theme';
import { HomeScreen }    from '@features/life/HomeScreen';
import { WorldScreen }   from '@features/life/WorldScreen';
import { LifeScreen }    from '@features/life/LifeScreen';
import { ProfileScreen } from '@features/life/ProfileScreen';
import { withGameErrorBoundary } from './screenWrappers';
import { QuickActionsSheet } from '@components/QuickActionsSheet';
import Svg, { Path, Circle } from 'react-native-svg';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_COLOR_KEYS: Record<string, keyof ReturnType<typeof useTheme>['colors']> = {
  Home: 'emerald',
  World: 'social',
  Life: 'sapphire',
  Profile: 'catMilestone',
};

function IconHome({ active, color, muted }: { active: boolean; color: string; muted: string }) {
  const c = active ? color : muted;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path stroke={c} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <Path stroke={c} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10"/>
    </Svg>
  );
}

function IconWorld({ active, color, muted }: { active: boolean; color: string; muted: string }) {
  const c = active ? color : muted;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={c} strokeWidth={active ? 2.2 : 1.8}/>
      <Path d="M2 12h20" stroke={c} strokeWidth={active ? 2.2 : 1.8}/>
      <Path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={c} strokeWidth={active ? 2.2 : 1.8}/>
    </Svg>
  );
}

function IconLife({ active, color, muted }: { active: boolean; color: string; muted: string }) {
  const c = active ? color : muted;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={c} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round"/>
      <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={c} strokeWidth={active ? 2.2 : 1.8} strokeLinejoin="round"/>
    </Svg>
  );
}

function IconProfile({ active, color, muted }: { active: boolean; color: string; muted: string }) {
  const c = active ? color : muted;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle stroke={c} strokeWidth={active ? 2.2 : 1.8} cx="12" cy="7" r="4"/>
      <Path stroke={c} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    </Svg>
  );
}

const ICON_MAP: Record<string, (active: boolean, color: string, muted: string) => React.ReactNode> = {
  Home:    (a, c, m) => <IconHome    active={a} color={c} muted={m} />,
  World:   (a, c, m) => <IconWorld   active={a} color={c} muted={m} />,
  Life:    (a, c, m) => <IconLife    active={a} color={c} muted={m} />,
  Profile: (a, c, m) => <IconProfile active={a} color={c} muted={m} />,
};

function TabButton({
  routeName, isFocused, onPress,
}: {
  routeName: string; isFocused: boolean; onPress: () => void;
}) {
  const { colors, fonts, radii } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const accentColor = colors[TAB_COLOR_KEYS[routeName] ?? 'sapphire'];

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, damping: 12, stiffness: 300 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 260 }),
    ]).start();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={styles.tabItem}
      android_ripple={{ color: `${accentColor}18`, borderless: true, radius: 28 }}
    >
      <Animated.View style={[styles.tabInner, { transform: [{ scale }] }]}>
        {isFocused && (
          <View style={[styles.activePill, { backgroundColor: `${accentColor}14`, borderRadius: radii.sm }]} />
        )}
        {ICON_MAP[routeName]?.(isFocused, accentColor, colors.t4)}
        <Text style={[
          styles.tabLabel,
          { color: isFocused ? accentColor : colors.t4, fontFamily: isFocused ? fonts.bodyBold : fonts.body },
        ]}>
          {routeName}
        </Text>
        {isFocused && (
          <View style={[styles.activeDot, { backgroundColor: accentColor }]} />
        )}
      </Animated.View>
    </Pressable>
  );
}

function CustomTabBar({ state, navigation, onOpenQuickActions }: BottomTabBarProps & { onOpenQuickActions: () => void }) {
  const insets = useSafeAreaInsets();
  const { colors, shadows } = useTheme();

  return (
    <View style={[
      styles.tabBar,
      shadows.card,
      {
        backgroundColor: colors.bgCard,
        borderTopColor: colors.border,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        alignItems: 'center',
      },
    ]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const onPress = () => {
          if (route.name === 'QuickActions') {
            onOpenQuickActions();
            return;
          }
          const event = navigation.emit({
            type: 'tabPress', target: route.key, canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as keyof MainTabParamList);
          }
        };

        if (route.name === 'QuickActions') {
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.fabBtn}
            >
              <View style={[styles.fabInner, { backgroundColor: colors.emerald, shadowColor: colors.emerald }]}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" d="M12 5v14M5 12h14" />
                </Svg>
              </View>
            </Pressable>
          );
        }

        return (
          <TabButton
            key={route.key}
            routeName={route.name}
            isFocused={isFocused}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

const wrap = withGameErrorBoundary;

function DummyComponent() {
  return null;
}

export default function MainTabNavigator() {
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} onOpenQuickActions={() => setQuickActionsVisible(true)} />}
      >
        <Tab.Screen name="Home"         component={wrap(HomeScreen)}    />
        <Tab.Screen name="World"        component={wrap(WorldScreen)}   />
        <Tab.Screen name="QuickActions" component={DummyComponent}      />
        <Tab.Screen name="Life"         component={wrap(LifeScreen)}    />
        <Tab.Screen name="Profile"      component={wrap(ProfileScreen)} />
      </Tab.Navigator>
      <QuickActionsSheet visible={quickActionsVisible} onClose={() => setQuickActionsVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabInner: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 0,
    left: -4,
    right: -4,
    bottom: 0,
  },
  tabLabel: {
    fontSize: 9.5,
    letterSpacing: 0.1,
  },
  activeDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  fabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -14,
    height: 60,
  },
  fabInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
