import { LANGUAGE_CODES, LANGUAGE_NAMES, Language, checkColumns, labels, litColReadings, otherData, partsOfSpeech, registers } from "./consts";
import { ConsumedString, nonEmptyArrayOrUndefined, parseCSV } from "./utils";

import type { InterfacePreferences } from "./types";

type KeyNameValue = [key: string, name: string, value: string];

export default class CandidateInfo {
	isReverseLookup: boolean;
	note: string;
	entries: CandidateEntry[];

	constructor(public label: string, public text: string, commentString = "") {
		const comment = new ConsumedString(commentString);
		this.isReverseLookup = comment.consume("\v");
		this.note = comment.consumeUntil("\f");
		this.entries = comment.isNotEmpty
			? comment.consume("\r")
				? String(comment).split("\r").map(csv => new CandidateEntry(csv))
				: String(comment).split("\f").map(pron => new CandidateEntry({ honzi: text, jyutping: pron.replace(/\v|; $/g, "") }))
			: [];
	}

	get matchedEntries() {
		return nonEmptyArrayOrUndefined(this.entries.filter(entry => entry.matchInputBuffer === "1"));
	}

	hasDictionaryEntry(preferences: InterfacePreferences) {
		return this.entries.some(entry => entry.isDictionaryEntry(preferences));
	}
}

export class CandidateEntry {
	matchInputBuffer?: string;
	honzi?: string;
	jyutping?: string;
	pronOrder?: string;
	sandhi?: string;
	litColReading?: string;
	properties: {
		partOfSpeech?: string;
		register?: string;
		label?: string;
		normalized?: string;
		written?: string;
		vernacular?: string;
		collocation?: string;
		definition: Partial<Record<Language, string>>;
	};

	isJyutpingOnly: boolean;

	constructor(value: string | { honzi: string; jyutping: string }) {
		if ((this.isJyutpingOnly = typeof value === "object")) {
			Object.assign(this, value);
			this.properties = { definition: {} };
			return;
		}
		// dprint-ignore
		const [
			matchInputBuffer, honzi, jyutping, pronOrder, sandhi, litColReading,
			partOfSpeech, register, label, normalized, written, vernacular, collocation,
			eng, urd, nep, hin, ind
		] = parseCSV(value);
		this.matchInputBuffer = matchInputBuffer;
		this.honzi = honzi;
		this.jyutping = jyutping?.replace(/\d(?!$)/g, "$& ");
		this.pronOrder = pronOrder;
		this.sandhi = sandhi;
		this.litColReading = litColReading;
		// dprint-ignore
		this.properties = {
			partOfSpeech, register, label, normalized, written, vernacular, collocation,
			definition: { eng, urd, nep, hin, ind }
		};
	}

	get pronunciationType() {
		const types: string[] = [];
		if (this.sandhi === "1") types.push("changed tone 變音");
		if (this.litColReading! in litColReadings) types.push(litColReadings[this.litColReading!]!);
		return types.length ? `(${types.join(", ")})` : undefined;
	}

	get formattedPartsOfSpeech() {
		return nonEmptyArrayOrUndefined([
			...new Set(
				this.properties.partOfSpeech?.split(" ").map(
					partOfSpeech => partsOfSpeech[partOfSpeech] || partOfSpeech,
				),
			),
		]);
	}

	get formattedRegister() {
		return registers[this.properties.register!];
	}

	get formattedLabels() {
		return nonEmptyArrayOrUndefined([
			...new Set(
				this.properties.label?.split(" ").flatMap(word => {
					for (const part of word.split("_")) if (labels[part]) return [`(${labels[part]})`];
					return [];
				}),
			),
		]);
	}

	get otherData() {
		return nonEmptyArrayOrUndefined<KeyNameValue>(
			Object.entries(otherData).flatMap(([name, key]) =>
				this.properties[key]
					? [[key, name, this.properties[key]!]]
					: []
			),
		);
	}

	otherLanguages(preferences: InterfacePreferences) {
		return nonEmptyArrayOrUndefined<KeyNameValue>(
			[...preferences.displayLanguages].flatMap(language =>
				language !== preferences.mainLanguage && this.properties.definition[language]
					? [[LANGUAGE_CODES[language], LANGUAGE_NAMES[language], this.properties.definition[language]!]]
					: []
			),
		);
	}

	isDictionaryEntry(preferences: InterfacePreferences) {
		return !this.isJyutpingOnly && (checkColumns.some(key => this.properties[key])
			|| [...preferences.displayLanguages].some(language => this.properties.definition[language]));
	}
}
