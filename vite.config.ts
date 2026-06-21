import react from "@vitejs/plugin-react-swc";
import autoprefixer from "autoprefixer";
import postCSSNesting from "postcss-nesting";
import tailwindcss from "tailwindcss";
import tailwindcssNesting from "tailwindcss/nesting";

import type { UserConfig } from "vite";

export default {
	base: "/TypeDuck-Web/aap2-alpha/",
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
	server: {
		watch: {
			ignored: ["**/boost/**", "**/build/**", "**/librime/**", "**/schema/**"],
		},
	},
} satisfies UserConfig;
