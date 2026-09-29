import { baseConfig, nodeConfig, reactConfig } from "@labs/eslint-config";

export default [
  { ignores: ["**/dist/**", "**/coverage/**", "templates/**", "**/drizzle/**"] },
  ...baseConfig,
  ...nodeConfig([
    "packages/*/src/**/*.ts",
    "labs/*/server/**/*.ts",
    "labs/*/attacker/**/*.mjs",
    "scripts/**/*.mjs",
  ]),
  ...reactConfig(["packages/ui-kit/src/**/*.tsx", "labs/*/client/src/**/*.tsx"]),
];
