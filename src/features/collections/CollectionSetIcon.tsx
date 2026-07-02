import Svg, { Path, Circle } from "react-native-svg";

interface Props {
  setId: string;
  color: string;
  size?: number;
}

export function CollectionSetIcon({ setId, color, size = 24 }: Props) {
  const s = size;

  switch (setId) {
    case "wanderer":
      // Globe
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
          <Path stroke={color} strokeWidth={1.5} d="M12 2a14.5 14.5 0 010 20M12 2a14.5 14.5 0 000 20M2 12h20" />
        </Svg>
      );

    case "tycoon":
      // Briefcase
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 12v4M10 14h4" />
        </Svg>
      );

    case "scholar":
      // Open book
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </Svg>
      );

    case "lover":
      // Heart
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </Svg>
      );

    case "outlaw":
      // Mask / eye with slash
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round"
            d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" />
          <Path stroke={color} strokeWidth={2} d="M10.73 10.73a3 3 0 004.24 4.24" />
        </Svg>
      );

    case "caregiver":
      // Shield with heart
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <Path stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
            d="M15.5 9.5a1.5 1.5 0 00-2.12 0L12 10.88l-1.38-1.38a1.5 1.5 0 00-2.12 2.12l3.5 3.5 3.5-3.5a1.5 1.5 0 000-2.12z" />
        </Svg>
      );

    case "athlete":
      // Lightning bolt / activity
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </Svg>
      );

    case "socialite":
      // Users / star
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </Svg>
      );

    case "survivor":
      // Hourglass
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            d="M5 3h14M5 21h14M7 3v4.5a2 2 0 001 1.73L12 12l-4 2.77A2 2 0 007 16.5V21M17 3v4.5a2 2 0 01-1 1.73L12 12l4 2.77a2 2 0 011 1.73V21" />
        </Svg>
      );

    case "legacy":
      // Crown
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            d="M2 20h20M4 20l2-8 6 4 4-10 4 10 2-4-2 8H4z" />
        </Svg>
      );

    case "careerist":
      // Trending up chart
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6" />
        </Svg>
      );

    case "virtue":
      // Star
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </Svg>
      );

    case "rogue":
      // Scales (balance)
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            d="M12 3v18M3 6l9-3 9 3M3 6l4.5 9H3a4.5 4.5 0 009 0H8L3 6zM21 6l-4.5 9H21a4.5 4.5 0 01-9 0h4.5L21 6z" />
        </Svg>
      );

    case "milestones":
      // Calendar / flag
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
        </Svg>
      );

    case "devotion":
      // Fire / flame
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            d="M12 2c1 3 2.5 3.5 3.5 5.5.5 1 .5 2.5-.5 3.5-1 1-2.5 1-3.5 0S9 10 8.5 9C7.5 7 9 6 10 3c.5-1 1.5-1 2-1z" />
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            d="M12 22c-2-2-4-4.5-4-7.5 0-2 1.5-3.5 4-5.5 2.5 2 4 3.5 4 5.5 0 3-2 5.5-4 7.5z" />
        </Svg>
      );

    default:
      // Generic diamond fallback
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </Svg>
      );
  }
}
