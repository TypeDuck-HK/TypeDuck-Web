import { useEffect, useReducer, useState } from "react";

import { ToastContainer } from "react-toastify";

import CandidatePanel from "./CandidatePanel";
import { NO_AUTO_FILL } from "./consts";
import { usePreferences } from "./hooks";
import Preferences from "./Preferences";
import Rime, { subscribe } from "./rime";
import ThemeSwitcher from "./ThemeSwitcher";
import Toolbar from "./Toolbar";
import { notify } from "./utils";

export default function App() {
	const [textArea, setTextArea] = useState<HTMLTextAreaElement | null>(null);
	const [loading, setLoading] = useState(true);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(subscribe("initialized", success => {
		if (!success) {
			notify("error", "啟動輸入法引擎", "initializing the input method engine");
		}
		setLoading(false);
	}));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(subscribe("deployStatusChanged", status => {
		switch (status) {
			case "start":
				setLoading(true);
				break;
			case "failure":
				notify("warning", "重新整理", "refreshing");
				// falls through
			case "success":
				setLoading(false);
				break;
		}
	}));

	const [deployStatus, updateDeployStatus] = useReducer((n: number) => n + 1, 0);
	const preferences = usePreferences();
	const { pageSize, enableCompletion, enableCorrection, enableSentence, enableLearning, isCangjie5 } = preferences;
	useEffect(() => {
		async function updateRimePreferences() {
			setLoading(true);
			let type: "warning" | "error" | undefined;
			try {
				const success = await Rime.customize({ pageSize, enableCompletion, enableCorrection, enableSentence, enableLearning, isCangjie5 });
				if (!(await Rime.deploy() && success)) {
					type = "warning";
				}
			}
			catch {
				type = "error";
			}
			if (type) {
				notify(type, "套用設定", "applying the settings");
			}
			setLoading(false);
			updateDeployStatus();
		}
		void updateRimePreferences();
	}, [pageSize, enableCompletion, enableCorrection, enableSentence, enableLearning, isCangjie5, updateDeployStatus]);

	return <>
		<header className="p-8 border-b border-base-300 flex items-center">
			<a className="mr-4 w-48" href="/">
				<img src="/images/logo.png" alt="TypeDuck Logo" />
			</a>
			<h1 className="flex-1 text-2xl">TypeDuck 網頁版</h1>
			<ThemeSwitcher />
		</header>
		<main className="m-auto p-8 max-w-7xl">
			<Toolbar loading={loading} deployStatus={deployStatus} />
			<textarea className="block w-full min-h-64 my-6 textarea textarea-bordered text-lg px-3" ref={setTextArea} {...NO_AUTO_FILL} />
			{textArea && <CandidatePanel setLoading={setLoading} textArea={textArea} prefs={preferences} deployStatus={deployStatus} />}
			<Preferences {...preferences} />
		</main>
		<footer className="footer footer-center p-6 bg-secondary text-secondary-content">
			<aside>
				© Copyright 2024 TypeDuck Team. All rights reserved.
				<a href="https://github.com/TypeDuck-HK/TypeDuck-Web" target="_blank" rel="noreferrer">
					Source Code
				</a>
			</aside>
		</footer>
		<ToastContainer className="whitespace-pre-line" />
	</>;
}
