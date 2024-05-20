import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";

import type { RollupOptions } from "rollup";

const isProduction = process.env.NODE_ENV === "production";

export default {
	input: "src/worker.ts",
	output: {
		dir: "public",
		sourcemap: !isProduction,
		format: "iife",
	},
	plugins: [
		json(),
		nodeResolve(),
		esbuild({
			target: "es2017",
			sourceMap: !isProduction,
			minify: isProduction,
		}),
	],
} satisfies RollupOptions;
