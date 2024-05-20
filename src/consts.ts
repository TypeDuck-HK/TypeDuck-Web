import type { CandidateEntry } from "./CandidateInfo";
import type { Preferences } from "./types";

export const enum Language {
	Eng = "eng",
	Hin = "hin",
	Ind = "ind",
	Nep = "nep",
	Urd = "urd",
}

export const enum ShowRomanization {
	Always = "always",
	ReverseOnly = "reverse_only",
	Never = "never",
}

export const LANGUAGE_CODES: Record<Language, string> = {
	[Language.Eng]: "en",
	[Language.Hin]: "hi",
	[Language.Ind]: "id",
	[Language.Nep]: "ne",
	[Language.Urd]: "ur",
};

export const LANGUAGE_NAMES: Record<Language, string> = {
	[Language.Eng]: "English",
	[Language.Hin]: "Hindi",
	[Language.Ind]: "Indonesian",
	[Language.Nep]: "Nepali",
	[Language.Urd]: "Urdu",
};

export const LANGUAGE_LABELS: Record<Language, string> = {
	[Language.Eng]: "英語 English",
	[Language.Hin]: "印地語 Hindi",
	[Language.Ind]: "印尼語 Indonesian",
	[Language.Nep]: "尼泊爾語 Nepali",
	[Language.Urd]: "烏爾都語 Urdu",
};

export const SHOW_ROMANIZATION_LABELS: Record<ShowRomanization, string> = {
	[ShowRomanization.Always]: "顯示 Always Show",
	[ShowRomanization.ReverseOnly]: "僅反查 Only in Reverse Lookup",
	[ShowRomanization.Never]: "隱藏 Hide",
};

export const DEFAULT_PREFERENCES: Preferences = {
	displayLanguages: new Set([Language.Eng]),
	mainLanguage: Language.Eng,
	pageSize: 6,
	isHeiTypeface: false,
	showRomanization: ShowRomanization.Always,
	enableCompletion: true,
	enableCorrection: false,
	enableSentence: true,
	enableLearning: true,
	showReverseCode: true,
	isCangjie5: true,
};

export const NO_AUTO_FILL = {
	autoComplete: "off",
	autoCorrect: "off",
	autoCapitalize: "off",
	spellCheck: "false",
} as const;

export const definitionLayout = [[Language.Eng, Language.Ind], [Language.Hin, Language.Nep], [Language.Urd]];

export const otherData: Record<string, Exclude<keyof CandidateEntry["properties"], "definition">> = {
	"Standard Form 標準字形": "normalized",
	"Written Form 書面語": "written",
	"Vernacular Form 口語": "vernacular",
	"Collocation 配搭": "collocation",
};

export const litColReadings: Record<string, string | undefined> = {
	lit: "literary reading 文讀",
	col: "colloquial reading 白讀",
};

export const registers: Record<string, string | undefined> = {
	wri: "written 書面語",
	ver: "vernacular 口語",
	for: "formal 公文體",
	lzh: "classical Chinese 文言",
};

export const partsOfSpeech: Record<string, string | undefined> = {
	n: "noun 名詞",
	v: "verb 動詞",
	adj: "adjective 形容詞",
	adv: "adverb 副詞",
	morph: "morpheme 語素",
	mw: "measure word 量詞",
	part: "particle 助詞",
	oth: "other 其他",
	x: "non-morpheme 非語素",
};

export const labels: Record<string, string | undefined> = {
	abbrev: "abbreviation 簡稱",
	astro: "astronomy 天文",
	ChinMeta: "sexagenary cycle 干支",
	horo: "horoscope 星座",
	org: "organisation 機構",
	person: "person 人名",
	place: "place 地名",
	reli: "religion 宗教",
	rare: "rare 罕見",
	composition: "compound 詞組",
};

export const checkColumns: (keyof CandidateEntry["properties"])[] = [
	"partOfSpeech",
	"register",
	"normalized",
	"written",
	"vernacular",
	"collocation",
];

export const RIME_KEY_MAP: Record<string, string | undefined> = {
	"Escape": "Escape",
	"F4": "F4",
	"Backspace": "BackSpace",
	"Delete": "Delete",
	"Tab": "Tab",
	"Enter": "Return",
	"Home": "Home",
	"End": "End",
	"PageUp": "Page_Up",
	"PageDown": "Page_Down",
	"ArrowUp": "Up",
	"ArrowRight": "Right",
	"ArrowDown": "Down",
	"ArrowLeft": "Left",
	"~": "asciitilde",
	"`": "quoteleft",
	"!": "exclam",
	"@": "at",
	"#": "numbersign",
	"$": "dollar",
	"%": "percent",
	"^": "asciicircum",
	"&": "ampersand",
	"*": "asterisk",
	"(": "parenleft",
	")": "parenright",
	"-": "minus",
	"_": "underscore",
	"+": "plus",
	"=": "equal",
	"{": "braceleft",
	"[": "bracketleft",
	"}": "braceright",
	"]": "bracketright",
	":": "colon",
	";": "semicolon",
	'"': "quotedbl",
	"'": "apostrophe",
	"|": "bar",
	"\\": "backslash",
	"<": "less",
	",": "comma",
	">": "greater",
	".": "period",
	"?": "question",
	"/": "slash",
	" ": "space",
};
