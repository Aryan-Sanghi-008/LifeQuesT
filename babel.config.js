module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@features': './src/features',
            '@components': './src/components',
            '@store': './src/store',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@constants': './src/constants',
            '@types': './src/types',
            '@navigation': './src/navigation',
            '@engine': './src/engine',
            '@services': './src/services',
            '@config': './src/config',
            '@theme': './src/theme',
            '@data': './src/data',
          },
        },
      ],
    ],
  };
};
