import { useState, useEffect, useRef, useCallback } from "react";

import Candidate from "./Candidate";
import CandidateInfo from "./CandidateInfo";
import CaretFollower from "./CaretFollower";
import { RIME_KEY_MAP } from "./consts";
import DictionaryPanel from "./DictionaryPanel";
import Rime from "./rime";
import { isPrintable, notify } from "./utils";

import type { InputState, InterfacePreferences, RimeResult } from "./types";

export default function CandidatePanel({ runAsyncTask, textArea, prefs, deployStatus }: {
	runAsyncTask(asyncTask: () => Promise<void>): void;
	textArea: HTMLTextAreaElement;
	prefs: InterfacePreferences;
	deployStatus: number;
}) {
	const [inputState, setInputState] = useState<InputState | undefined>();
	const [showDictionaryIndex, setShowDictionaryIndex] = useState<number | undefined>();
	const candidateList = useRef<HTMLTableElement>(null);
	const dictionaryPanel = useRef<HTMLDivElement>(null);
	const composedText = useRef("");

	const hideDictionary = useCallback(() => {
		setShowDictionaryIndex(undefined);
	}, [setShowDictionaryIndex]);

	const insert = useCallback((newText: string) => {
		const { selectionStart, selectionEnd } = textArea;
		textArea.value = textArea.value.slice(0, selectionStart) + newText + textArea.value.slice(selectionEnd);
		textArea.selectionStart = textArea.selectionEnd = selectionStart + newText.length;
	}, [textArea]);

	const handleRimeResult = useCallback((promise: Promise<RimeResult>, key?: string) =>
		runAsyncTask(async () => {
			let type: "warning" | "error" | undefined;
			try {
				const result = await promise;
				if (!result.success) {
					type = "warning";
				}
				const state = result.isComposing
					? {
						inputBuffer: result.inputBuffer,
						highlightedIndex: result.highlightedIndex,
						candidates: result.candidates.map(
							({ label, text, comment }, i) => new CandidateInfo(label || `${(i + 1) % 10}.`, text, comment),
						),
						isPrevDisabled: !result.page,
						isNextDisabled: result.isLastPage,
					}
					: inputState;
				if (result.committed) {
					insert(result.committed);
				}
				else if (!state && key && isPrintable(key)) {
					insert(key);
				}
				setInputState(result.isComposing ? state : undefined);
				hideDictionary();
			}
			catch {
				type = "error";
			}
			if (type) {
				notify(type, "執行操作", "performing the operation");
			}
			textArea.focus();
		}), [hideDictionary, inputState, insert, runAsyncTask, textArea]);

	const processKey = useCallback((input: string, key?: string) => handleRimeResult(Rime.processKey(input), key), [handleRimeResult]);
	const flipPage = useCallback((backward: boolean) => handleRimeResult(Rime.flipPage(backward)), [handleRimeResult]);
	const selectCandidate = useCallback((index: number) => handleRimeResult(Rime.selectCandidate(index)), [handleRimeResult]);
	const deleteCandidate = useCallback((index: number) => handleRimeResult(Rime.deleteCandidate(index)), [handleRimeResult]);

	const parseKey = useCallback((event: KeyboardEvent) => {
		const { code, key } = event;
		const hasControl = event.getModifierState("Control");
		const hasMeta = event.getModifierState("Meta");
		const hasAlt = event.getModifierState("Alt");
		const hasShift = event.getModifierState("Shift");
		if (
			(inputState || (
				document.activeElement === textArea
				&& (!hasControl && (isPrintable(key) || !hasShift && key === "F4") || key === "`")
				&& !hasMeta
				&& !hasAlt
			)) && code
		) {
			const match = /^(Control|Meta|Alt|Shift)(Left|Right)$/.exec(code);
			const isNumpadKey = code.startsWith("Numpad");
			const modifiers = new Set<string>();
			if (hasControl) {
				modifiers.add("Control");
			}
			if (hasMeta) {
				modifiers.add("Meta");
			}
			if (hasAlt) {
				modifiers.add("Alt");
			}
			if (hasShift) {
				modifiers.add("Shift");
			}
			if (match) {
				modifiers.delete(match[1]);
				modifiers.add(`${match[1]}_${match[2][0]}`);
			}
			else {
				let rimeKey = isNumpadKey ? code.slice(6) : key;
				rimeKey = RIME_KEY_MAP[rimeKey] || rimeKey;
				modifiers.add(isNumpadKey ? `KP_${rimeKey}` : rimeKey);
			}
			return [...modifiers].join("+");
		}
		return undefined;
	}, [inputState, textArea]);

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			const key = parseKey(event);
			if (key) {
				event.preventDefault();
				processKey(`{${key}}`, event.key);
			}
		}
		function onKeyUp(event: KeyboardEvent) {
			if (inputState) {
				const key = parseKey(event);
				if (key) processKey(`{Release+${key}}`);
			}
		}
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("keyup", onKeyUp);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("keyup", onKeyUp);
		};
	}, [inputState, parseKey, processKey]);

	useEffect(() => {
		// Android virtual keyboards (e.g. Gboard) send `keydown` events with `key: "Unidentified"` and compose text into the textarea directly,
		// so take back the characters they insert and pass them to Rime instead
		let snapshot: { value: string; selectionStart: number; selectionEnd: number } | undefined;
		function onBeforeInput() {
			const { value, selectionStart, selectionEnd } = textArea;
			snapshot = { value, selectionStart, selectionEnd };
		}
		function onInput(event: Event) {
			const { inputType } = event as InputEvent;
			if (!snapshot) return;
			const { value, selectionStart, selectionEnd } = snapshot;
			snapshot = undefined;
			const composed = composedText.current;
			composedText.current = "";
			let keys: string[] | undefined;
			if (inputType === "insertText" || inputType === "insertCompositionText") {
				let prefix = 0;
				while (prefix < value.length && value[prefix] === textArea.value[prefix]) prefix++;
				let suffix = 0;
				while (suffix < value.length - prefix && value[value.length - 1 - suffix] === textArea.value[textArea.value.length - 1 - suffix]) suffix++;
				const inserted = textArea.value.slice(prefix, textArea.value.length - suffix);
				if (prefix + suffix === value.length && [...inserted].every(isPrintable)) {
					const isComposition = inputType === "insertCompositionText";
					// The keyboard may keep its own composition and send the whole word again on every keystroke, so only pass the difference
					if (composed && inserted.startsWith(composed) && (inserted.length > composed.length || !isComposition)) {
						keys = [...inserted.slice(composed.length)];
					}
					else if (composed && composed.startsWith(inserted) && inserted.length < composed.length && isComposition) {
						keys = Array<string>(composed.length - inserted.length).fill("Backspace");
					}
					else if (inserted) {
						keys = [...inserted];
					}
					if (isComposition) composedText.current = inserted;
				}
			}
			else if (inputState && inputType === "deleteContentBackward") {
				keys = ["Backspace"];
			}
			else if (inputState && inputType === "insertLineBreak") {
				keys = ["Enter"];
			}
			if (keys) {
				textArea.value = value;
				textArea.selectionStart = selectionStart;
				textArea.selectionEnd = selectionEnd;
				for (const key of keys) {
					processKey(`{${RIME_KEY_MAP[key] || key}}`, key);
				}
			}
		}
		textArea.addEventListener("beforeinput", onBeforeInput);
		textArea.addEventListener("input", onInput);
		return () => {
			textArea.removeEventListener("beforeinput", onBeforeInput);
			textArea.removeEventListener("input", onInput);
		};
	}, [inputState, processKey, textArea]);

	useEffect(() => {
		setInputState(undefined);
		hideDictionary();
	}, [deployStatus, setInputState, hideDictionary]);

	const hideDictionaryOnLeaveCandidate = useCallback(() => {
		function hideDictionaryOnLeaveDictionaryPanel() {
			if (!candidateList.current?.matches(":hover")) {
				hideDictionary();
			}
			dictionaryPanel.current?.removeEventListener("mouseleave", hideDictionaryOnLeaveDictionaryPanel);
			dictionaryPanel.current?.removeEventListener("touchend", hideDictionaryOnLeaveDictionaryPanel);
		}
		if (dictionaryPanel.current?.matches(":hover")) {
			dictionaryPanel.current.addEventListener("mouseleave", hideDictionaryOnLeaveDictionaryPanel);
			dictionaryPanel.current.addEventListener("touchend", hideDictionaryOnLeaveDictionaryPanel);
		}
		else if (!candidateList.current?.matches(":hover")) {
			hideDictionary();
		}
	}, [hideDictionary]);

	const shouldShowDictionary = typeof showDictionaryIndex === "number";
	return inputState && <CaretFollower textArea={textArea} className="candidate-panel">
		<div>
			<div className="flex">
				<div className="flex-1 text-[15pt]">
					{inputState.inputBuffer.before && <span className="m-1 inline-block">{inputState.inputBuffer.before}</span>}
					{inputState.inputBuffer.active && <span className="p-1 inline-block rounded-md bg-accent text-accent-content">{inputState.inputBuffer.active}</span>}
					{inputState.inputBuffer.after && <span className="m-1 inline-block">{inputState.inputBuffer.after}</span>}
				</div>
				<div className="join">
					<button className="page-nav join-item" disabled={inputState.isPrevDisabled} onClick={() => flipPage(true)}>
						<span className="relative bottom-1">‹</span>
					</button>
					<button className="page-nav join-item" disabled={inputState.isNextDisabled} onClick={() => flipPage(false)}>
						<span className="relative bottom-1">›</span>
					</button>
				</div>
			</div>
			<table ref={candidateList} className="candidates">
				{inputState.candidates.map((candidate, index) =>
					<Candidate
						key={index}
						info={candidate}
						isHighlighted={index === (shouldShowDictionary ? showDictionaryIndex : inputState.highlightedIndex)}
						selectCandidate={() => selectCandidate(index)}
						deleteCandidate={() => deleteCandidate(index)}
						showDictionary={() => setShowDictionaryIndex(index)}
						hideDictionary={hideDictionaryOnLeaveCandidate}
						prefs={prefs} />
				)}
			</table>
		</div>
		{shouldShowDictionary && <DictionaryPanel info={inputState.candidates[showDictionaryIndex]} prefs={prefs} ref={dictionaryPanel} />}
	</CaretFollower>;
}
