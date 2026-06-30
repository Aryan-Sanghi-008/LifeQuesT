import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Path, Circle } from "react-native-svg";
import { useTheme, useThemedStyles } from "@theme";
import { RootStackParamList } from "@/types";
import { Card, Divider, SectionLabel } from "@components/index";
import { createSectionStyles } from "./styles";

export function LegacyTab() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createSectionStyles);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.section}>
      <SectionLabel label="Legacy & Bloodline" />
      <Card style={{ gap: 0 }}>
        <Pressable
          style={styles.menuItemRow}
          onPress={() => navigation.navigate("FamilyTree")}
        >
          <View style={styles.menuItemLeft}>
            <View
              style={[
                styles.menuItemIcon,
                { backgroundColor: `${colors.catRelationship}15` },
              ]}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle
                  stroke={colors.catRelationship}
                  strokeWidth={2}
                  cx="12"
                  cy="5"
                  r="3"
                />
                <Path
                  stroke={colors.catRelationship}
                  strokeWidth={2}
                  d="M6 12h12M12 8v8"
                />
                <Circle
                  stroke={colors.catRelationship}
                  strokeWidth={2}
                  cx="6"
                  cy="19"
                  r="3"
                />
                <Circle
                  stroke={colors.catRelationship}
                  strokeWidth={2}
                  cx="18"
                  cy="19"
                  r="3"
                />
              </Svg>
            </View>
            <View>
              <Text style={styles.menuItemLabel}>Family Tree & Lineage</Text>
              <Text style={styles.menuItemSub}>
                View generations and living relatives
              </Text>
            </View>
          </View>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              stroke={colors.t4}
              strokeWidth={2}
              strokeLinecap="round"
              d="M9 18l6-6-6-6"
            />
          </Svg>
        </Pressable>

        <Divider />

        <Pressable
          style={styles.menuItemRow}
          onPress={() => navigation.navigate("WillEditor")}
        >
          <View style={styles.menuItemLeft}>
            <View
              style={[
                styles.menuItemIcon,
                { backgroundColor: `${colors.teal}15` },
              ]}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  stroke={colors.teal}
                  strokeWidth={2}
                  d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                />
                <Path
                  stroke={colors.teal}
                  strokeWidth={2}
                  d="M14 2v6h6M16 13H8M16 17H8"
                />
              </Svg>
            </View>
            <View>
              <Text style={styles.menuItemLabel}>Last Will & Testament</Text>
              <Text style={styles.menuItemSub}>
                Configure inheritance settings
              </Text>
            </View>
          </View>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              stroke={colors.t4}
              strokeWidth={2}
              strokeLinecap="round"
              d="M9 18l6-6-6-6"
            />
          </Svg>
        </Pressable>

        <Divider />

        <Pressable
          style={styles.menuItemRow}
          onPress={() => navigation.navigate("LifeMuseum")}
        >
          <View style={styles.menuItemLeft}>
            <View
              style={[
                styles.menuItemIcon,
                { backgroundColor: `${colors.gold}15` },
              ]}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  stroke={colors.gold}
                  strokeWidth={2}
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </Svg>
            </View>
            <View>
              <Text style={styles.menuItemLabel}>Family Museum</Text>
              <Text style={styles.menuItemSub}>
                Show collectibles and trophies
              </Text>
            </View>
          </View>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              stroke={colors.t4}
              strokeWidth={2}
              strokeLinecap="round"
              d="M9 18l6-6-6-6"
            />
          </Svg>
        </Pressable>

        <Divider />

        <Pressable
          style={styles.menuItemRow}
          onPress={() => navigation.navigate("Prestige")}
        >
          <View style={styles.menuItemLeft}>
            <View
              style={[
                styles.menuItemIcon,
                { backgroundColor: `${colors.gold3}15` },
              ]}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  stroke={colors.gold3}
                  strokeWidth={2}
                  d="M12 2c5.523 0 10 4.477 10 10S17.523 22 12 22 2 17.523 2 12 6.477 2 12 2z"
                />
              </Svg>
            </View>
            <View>
              <Text style={styles.menuItemLabel}>Global Prestige</Text>
              <Text style={styles.menuItemSub}>
                View global prestige levels & traits
              </Text>
            </View>
          </View>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              stroke={colors.t4}
              strokeWidth={2}
              strokeLinecap="round"
              d="M9 18l6-6-6-6"
            />
          </Svg>
        </Pressable>

        <Divider />

        <Pressable
          style={styles.menuItemRow}
          onPress={() => navigation.navigate("ChallengeMode")}
        >
          <View style={styles.menuItemLeft}>
            <View
              style={[
                styles.menuItemIcon,
                { backgroundColor: `${colors.teal}15` },
              ]}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  stroke={colors.teal}
                  strokeWidth={2}
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                />
              </Svg>
            </View>
            <View>
              <Text style={styles.menuItemLabel}>Challenge Mode</Text>
              <Text style={styles.menuItemSub}>
                View rules of all challenges
              </Text>
            </View>
          </View>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              stroke={colors.t4}
              strokeWidth={2}
              strokeLinecap="round"
              d="M9 18l6-6-6-6"
            />
          </Svg>
        </Pressable>

        <Divider />

        <Pressable
          style={styles.menuItemRow}
          onPress={() => navigation.navigate("LiveOps")}
        >
          <View style={styles.menuItemLeft}>
            <View
              style={[
                styles.menuItemIcon,
                { backgroundColor: `${colors.orchid}15` },
              ]}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  stroke={colors.orchid}
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </Svg>
            </View>
            <View>
              <Text style={styles.menuItemLabel}>Live Ops Hub</Text>
              <Text style={styles.menuItemSub}>
                Active seasons, modifiers & challenges
              </Text>
            </View>
          </View>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              stroke={colors.t4}
              strokeWidth={2}
              strokeLinecap="round"
              d="M9 18l6-6-6-6"
            />
          </Svg>
        </Pressable>
      </Card>
    </View>
  );
}
