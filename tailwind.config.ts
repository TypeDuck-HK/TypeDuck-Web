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
			"primary-content-300": "rgb(var(--primary-content-300) / <alpha-value>)",
			"primary-content-400": "rgb(var(--primary-content-400) / <alpha-value>)",
			"primary-content-500": "rgb(var(--primary-content-500) / <alpha-value>)",
			"base-400": "rgb(var(--base-400) / <alpha-value>)",
			"base-500": "rgb(var(--base-500) / <alpha-value>)",
			"base-content-200": "rgb(var(--base-content-200) / <alpha-value>)",
			"base-content-300": "rgb(var(--base-content-300) / <alpha-value>)",
			"base-content-400": "rgb(var(--base-content-400) / <alpha-value>)",
		},
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				light: {
					"color-scheme": "light",
					"primary": "#0a82fa", // highlighted candidate background
					"primary-content": "#f8fbff", // highlighted candidate
					"--primary-content-200": "229 240 255", // #e5f0ff highlighted label
					"--primary-content-300": "212 230 255", // #d4e6ff highlighted pronunciation
					"--primary-content-400": "202 225 255", // #cae1ff highlighted definition
					"--primary-content-500": "135 195 255", // #87c3ff part of speech border
					"secondary": "#d4ebff", // footer background
					"secondary-content": "#0659a7", // footer
					"accent": "#c7e3ff", // input buffer background
					"accent-content": "#05417d", // input buffer
					"neutral": "#e5ebf1", // tooltip background
					"neutral-content": "#214361", // tooltip
					"base-100": "#ffffff", // body background
					"base-200": "#f9fafb", // candidate panel background
					"base-300": "#eceef1", // toggle buttons background
					"--base-400": "222 225 227", // #dee1e3 candidate panel border
					"--base-500": "181 183 185", // #b5b7b9 disabled page nav buttons
					"base-content": "#001635", // body
					"--base-content-200": "75 88 105", // #4b5869 label
					"--base-content-300": "67 89 117", // #435975 pronunciation
					"--base-content-400": "47 82 120", // #2f5278 definition
				},
			},
			{
				dark: {
					"color-scheme": "dark",
					"primary": "#0465c6", // highlighted candidate background
					"primary-content": "#f8fbff", // highlighted candidate
					"--primary-content-200": "229 240 255", // #e5f0ff highlighted label
					"--primary-content-300": "212 230 255", // #d4e6ff highlighted pronunciation
					"--primary-content-400": "202 225 255", // #cae1ff highlighted definition
					"--primary-content-500": "69 141 213", // #458dd5 part of speech border
					"secondary": "#103f6a", // footer background
					"secondary-content": "#d3e0ec", // footer
					"accent": "#104b8a", // input buffer background
					"accent-content": "#ddecff", // input buffer
					"neutral": "#26323e", // tooltip background
					"neutral-content": "#c5cfd3", // tooltip
					"base-100": "#0b121f", // body background
					"base-200": "#1c232a", // candidate panel background
					"base-300": "#343a44", // toggle buttons background
					"--base-400": "70 77 87", // #464d57 candidate panel border
					"--base-500": "116 112 129", // #747a81 disabled page nav buttons
					"base-content": "#ffffff", // body
					"--base-content-200": "214 224 235", // #d6e0eb label
					"--base-content-300": "207 219 232", // #cfdbe8 pronunciation
					"--base-content-400": "197 212 228", // #c5d4e4 definition
				},
			},
		],
	} satisfies DaisyUIConfig,
} satisfies Config;
