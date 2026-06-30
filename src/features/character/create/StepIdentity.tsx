import { View, Text, Pressable, TextInput } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useTheme } from "@theme";
import { FadeInView } from "@components/index";
import { Gender } from "@/types";
import { getCreateStyles } from "./styles";

function getGenderOptions(colors: {
  sapphire: string;
  orchid: string;
}) {
  return [
    {
      id: "male" as Gender,
      label: "Male",
      color: colors.sapphire,
      icon: (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Circle stroke={colors.sapphire} strokeWidth={2} cx="10" cy="14" r="6" />
          <Path
            stroke={colors.sapphire}
            strokeWidth={2}
            strokeLinecap="round"
            d="M14.5 9.5L19 5M19 5h-4M19 5v4"
          />
        </Svg>
      ),
    },
    {
      id: "female" as Gender,
      label: "Female",
      color: "#EC4899",
      icon: (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Circle stroke="#EC4899" strokeWidth={2} cx="12" cy="9" r="6" />
          <Path
            stroke="#EC4899"
            strokeWidth={2}
            strokeLinecap="round"
            d="M12 15v6M9 18h6"
          />
        </Svg>
      ),
    },
    {
      id: "other" as Gender,
      label: "Other",
      color: colors.orchid,
      icon: (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Circle stroke={colors.orchid} strokeWidth={2} cx="12" cy="12" r="7" />
          <Path
            stroke={colors.orchid}
            strokeWidth={2}
            strokeLinecap="round"
            d="M12 5V2M12 22v-3"
          />
        </Svg>
      ),
    },
  ];
}

type StepIdentityProps = {
  name: string;
  setName: (v: string) => void;
  gender: Gender;
  setGender: (v: Gender) => void;
  onNameFocus: () => void;
};

export function StepIdentity({
  name,
  setName,
  gender,
  setGender,
  onNameFocus,
}: StepIdentityProps) {
  const { colors, fonts, radii, spacing, shadows } = useTheme();
  const styles = getCreateStyles(radii, spacing, shadows);
  const GENDER_OPTIONS = getGenderOptions(colors);

  return (
    <FadeInView style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.t1, fontFamily: fonts.displayBold }]}>
        Who are you?
      </Text>
      <Text style={[styles.stepSub, { color: colors.t3, fontFamily: fonts.body }]}>
        Choose your gender, give yourself a name, and see your baby self.
      </Text>

      <Text style={[styles.inputLabel, { color: colors.t4, fontFamily: fonts.bodyBold }]}>
        GENDER
      </Text>
      <View style={styles.genderRow}>
        {GENDER_OPTIONS.map((g) => {
          const active = g.id === gender;
          return (
            <Pressable
              key={g.id}
              onPress={() => setGender(g.id)}
              style={[
                styles.genderCard,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border,
                },
                active && {
                  borderColor: g.color,
                  backgroundColor: `${g.color}10`,
                },
              ]}
            >
              {g.icon}
              <Text
                style={[
                  styles.genderLabel,
                  {
                    color: active ? g.color : colors.t3,
                    fontFamily: fonts.bodySemiBold,
                  },
                ]}
              >
                {g.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.inputLabel, { color: colors.t4, fontFamily: fonts.bodyBold }]}>
        YOUR NAME
      </Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <Svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          style={{ marginLeft: spacing.lg }}
        >
          <Path
            stroke={colors.t4}
            strokeWidth={2}
            strokeLinecap="round"
            d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
          />
          <Circle stroke={colors.t4} strokeWidth={2} cx="12" cy="7" r="4" />
        </Svg>
        <TextInput
          value={name}
          onChangeText={setName}
          onFocus={onNameFocus}
          placeholder="Enter your name..."
          placeholderTextColor={colors.t4}
          maxLength={24}
          style={[styles.textInput, { color: colors.t1, fontFamily: fonts.bodyMedium }]}
          returnKeyType="done"
        />
      </View>
    </FadeInView>
  );
}
