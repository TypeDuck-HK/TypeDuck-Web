import { useEffect, useRef } from "react";

import { useLongPress } from "react-use";

import CandidateInfo from "./CandidateInfo";
import { LANGUAGE_CODES, ShowRomanization, definitionLayout } from "./consts";

import type { InterfacePreferences } from "./types";
import type { MouseEvent } from "react";

export default function Candidate({ isHighlighted, info, selectCandidate, deleteCandidate, showDictionary, hideDictionary, prefs }: {
	isHighlighted: boolean;
	info: CandidateInfo;
	selectCandidate(): void;
	deleteCandidate(): void;
	showDictionary(): void;
	hideDictionary(): void;
	prefs: InterfacePreferences;
}) {
	const justDeletedCandidate = useRef(false);
	function _deleteCandidate() {
		deleteCandidate();
		justDeletedCandidate.current = true;
	}
	const { onMouseDown: startLongPress, onMouseUp: cancelLongPress } = useLongPress(_deleteCandidate, { isPreventDefault: false, delay: 800 });
	const numOfMoves = useRef(0);
	useEffect(() => {
		numOfMoves.current = 0;
	}, [info]);
	function _selectCandidate() {
		if (justDeletedCandidate.current) {
			justDeletedCandidate.current = false;
		}
		else {
			cancelLongPress();
			selectCandidate();
		}
	}
	function _showDictionary(event: MouseEvent) {
		if (numOfMoves.current++ >= 2) {
			event.preventDefault();
			showDictionary();
		}
	}
	function _hideDictionary() {
		cancelLongPress();
		hideDictionary();
	}
	const showJyutping = prefs.showRomanization === ShowRomanization.Always || prefs.showRomanization === ShowRomanization.ReverseOnly && info.isReverseLookup;
	const commentStyle200 = isHighlighted ? "bg-primary text-primary-content-200" : "text-base-content-200";
	const commentStyle300 = isHighlighted ? "bg-primary text-primary-content-300" : "text-base-content-300";
	const commentStyle400 = isHighlighted ? "bg-primary text-primary-content-400" : "text-base-content-400";
	const labelColSpan = definitionLayout.filter(languages => languages.some(language => prefs.displayLanguages.has(language))).length;
	return <tbody>
		<button
			className={`contents join rounded-md${isHighlighted ? " highlighted" : ""}`}
			onClick={_selectCandidate}
			onMouseEnter={_showDictionary}
			onMouseMove={_showDictionary}
			onMouseLeave={_hideDictionary}
			onMouseDown={startLongPress}
			onTouchStart={event => {
				startLongPress(event);
				showDictionary();
			}}
			onTouchMove={showDictionary}
			onTouchEnd={_hideDictionary}
			onTouchCancel={_hideDictionary}>
			{info.matchedEntries?.map((entry, index) =>
				<tr key={index}>
					<td className={`font-geometric text-[11pt] ${commentStyle200}`}>{!index && info.label}</td>
					<td className={isHighlighted ? "bg-primary" : ""}>
						{showJyutping && <div className={`text-[10pt] ${commentStyle300}`}>{entry.jyutping}</div>}
						<div className={`${prefs.isHeiTypeface ? "font-hei" : "font-sung"} font-extralight text-[13pt]${isHighlighted ? " text-primary-content" : ""}${showJyutping ? " tracking-[8pt]" : ""}`}>{entry.honzi}</div>
					</td>
					<td className={commentStyle400}>{!index && (!info.isReverseLookup || prefs.showReverseCode) && info.note}</td>
					{entry.isDictionaryEntry(prefs)
						? definitionLayout.flatMap((languages, index) => {
							const definitions = languages.flatMap(language =>
								prefs.displayLanguages.has(language)
									? [<div key={language} lang={LANGUAGE_CODES[language]}>{entry.properties.definition[language]}</div>]
									: []
							);
							return definitions.length ? [<td key={index} className={commentStyle400}>{definitions}</td>] : [];
						})
						: !!labelColSpan && <td className={commentStyle400} colSpan={labelColSpan}>{entry.formattedLabels?.join(" ")}</td>}
					<td className={`font-geometric text-[11pt] ${commentStyle200} align-middle`}>{!index && info.hasDictionaryEntry(prefs) && "ⓘ"}</td>
				</tr>
			) || <tr>
				<td className={`font-geometric text-[11pt] ${commentStyle200}`}>{info.label}</td>
				<td className={`${prefs.isHeiTypeface ? "font-hei" : "font-sung"} font-extralight text-[13pt]${isHighlighted ? " bg-primary text-primary-content" : ""}`}>{info.text}</td>
				<td className={commentStyle400} colSpan={labelColSpan + 2}>{(!info.isReverseLookup || prefs.showReverseCode) && info.note}</td>
			</tr>}
		</button>
	</tbody>;
}
