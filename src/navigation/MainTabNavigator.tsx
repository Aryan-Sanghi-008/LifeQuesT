import { useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from '../types';
import { useTheme } from '@theme';
import { LifeScreen }    from '@features/life/LifeScreen';
import { PeopleScreen }  from '@features/people/PeopleScreen';
import { CareerScreen }  from '@features/career/CareerScreen';
import { AssetsScreen }  from '@features/economy/AssetsScreen';
import { ProfileScreen } from '@features/life/ProfileScreen';
import { GameErrorBoundary } from '../components/GameErrorBoundary';
import Svg, { Path, Circle, Polyline, Rect } from 'react-native-svg';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_COLOR_KEYS: Record<string, keyof ReturnType<typeof useTheme>['colors']> = {
  Life: 'sapphire',
  People: 'catRelationship',
  Career: 'catCareer',
  Assets: 'catFinancial',
  Profile: 'catMilestone',
};

function IconLife({ active, color, muted }: { active: boolean; color: string; muted: string }) {
  const c = active ? color : muted;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path stroke={c} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <Polyline stroke={c} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22"/>
    </Svg>
  );
}

function IconPeople({ active, color, muted }: { active: boolean; color: string; muted: string }) {
  const c = active ? color : muted;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle stroke={c} strokeWidth={active ? 2.2 : 1.8} cx="9" cy="7" r="4"/>
      <Path stroke={c} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <Path stroke={c} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </Svg>
  );
}

function IconCareer({ active, color, muted }: { active: boolean; color: string; muted: string }) {
  const c = active ? color : muted;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect stroke={c} strokeWidth={active ? 2.2 : 1.8} x="2" y="7" width="20" height="14" rx="2"/>
      <Path stroke={c} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
      <Path stroke={c} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" d="M12 12v5M9 14.5l3-2.5 3 2.5"/>
    </Svg>
  );
}

function IconAssets({ active, color, muted }: { active: boolean; color: string; muted: string }) {
  const c = active ? color : muted;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path stroke={c} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" d="M3 22h18M3 10h18M5 6l7-4 7 4M4 10v12M20 10v12M8 10v12M16 10v12M12 10v12"/>
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
  Life:    (a, c, m) => <IconLife    active={a} color={c} muted={m} />,
  People:  (a, c, m) => <IconPeople  active={a} color={c} muted={m} />,
  Career:  (a, c, m) => <IconCareer  active={a} color={c} muted={m} />,
  Assets:  (a, c, m) => <IconAssets  active={a} color={c} muted={m} />,
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

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
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
      },
    ]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress', target: route.key, canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as keyof MainTabParamList);
          }
        };
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

const wrap = (Component: React.ComponentType<object>) => {
  return function WrappedScreen(props: object) {
    return (
      <GameErrorBoundary>
        <Component {...props} />
      </GameErrorBoundary>
    );
  };
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Life"    component={wrap(LifeScreen)}    />
      <Tab.Screen name="People"  component={wrap(PeopleScreen)}  />
      <Tab.Screen name="Career"  component={wrap(CareerScreen)}  />
      <Tab.Screen name="Assets"  component={wrap(AssetsScreen)}  />
      <Tab.Screen name="Profile" component={wrap(ProfileScreen)} />
    </Tab.Navigator>
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
});
