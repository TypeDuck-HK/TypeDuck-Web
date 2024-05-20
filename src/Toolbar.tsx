import { useEffect, useRef, useState } from "react";

import { useRimeOption } from "./hooks";

export default function Toolbar({ loading, deployStatus }: { loading: boolean; deployStatus: number }) {
	const [debouncedLoading, setDebouncedLoading] = useState(loading);
	const timeout = useRef<ReturnType<typeof setTimeout>>();
	useEffect(() => {
		function clear() {
			if (typeof timeout.current !== "undefined") {
				clearTimeout(timeout.current);
				timeout.current = undefined;
			}
		}
		if (loading) {
			timeout.current = setTimeout(() => setDebouncedLoading(true), 200);
			return clear;
		}
		else {
			setDebouncedLoading(false);
			return clear();
		}
	}, [loading]);

	useRimeOption("soft_cursor", true, deployStatus); // Not modifiable by user
	const [isASCIIMode, toggleIsASCIIMode] = useRimeOption("ascii_mode", false, deployStatus);
	const [isSimplified, toggleIsSimplified] = useRimeOption("simplification", false, deployStatus);
	const [isFullwidthLettersAndSymbols, toggleIsFullwidthLettersAndSymbols] = useRimeOption("full_shape", false, deployStatus, "isFullwidthLettersAndSymbols");
	const [isHalfwidthPunctuation, toggleIsHalfwidthPunctuation] = useRimeOption("ascii_punct", false, deployStatus, "isHalfwidthPunctuation");
	return <div>
		<div className="join align-middle">
			<div className="tooltip" data-tip={"中文／英文字母\nChinese / Alphabet"}>
				<button className="btn-toolbar join-item" onClick={toggleIsASCIIMode}>{isASCIIMode ? "En" : "中"}</button>
			</div>
			<div className="tooltip" data-tip={"繁體字／簡體字\nTraditional / Simplified"}>
				<button className="btn-toolbar join-item" onClick={toggleIsSimplified}>{isSimplified ? "简" : "繁"}</button>
			</div>
			<div className="tooltip" data-tip={"半形／全形字母及符號\nHalfwidth / Fullwidth Letters & Symbols"}>
				<button className="btn-toolbar join-item" onClick={toggleIsFullwidthLettersAndSymbols}>{isFullwidthLettersAndSymbols ? "全" : "半"}</button>
			</div>
			<div className="tooltip" data-tip={"半形／全形標點符號\nHalfwidth / Fullwidth Punctuations"}>
				<button className="btn-toolbar join-item" onClick={toggleIsHalfwidthPunctuation}>{isHalfwidthPunctuation ? "." : "。"}</button>
			</div>
		</div>
		{debouncedLoading && <span className="text-base-content-200">
			<div className="mx-3 align-middle loading loading-spinner loading-lg" />載入中 Loading…
		</span>}
	</div>;
}
