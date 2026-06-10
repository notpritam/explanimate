// ABOUTME: Remotion CLI config — wires Tailwind v4 into Remotion's webpack bundle and sets the entry point.
// ABOUTME: Without enableTailwind, rendered videos would lose all Tailwind styling. Do not remove.
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.overrideWebpackConfig(enableTailwind);
Config.setVideoImageFormat("jpeg");
Config.setEntryPoint("src/remotion/index.ts");
Config.setOverwriteOutput(true);
