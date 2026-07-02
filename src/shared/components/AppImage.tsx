import { Image, ImageProps, ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';

type AppImageProps = {
  source: ImageSourcePropType | { uri: string };
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
  resizeMode?: ImageProps['resizeMode'];
};

let FastImage: typeof import('@d11/react-native-fast-image').default | null = null;

function getFastImage() {
  if (FastImage) return FastImage;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    FastImage = require('@d11/react-native-fast-image').default;
  } catch {
    FastImage = null;
  }
  return FastImage;
}

function isRemoteSource(source: AppImageProps['source']): source is { uri: string } {
  return typeof source === 'object' && source != null && 'uri' in source && typeof source.uri === 'string';
}

/** Uses FastImage for remote URIs; falls back to RN Image for bundled assets. */
export function AppImage({ source, style, accessibilityLabel, resizeMode }: AppImageProps) {
  const FastImageComponent = getFastImage();
  if (FastImageComponent && isRemoteSource(source) && source.uri.startsWith('http')) {
    return (
      <FastImageComponent
        style={style as StyleProp<import('@d11/react-native-fast-image').ImageStyle>}
        accessibilityLabel={accessibilityLabel}
        resizeMode={FastImageComponent.resizeMode.cover}
        source={{
          uri: source.uri,
          priority: FastImageComponent.priority.normal,
          cache: FastImageComponent.cacheControl.immutable,
        }}
      />
    );
  }
  return (
    <Image
      source={source as ImageSourcePropType}
      style={style}
      accessibilityLabel={accessibilityLabel}
      resizeMode={resizeMode}
    />
  );
}
