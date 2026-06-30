module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin",
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@features": "./src/features",
            "@components": "./src/shared/components",
            "@shared": "./src/shared",
            "@store": "./src/store",
            "@hooks": "./src/shared/hooks",
            "@utils": "./src/shared/utils",
            "@constants": "./src/constants",
            "@types": "./src/types",
            "@navigation": "./src/navigation",
            "@engine": "./src/engine",
            "@services": "./src/services",
            "@config": "./src/config",
            "@theme": "./src/shared/theme",
            "@data": "./src/data",
          },
        },
      ],
    ],
  };
};
