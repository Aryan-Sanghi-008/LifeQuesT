import { View, Text } from "react-native";
import { useTheme } from "@theme";
import { BottomSheet } from "@components/index";
import { formatCurrencyFull } from "@utils/currency";
import { getCreateStyles } from "./styles";

export interface CountryEconomyDetails {
  engineerSalary: number;
  minInvestment: number;
  stockMin: number;
  hatchbackPrice: number;
}

type Props = {
  visible: boolean;
  countryCode: string;
  countryName: string;
  details: CountryEconomyDetails;
  onClose: () => void;
};

export function CountryEconomySheet({
  visible,
  countryCode,
  countryName,
  details,
  onClose,
}: Props) {
  const { colors, fonts, radii, spacing, shadows } = useTheme();
  const styles = getCreateStyles(radii, spacing, shadows);
  const fmt = (n: number) => formatCurrencyFull(n, countryCode);

  const rows = [
    { label: "Engineer salary (yr)", value: fmt(details.engineerSalary) },
    { label: "Min investment", value: fmt(details.minInvestment) },
    { label: "Suggested stock buy", value: fmt(details.stockMin) },
    { label: "Hatchback price", value: fmt(details.hatchbackPrice) },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={`${countryName} economy`}>
      <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 13, marginBottom: spacing.sm }}>
        Full economy snapshot for this birthplace.
      </Text>
      <View style={[styles.economyPreviewCard, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
        {rows.map((row) => (
          <View key={row.label} style={styles.economyPreviewRow}>
            <Text style={[styles.bgDesc, { color: colors.t4, fontFamily: fonts.body, flex: 1, marginTop: 0 }]}>
              {row.label}
            </Text>
            <Text style={[styles.bgDesc, { color: colors.t1, fontFamily: fonts.monoSemiBold, marginTop: 0 }]}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </BottomSheet>
  );
}
