import { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from '../types';
import { COLORS, FONTS } from '../constants/theme';
import { LifeScreen }       from '../screens/LifeScreen';
import { PeopleScreen }     from '../screens/PeopleScreen';
import { CareerScreen }     from '../screens/CareerScreen';
import { AssetsScreen }     from '../screens/AssetsScreen';
import { ProfileScreen }    from '../screens/ProfileScreen';
import Svg, { Path, Circle, Polyline, Rect } from 'react-native-svg';

const Tab = createBottomTabNavigator<MainTabParamList>();

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconLife({ active }: { active: boolean }) {
  const c = active ? COLORS.gold : COLORS.t4;
  const w = active ? 2.2 : 1.8;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <Polyline stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22" />
    </Svg>
  );
}

function IconPeople({ active }: { active: boolean }) {
  const c = active ? COLORS.gold : COLORS.t4;
  const w = active ? 2.2 : 1.8;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <Circle stroke={c} strokeWidth={w} cx="9" cy="7" r="4" />
      <Path stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </Svg>
  );
}

function IconCareer({ active }: { active: boolean }) {
  const c = active ? COLORS.gold : COLORS.t4;
  const w = active ? 2.2 : 1.8;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" x="2" y="7" width="20" height="14" rx="2" />
      <Path stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      <Path stroke={c} strokeWidth={w} strokeLinecap="round" d="M12 12v5M9 15l3-3 3 3" />
    </Svg>
  );
}

function IconAssets({ active }: { active: boolean }) {
  const c = active ? COLORS.gold : COLORS.t4;
  const w = active ? 2.2 : 1.8;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" d="M3 22h18M3 10h18M5 6l7-4 7 4M4 10v12M20 10v12M8 10v12M16 10v12M12 10v12" />
    </Svg>
  );
}

function IconProfile({ active }: { active: boolean }) {
  const c = active ? COLORS.gold : COLORS.t4;
  const w = active ? 2.2 : 1.8;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <Circle stroke={c} strokeWidth={w} cx="12" cy="7" r="4" />
    </Svg>
  );
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────

const ICON_MAP: Record<string, (active: boolean) => ReactNode> = {
  Life:    (a) => <IconLife    active={a} />,
  People:  (a) => <IconPeople  active={a} />,
  Career:  (a) => <IconCareer  active={a} />,
  Assets:  (a) => <IconAssets  active={a} />,
  Profile: (a) => <IconProfile active={a} />,
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: 'rgba(8,12,20,0.97)',
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
      paddingBottom: insets.bottom || 12,
      paddingTop: 10,
      paddingHorizontal: 4,
    }}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as keyof MainTabParamList);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', gap: 3 }}
            android_ripple={{ color: 'rgba(232,168,56,0.12)', borderless: false, radius: 32 }}
          >
            {ICON_MAP[route.name]?.(isFocused)}
            <Text style={{
              fontFamily: FONTS.bodySemiBold,
              fontSize: 9,
              color: isFocused ? COLORS.gold : COLORS.t4,
              letterSpacing: 0.2,
            }}>
              {route.name}
            </Text>
            {isFocused && (
              <View style={{ position: 'absolute', top: -10, width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.gold }} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Navigator ───────────────────────────────────────────────────────────────

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Life"    component={LifeScreen}    />
      <Tab.Screen name="People"  component={PeopleScreen}  />
      <Tab.Screen name="Career"  component={CareerScreen}  />
      <Tab.Screen name="Assets"  component={AssetsScreen}  />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
