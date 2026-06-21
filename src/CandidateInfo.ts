import { LANGUAGE_CODES, LANGUAGE_NAMES, Language, checkColumns, labels, litColReadings, otherData, partsOfSpeech, pronunciationLabels, registers } from "./consts";
import { ConsumedString, nonEmptyArrayOrUndefined, parseCSV } from "./utils";

import type { InterfacePreferences } from "./types";

type KeyNameValue = [key: string, name: string, value: string];

function formatJyutping(jyutping: string): string;
function formatJyutping(jyutping: string | undefined): string | undefined;
function formatJyutping(jyutping: string | undefined) {
	return jyutping?.replace(/\d(?!$)/g, "$& ");
}

function formatGlyphonString(string: string) {
	return string < "\x80" ? formatJyutping(string) : `${string.replace(/[\0-\x7f]/g, "")}(${formatJyutping(string.replace(/[^0-~]/g, ""))})`
}

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
	canonicalHonzi?: string;
	canonicalJyutping?: string;
	componentsHonzi?: string;
	componentsJyutping?: string;
	pronOrder?: string;
	pronLabel?: string;
	litColReading?: string;
	properties: {
		partOfSpeech?: string;
		register?: string;
		label?: string;
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
			matchInputBuffer, honzi, jyutping, displayedHonzi, displayedJyutping,
			canonicalHonzi, canonicalJyutping, componentsHonzi, componentsJyutping,
			pronOrder, pronLabel, litColReading, partOfSpeech, register, label,
			written, vernacular, collocation, eng, hin, urd, nep, ind
		] = parseCSV(value);
		this.matchInputBuffer = matchInputBuffer;
		this.honzi = displayedHonzi || honzi;
		this.jyutping = formatJyutping(displayedJyutping || jyutping);
		this.canonicalHonzi = canonicalHonzi;
		this.canonicalJyutping = formatJyutping(canonicalJyutping);
		this.componentsHonzi = componentsHonzi;
		this.componentsJyutping = componentsJyutping;
		this.pronOrder = pronOrder;
		this.pronLabel = pronLabel;
		this.litColReading = litColReading;
		// dprint-ignore
		this.properties = {
			partOfSpeech, register, label, written, vernacular, collocation,
			definition: { eng, hin, urd, nep, ind }
		};
	}

	get canonicalReference() {
		if (!this.canonicalHonzi && !this.canonicalJyutping) return undefined;
		return this.canonicalHonzi
			? this.canonicalJyutping
				? `${this.canonicalHonzi}(${this.canonicalJyutping})`
				: this.canonicalHonzi
			: this.canonicalJyutping;
	}

	get pronunciationType() {
		const types = [
			...new Set(
				this.pronLabel?.split("|").map(
					pronLabel => pronunciationLabels[pronLabel] || pronLabel,
				),
			),
		];
		const [litOrCol, dir, relatedReadings] = this.litColReading ? this.litColReading.split(/(<|>)/) : [];
		if (litOrCol in litColReadings) types.push(`${litColReadings[litOrCol]!} ${dir} ${relatedReadings.split("|").map(formatGlyphonString).join("/")}`);
		return types.length ? `(${types.join(", ")})` : undefined;
	}

	get formattedPartsOfSpeech() {
		return nonEmptyArrayOrUndefined([
			...new Set(
				this.properties.partOfSpeech?.split("|").map(
					partOfSpeech => partsOfSpeech[partOfSpeech] || partOfSpeech,
				),
			),
		]);
	}

	get formattedRegister() {
		return nonEmptyArrayOrUndefined([
			...new Set(
				this.properties.register?.split("|").map(
					register => registers[register] || register,
				),
			),
		]);
	}

	get formattedLabels() {
		return nonEmptyArrayOrUndefined([
			...new Set(
				this.properties.label?.split("|").flatMap(word => {
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
		if (this.canonicalReference) return undefined;
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
			|| !!this.canonicalReference
			|| [...preferences.displayLanguages].some(language => this.properties.definition[language]));
	}
}
