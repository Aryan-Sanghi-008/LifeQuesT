import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@theme";
import { ScreenShell } from "@components/index";
import Svg, { Path, Circle, Rect } from "react-native-svg";

function PeopleIcon({ color = "#8B5CF6" }: { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle stroke={color} strokeWidth={2} cx="9" cy="7" r="4"/>
      <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </Svg>
  );
}

function CareerIcon({ color = "#F59E0B" }: { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect stroke={color} strokeWidth={2} x="2" y="7" width="20" height="14" rx="2"/>
      <Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
      <Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M12 12v5M9 14.5l3-2.5 3 2.5"/>
    </Svg>
  );
}

function AssetsIcon({ color = "#10B981" }: { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 22h18M3 10h18M5 6l7-4 7 4M4 10v12M20 10v12M8 10v12M16 10v12M12 10v12"/>
    </Svg>
  );
}

function ActivitiesIcon({ color = "#3B82F6" }: { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </Svg>
  );
}

function TrophyIcon({ color = "#F59E0B" }: { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a4 4 0 014 4v7H8V6a4 4 0 014-4z" />
    </Svg>
  );
}

function StarIcon({ color = "#EC4899" }: { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path fill={color} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </Svg>
  );
}

export function WorldScreen() {
  const { colors, fonts, spacing, radii } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const destinations = [
    {
      title: "Relationships",
      desc: "Connect with parents, find partners, build a family, and adopt pets.",
      icon: <PeopleIcon color={colors.social} />,
      route: "People",
      color: colors.social,
    },
    {
      title: "Career & Education",
      desc: "Seek high-paying jobs, ask for promotions, or enroll in university degrees.",
      icon: <CareerIcon color={colors.gold} />,
      route: "Career",
      color: colors.gold,
    },
    {
      title: "Assets & Wealth",
      desc: "Invest in stocks, purchase luxury real estate, and manage vehicle loans.",
      icon: <AssetsIcon color={colors.wealth} />,
      route: "Assets",
      color: colors.wealth,
    },
    {
      title: "Activities & Hobbies",
      desc: "Spend money on activities, play games, study, practice hobbies, or run from police.",
      icon: <ActivitiesIcon color={colors.teal} />,
      route: "Activities",
      color: colors.teal,
    },
    {
      title: "Challenges & Legacy",
      desc: "See active challenge conditions, view dynasty trees, or unlock prestige perks.",
      icon: <TrophyIcon color={colors.looks} />,
      route: "ChallengeMode",
      color: colors.looks,
    },
    {
      title: "Global Leaderboards",
      desc: "Compete with other dynasties and place on the hall of fame.",
      icon: <StarIcon color={colors.gold3} />,
      route: "Leaderboard",
      color: colors.gold3,
    },
  ];

  return (
    <ScreenShell>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.displayBold }]}>
            Explore the World
          </Text>
          <Text style={[styles.subtitle, { color: colors.t3, fontFamily: fonts.body }]}>
            Manage all aspects of your life and plan your legacy
          </Text>
        </View>

        <View style={styles.grid}>
          {destinations.map((dest, idx) => (
            <Pressable
              key={idx}
              onPress={() => navigation.navigate(dest.route)}
              style={({ pressed }) => [
                styles.gridItem,
                {
                  borderColor: `${dest.color}25`,
                  backgroundColor: colors.bgCard,
                  borderRadius: radii.md,
                },
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
              android_ripple={{ color: `${dest.color}15` }}
            >
              <View style={[styles.iconWrap, { backgroundColor: `${dest.color}12`, borderRadius: radii.sm }]}>
                {dest.icon}
              </View>
              <Text style={[styles.itemTitle, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
                {dest.title}
              </Text>
              <Text style={[styles.itemDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                {dest.desc}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 20,
  },
  header: {
    marginTop: 8,
    gap: 4,
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  gridItem: {
    width: "48%",
    padding: 16,
    borderWidth: 1.5,
    gap: 8,
    minHeight: 175,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  itemTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  itemDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
});
