import { useCallback, useEffect, useState } from "react";

import { useLocalStorage as _useLocalStorage, useSet } from "react-use";

import { DEFAULT_PREFERENCES } from "./consts";
import Rime, { subscribe } from "./rime";
import { notify } from "./utils";

import type { Language } from "./consts";
import type { PreferencesWithSetter } from "./types";
import type { Dispatch, DispatchWithoutAction, SetStateAction } from "react";

type UseLocalStorageOptions<T> = { raw: true } | { raw: false; serializer: (value: T) => string; deserializer: (value: string) => T } | undefined;
export const useLocalStorage: {
	<T>(key: string, initialValue: T, options?: UseLocalStorageOptions<T>): [T, Dispatch<SetStateAction<T>>, () => void];
	<T>(key: string, initialValue?: T | undefined, options?: UseLocalStorageOptions<T>): [T | undefined, Dispatch<SetStateAction<T | undefined>>, () => void];
} = _useLocalStorage;

export function useLoading(): [boolean, (asyncTask: () => Promise<void>) => void, () => PromiseWithResolvers<void>] {
	const [promises, { add, remove }] = useSet<Promise<void>>();

	const runAsyncTask = useCallback((asyncTask: () => Promise<void>) => {
		async function processAsyncTask() {
			try {
				await asyncTask();
			}
			finally {
				remove(promise);
			}
		}
		const promise = processAsyncTask();
		add(promise);
	}, [add, remove]);

	const startAsyncTask = useCallback(() => {
		let resolve!: () => void;
		let reject!: () => void;
		const promise = new Promise<void>((_resolve, _reject) => {
			resolve = _resolve;
			reject = _reject;
		});
		runAsyncTask(() => promise);
		return { promise, resolve, reject };
	}, [runAsyncTask]);

	return [!!promises.size, runAsyncTask, startAsyncTask];
}

export function useRimeOption(option: string, defaultValue: boolean, deployStatus: number, localStorageKey?: string): [boolean, DispatchWithoutAction] {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const [value, setValue] = localStorageKey ? useLocalStorage(localStorageKey, defaultValue) : useState(defaultValue);

	useEffect(() => {
		async function setOption() {
			try {
				await Rime.setOption(option, value);
			}
			catch {
				notify("error", "套用選項", "applying the option");
			}
		}
		void setOption();
	}, [option, value, deployStatus]);

	useEffect(() =>
		subscribe("optionChanged", (rimeOption, rimeValue) => {
			if (rimeOption === option) {
				setValue(rimeValue);
			}
		}), [option, setValue]);

	return [value, useCallback(() => setValue(value => !value), [setValue])];
}

export function usePreferences() {
	return Object.fromEntries(
		Object.entries(DEFAULT_PREFERENCES).flatMap(([key, value]) => {
			// eslint-disable-next-line react-hooks/rules-of-hooks
			const [optionValue, setOptionValue] = useLocalStorage(
				key,
				value as never,
				key === "displayLanguages"
					? {
						raw: false,
						serializer(languages: Set<Language>) {
							return [...languages].join();
						},
						deserializer(values) {
							return new Set(values.split(",").map(value => value.trim() as Language));
						},
					}
					: typeof value === "string"
					? { raw: true }
					: undefined,
			);
			return [[key, optionValue], [`set${key[0].toUpperCase()}${key.slice(1)}`, setOptionValue]];
		}),
	) as PreferencesWithSetter;
}
