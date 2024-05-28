import react from "@vitejs/plugin-react-swc";
import autoprefixer from "autoprefixer";
import postCSSNesting from "postcss-nesting";
import tailwindcss from "tailwindcss";
import tailwindcssNesting from "tailwindcss/nesting";

import type { UserConfig } from "vite";

export default {
	base: "/web/",
	plugins: [react()],
	css: {
		postcss: {
			plugins: [
				tailwindcssNesting(postCSSNesting({ edition: "2024-02" })),
				tailwindcss(),
				autoprefixer(),
			],
		},
	},
	build: {
		target: "es2017",
	},
} satisfies UserConfig;
