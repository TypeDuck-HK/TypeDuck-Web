import daisyui from "daisyui";

import type { Config as DaisyUIConfig } from "daisyui";
import type { Config } from "tailwindcss";

export default {
	important: true,
	content: ["./src/**/*"],
	theme: {
		fontFamily: {
			"serif": ["var(--font-serif)", "var(--font-emoji)"],
			"sans": ["var(--font-sans)", "var(--font-emoji)"],
			"geometric": ["var(--font-geometric)", "var(--font-sans)", "var(--font-emoji)"],
			"sung": ["var(--font-sung)", "var(--font-serif)", "var(--font-emoji)"],
			"hei": ["var(--font-hei)", "var(--font-sans)", "var(--font-emoji)"],
			"kai-fallback-sung": ["var(--font-kai)", "var(--font-sung)", "var(--font-serif)", "var(--font-emoji)"],
			"kai-fallback-hei": ["var(--font-kai)", "var(--font-hei)", "var(--font-sans)", "var(--font-emoji)"],
			"devanagari": ["var(--font-devanagari)", "var(--font-sans)", "var(--font-emoji)"],
			"arabic": ["var(--font-arabic)", "var(--font-sans)", "var(--font-emoji)"],
		},
		colors: {
			"primary-content-200": "rgb(var(--primary-content-200) / <alpha-value>)",
			"highlighted": "rgb(var(--highlighted) / <alpha-value>)",
			"base-400": "rgb(var(--base-400) / <alpha-value>)",
			"base-500": "rgb(var(--base-500) / <alpha-value>)",
			"base-content-200": "rgb(var(--base-content-200) / <alpha-value>)",
			"base-content-300": "rgb(var(--base-content-300) / <alpha-value>)",
			"base-content-400": "rgb(var(--base-content-400) / <alpha-value>)",
			"link": "rgb(var(--link) / <alpha-value>)",
			"link-focus": "rgb(var(--link-focus) / <alpha-value>)",
		},
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				light: {
					"color-scheme": "light",
					"primary": "#dfa852", // control options
					"primary-content": "#483312", // control options
					"--primary-content-200": "155 96 0", // #9b6000 inactive segment
					"--highlighted": "254 220 156", // #fedc9c highlighted candidate
					"secondary": "#fef3d2", // footer background
					"secondary-content": "#4c422c", // footer
					"accent": "#f6ead8", // input buffer background
					"accent-content": "#463a2a", // input buffer
					"neutral": "#efede8", // tooltip background
					"neutral-content": "#3f3b34", // tooltip
					"base-100": "#ffffff", // candidate panel and text box background
					"base-200": "#fefefd", // body background
					"base-300": "#f6f3ed", // dictionary panel and subtle surfaces
					"--base-400": "222 217 207", // #ded9cf candidate panel border
					"--base-500": "189 183 173", // #bdb7ad disabled page nav buttons
					"base-content": "#282725", // body
					"--base-content-200": "94 86 75", // #5e564b label
					"--base-content-300": "105 80 44", // #69502c pronunciation
					"--base-content-400": "97 76 52", // #614c34 definition
					"--link": "155 96 0", // #9b6000 anchors
					"--link-focus": "99 67 8", // #634308 hover on anchors
				},
			},
			{
				dark: {
					"color-scheme": "dark",
					"primary": "#d4ae69", // control options
					"primary-content": "#241b0d", // control options
					"--primary-content-200": "231 181 87", // #e7b557 inactive segment
					"--highlighted": "114 84 39", // #725427 highlighted candidate
					"secondary": "#30291c", // footer background
					"secondary-content": "#ffe59a", // footer
					"accent": "#4d3b24", // input buffer background
					"accent-content": "#fff0c2", // input buffer
					"neutral": "#302e2a", // tooltip background
					"neutral-content": "#e5e1d6", // tooltip
					"base-100": "#181715", // body background
					"base-200": "#201e1c", // candidate panel background
					"base-300": "#36322d", // toggle buttons background
					"--base-400": "80 71 60", // #50473c candidate panel border
					"--base-500": "118 113 104", // #767168 disabled page nav buttons
					"base-content": "#fff8e9", // body
					"--base-content-200": "218 208 189", // #dad0bd label
					"--base-content-300": "251 223 163", // #fbdfa3 pronunciation
					"--base-content-400": "251 235 197", // #fbebc5 definition
					"--link": "202 159 79", // #ca9f4f anchors
					"--link-focus": "239 175 58", // #efaf3a hover on anchors
				},
			},
		],
	} satisfies DaisyUIConfig,
} satisfies Config;
