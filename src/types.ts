import type CandidateInfo from "./CandidateInfo";
import type { Language, ShowRomanization } from "./consts";
import type { Dispatch, SetStateAction } from "react";

export interface RimeAPI {
	init(): boolean;
	set_option(option: string, value: number): void;
	process_key(input: string): string;
	select_candidate(index: number): string;
	delete_candidate(index: number): string;
	flip_page(backward: boolean): string;
	customize(page_size: number, options: number): boolean;
	deploy(): boolean;
}

export interface Actions {
	setOption(option: string, value: boolean): Promise<void>;
	processKey(input: string): Promise<RimeResult>;
	selectCandidate(index: number): Promise<RimeResult>;
	deleteCandidate(index: number): Promise<RimeResult>;
	flipPage(backward: boolean): Promise<RimeResult>;
	customize(preferences: RimePreferences): Promise<boolean>;
	deploy(): Promise<boolean>;
}

interface InputBuffer {
	before: string;
	active: string;
	after: string;
}

interface RimeComposing {
	isComposing: true;
	inputBuffer: InputBuffer;
	page: number;
	isLastPage: boolean;
	highlightedIndex: number;
	candidates: {
		label?: string;
		text: string;
		comment?: string;
	}[];
}

interface RimeNotComposing {
	isComposing: false;
}

interface RimePayload {
	success: boolean;
	committed?: string;
}

export type RimeResult = (RimeComposing | RimeNotComposing) & RimePayload;

export type RimeDeployStatus = "start" | "success" | "failure";

export interface RimeNotification {
	deploy: RimeDeployStatus;
	schema: `${string}/${string}`;
	option: string;
}

export interface ListenerArgsMap {
	deployStatusChanged: [status: RimeDeployStatus];
	schemaChanged: [id: string, name: string];
	optionChanged: [option: string, value: boolean];
	initialized: [success: boolean];
}

interface NamedMessage<K extends keyof Actions> {
	name: K;
	args: Parameters<Actions[K]>;
	resolve: (value: ReturnType<Actions[K]>) => void;
	reject: (reason: unknown) => void;
}

export type Message = NamedMessage<keyof Actions>;

export interface InputState {
	isPrevDisabled: boolean;
	isNextDisabled: boolean;
	inputBuffer: InputBuffer;
	candidates: CandidateInfo[];
	highlightedIndex: number;
}

export interface RimePreferences {
	pageSize: number;
	enableCompletion: boolean;
	enableCorrection: boolean;
	enableSentence: boolean;
	enableLearning: boolean;
	isCangjie5: boolean;
}

export interface InterfacePreferences {
	displayLanguages: Set<Language>;
	mainLanguage: Language;
	isHeiTypeface: boolean;
	showRomanization: ShowRomanization;
	showReverseCode: boolean;
}

export type Preferences = RimePreferences & InterfacePreferences;

export type PreferencesWithSetter = Preferences & { [P in keyof Preferences as `set${Capitalize<P>}`]: Dispatch<SetStateAction<Preferences[P]>> };
