import { useEffect } from "react";

import { useMedia } from "react-use";

import { useLocalStorageState } from "./hooks";

export default function ThemeSwitcher() {
	const systemTheme = useMedia("(prefers-color-scheme: dark)") ? "dark" : "light";
	const [theme = systemTheme, setTheme] = useLocalStorageState<"light" | "dark" | undefined>("theme");

	useEffect(() => {
		document.documentElement.dataset["theme"] = theme;
	}, [theme]);

	// From https://daisyui.com/components/theme-controller/#theme-controller-using-a-toggle-with-icons-inside
	return <label className="cursor-pointer grid place-items-center">
		<input
			type="checkbox"
			checked={theme === "dark"}
			onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
			className="toggle bg-base-content row-start-1 col-start-1 col-span-2" />
		<span className="sr-only">Theme Switcher</span>
		<svg
			className="col-start-1 row-start-1 stroke-base-100 fill-base-100 size-3.5"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round">
			<circle cx="12" cy="12" r="5" />
			<path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
		</svg>
		<svg
			className="col-start-2 row-start-1 stroke-base-100 fill-base-100 size-3.5"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round">
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
		</svg>
	</label>;
}
