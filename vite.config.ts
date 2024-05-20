import react from "@vitejs/plugin-react-swc";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";

import type { PluginCreator } from "postcss";
import type { UserConfig } from "vite";

export default {
	base: "/web/",
	plugins: [react()],
	css: {
		postcss: {
			plugins: [
				tailwindcss as PluginCreator<unknown>,
				autoprefixer,
			],
		},
	},
	build: {
		target: "es2017",
	},
} satisfies UserConfig;
