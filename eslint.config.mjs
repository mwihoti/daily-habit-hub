import nextConfig from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "android-twa/**",
      "artifacts/**",
      "cache/**",
      "typechain-types/**",
      "coverage/**",
    ],
  },
  ...nextConfig,
  {
    // Next 16's flat config turns on React Compiler hook rules that flag
    // existing data-loading effects and one-shot random UI. Leave those off
    // so lint stays about the design system, not a behavior rewrite.
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react/no-unescaped-entities": "off",
    },
  },
];

export default config;
