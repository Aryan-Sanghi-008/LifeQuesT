import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { AchievementIconCategory } from './achievementIconCategories';

interface Props {
  category: AchievementIconCategory;
  color: string;
  size?: number;
}

export function AchievementCategoryIcon({ category, color, size = 40 }: Props) {
  switch (category) {
    case 'wealth':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
          <Path
            d="M12 6v12M9.5 8.5h3.8a2.2 2.2 0 010 4.4H9.5M9.5 11.1h4.5a2.2 2.2 0 010 4.4H9.5"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'mind':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M8 5.5A4.5 4.5 0 0112 4a4.5 4.5 0 014 1.5c2.2 1.1 3.5 3.2 3.5 5.5 0 4.1-3.4 7.5-7.5 7.5S4.5 15.1 4.5 11c0-2.3 1.3-4.4 3.5-5.5z"
            stroke={color}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          <Path d="M9.5 11.5h5M12 9v5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      );
    case 'health':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 20s-6.5-4.2-6.5-9.2C5.5 7.6 8.2 5 12 5s6.5 2.6 6.5 5.8C18.5 15.8 12 20 12 20z"
            stroke={color}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          <Path d="M12 9v4M10 11h4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      );
    case 'social':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="9" cy="9" r="3" stroke={color} strokeWidth={1.8} />
          <Circle cx="16.5" cy="10.5" r="2.5" stroke={color} strokeWidth={1.8} />
          <Path
            d="M4.5 18.5c.8-2.8 2.6-4.5 4.5-4.5s3.7 1.7 4.5 4.5M13.5 17.5c.5-1.8 1.7-3 3-3s2.5 1.2 3 3"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'career':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="4" y="8" width="16" height="11" rx="2" stroke={color} strokeWidth={1.8} />
          <Path d="M9 8V6.5A2.5 2.5 0 0111.5 4h1A2.5 2.5 0 0115 6.5V8" stroke={color} strokeWidth={1.8} />
          <Path d="M4 12h16" stroke={color} strokeWidth={1.8} />
        </Svg>
      );
    case 'family':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 3l2.2 4.5 5 .7-3.6 3.5.9 5L12 14.8 7.5 16.7l.9-5L4.8 8.2l5-.7L12 3z" fill={color} />
        </Svg>
      );
    case 'adventure':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth={1.8} />
          <Path
            d="M12 4.5l1.2 4.2 4.2 1.2-4.2 1.2L12 15.3l-1.2-4.2-4.2-1.2 4.2-1.2L12 4.5z"
            fill={color}
          />
          <Circle cx="12" cy="12" r="1.5" fill="#0D1117" />
        </Svg>
      );
    case 'legacy':
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </Svg>
      );
  }
}
